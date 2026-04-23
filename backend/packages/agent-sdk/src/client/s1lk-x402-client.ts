import { S1lkX402BridgeRequestError } from '../errors/s1lk-x402-bridge-request.error';
import { S1lkX402PaymentRejectedError } from '../errors/s1lk-x402-payment-rejected.error';
import { S1lkX402SessionTokenMissingError } from '../errors/s1lk-x402-session-token-missing.error';
import { resolveSessionToken } from '../providers/session-token.provider';
import { BridgePayResponse } from '../types/bridge-pay-response.type';
import { CreateS1lkX402ClientOptions } from '../types/create-client-options.type';
import { extractPaymentRequired } from '../utils/extract-payment-required';
import { makeIdempotencyKey } from '../utils/make-idempotency-key';
import { mergeHeaders } from '../utils/merge-headers';

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

    const sessionToken = await resolveSessionToken(this.sessionToken, this.sessionTokenProvider);

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
      throw new S1lkX402BridgeRequestError(`Bridge request failed with status ${bridgeResponse.status}`);
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

    return this.fetchImpl(input, {
      ...init,
      headers: mergeHeaders(init?.headers, {
        'PAYMENT-SIGNATURE': bridgePayload.paymentSignatureB64,
      }),
    });
  }
}