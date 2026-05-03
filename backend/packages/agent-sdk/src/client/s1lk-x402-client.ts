import { S1lkX402BridgeRequestError } from '../errors/s1lk-x402-bridge-request.error.js';
import { S1lkX402PaymentRejectedError } from '../errors/s1lk-x402-payment-rejected.error.js';
import { S1lkX402SessionTokenMissingError } from '../errors/s1lk-x402-session-token-missing.error.js';
import { BridgePayResponse } from '../types/bridge-pay-response.type.js';
import { CreateS1lkX402ClientOptions } from '../types/create-client-options.type.js';
import { extractPaymentRequired } from '../utils/extract-payment-required.js';
import { makeIdempotencyKey } from '../utils/make-idempotency-key.js';
import { mergeHeaders } from '../utils/merge-headers.js';

export class S1lkX402Client {
  private readonly bridgeBaseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly sessionTokenProvider?: CreateS1lkX402ClientOptions['sessionTokenProvider'];
  private readonly onLog?: CreateS1lkX402ClientOptions['onLog'];
  private readonly onPaymentRequired?: CreateS1lkX402ClientOptions['onPaymentRequired'];
  private readonly onPaymentApproved?: CreateS1lkX402ClientOptions['onPaymentApproved'];
  private readonly onPaymentRejected?: CreateS1lkX402ClientOptions['onPaymentRejected'];

  private sessionToken: string | null = null;

  public constructor(options: CreateS1lkX402ClientOptions) {
    this.bridgeBaseUrl = options.bridgeBaseUrl;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.sessionTokenProvider = options.sessionTokenProvider;
    this.onLog = options.onLog;
    this.onPaymentRequired = options.onPaymentRequired;
    this.onPaymentApproved = options.onPaymentApproved;
    this.onPaymentRejected = options.onPaymentRejected;
  }

  public setSessionToken(token: string): void {
    this.sessionToken = token;
  }

  public clearSessionToken(): void {
    this.sessionToken = null;
  }

  public async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    this.onLog?.('Sending original request');

    const firstResponse = await this.fetchImpl(input, init);

    if (firstResponse.status !== 402) {
      return firstResponse;
    }

    const sellerUrl = typeof input === 'string' ? input : input.toString();

    this.onLog?.('Received 402 Payment Required', { sellerUrl });
    await this.onPaymentRequired?.(sellerUrl);

    const paymentRequiredB64 = await extractPaymentRequired(firstResponse);
    const sessionToken = await this.resolveSessionToken();

    if (sessionToken === null || sessionToken.length === 0) {
      throw new S1lkX402SessionTokenMissingError();
    }

    const bridgeResponse = await this.fetchImpl(`${this.bridgeBaseUrl}/bridge/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken,
        sellerUrl,
        paymentRequiredB64,
        idempotencyKey: makeIdempotencyKey(),
      }),
    });

    if (!bridgeResponse.ok) {
      const errorDetails = await this.readErrorResponse(bridgeResponse);

      throw new S1lkX402BridgeRequestError(
        `Bridge request failed with status ${bridgeResponse.status}. ${errorDetails}`,
      );
    }

    const bridgePayload = (await bridgeResponse.json()) as BridgePayResponse;

    if (bridgePayload.status !== 'ok') {
      await this.onPaymentRejected?.(bridgePayload.reason);
      throw new S1lkX402PaymentRejectedError(bridgePayload.reason);
    }

    await this.onPaymentApproved?.(bridgePayload.paymentId);

    this.onLog?.('Retrying request with PAYMENT-SIGNATURE', {
      paymentId: bridgePayload.paymentId,
    });

    const retryResponse = await this.fetchImpl(input, {
      ...init,
      headers: mergeHeaders(init?.headers, {
        'PAYMENT-SIGNATURE': bridgePayload.paymentSignatureB64,
      }),
    });

    this.onLog?.('Seller retry response received', {
      status: retryResponse.status,
    });

    if (retryResponse.status === 402) {
      const rejectionDetails = await this.readSeller402Details(retryResponse);

      throw new S1lkX402BridgeRequestError(
        `Seller rejected PAYMENT-SIGNATURE. ${rejectionDetails}`,
      );
    }

    if (!retryResponse.ok) {
      throw new S1lkX402BridgeRequestError(
        `Seller retry failed with status ${retryResponse.status}`,
      );
    }

    const paymentResponseB64 =
      retryResponse.headers.get('PAYMENT-RESPONSE') ??
      retryResponse.headers.get('payment-response') ??
      retryResponse.headers.get('X-PAYMENT-RESPONSE') ??
      retryResponse.headers.get('x-payment-response') ??
      undefined;

    this.onLog?.('Confirming bridge payment after seller success', {
      paymentId: bridgePayload.paymentId,
      hasPaymentResponse: paymentResponseB64 !== undefined,
    });

    await this.confirmBridgePayment({
      paymentId: bridgePayload.paymentId,
      sessionToken,
      paymentResponseB64,
    });

    this.onLog?.('Bridge payment finalized', {
      paymentId: bridgePayload.paymentId,
    });

    return retryResponse;
  }

  private async resolveSessionToken(): Promise<string | null> {
    if (this.sessionToken !== null && this.sessionToken.length > 0) {
      return this.sessionToken;
    }

    if (this.sessionTokenProvider !== undefined) {
      return this.sessionTokenProvider();
    }

    return null;
  }

  private async readSeller402Details(response: Response): Promise<string> {
    const paymentRequiredHeader =
      response.headers.get('PAYMENT-REQUIRED') ??
      response.headers.get('payment-required');

    if (paymentRequiredHeader !== null && paymentRequiredHeader.length > 0) {
      const decoded = this.tryDecodeBase64Json(paymentRequiredHeader);

      if (decoded !== null) {
        this.onLog?.('Seller retry 402 PAYMENT-REQUIRED decoded', decoded);

        return `Seller returned 402 with x402 error: ${JSON.stringify(decoded)}`;
      }

      return 'Seller returned 402 with PAYMENT-REQUIRED header, but it could not be decoded.';
    }

    try {
      const bodyText = await response.clone().text();

      if (bodyText.length > 0) {
        this.onLog?.('Seller retry 402 body', { bodyText });
        return `Seller returned 402 body: ${bodyText}`;
      }
    } catch {
      // ignore
    }

    return 'Seller returned 402 without readable error details.';
  }

  private tryDecodeBase64Json(value: string): Record<string, unknown> | null {
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded) as unknown;

      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, unknown>;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async confirmBridgePayment(params: {
    paymentId: string;
    sessionToken: string;
    paymentResponseB64?: string;
  }): Promise<void> {
    const response = await this.fetchImpl(
      `${this.bridgeBaseUrl}/bridge/payments/${params.paymentId}/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken: params.sessionToken,
          paymentResponseB64: params.paymentResponseB64,
        }),
      },
    );

    if (!response.ok) {
      throw new S1lkX402BridgeRequestError(
        `Bridge confirm failed with status ${response.status}`,
      );
    }
  }

  private async readErrorResponse(response: Response): Promise<string> {
    try {
      const bodyText = await response.clone().text();

      if (bodyText.length === 0) {
        return 'Empty response body.';
      }

      return `Response body: ${bodyText}`;
    } catch {
      return 'Failed to read response body.';
    }
  }
}