import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { x402Client } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { ExactSvmScheme } from '@x402/svm/exact/client';
import { createKeyPairSignerFromBytes } from '@solana/kit';
import bs58 from 'bs58';

@Injectable()
export class BridgeX402PaymentSignerService {
  private readonly logger = new Logger(BridgeX402PaymentSignerService.name);

  public constructor(private readonly configService: ConfigService) {}

  public async createPaymentSignature(params: {
    sellerUrl: string;
    paymentRequiredB64: string;
  }): Promise<string> {
    const treasuryPrivateKey =
      this.configService.get<string>('treasuryPrivateKey') ??
      process.env.TREASURY_PRIVATE_KEY ??
      '';

    if (treasuryPrivateKey.length === 0) {
      throw new InternalServerErrorException('TREASURY_PRIVATE_KEY is not configured');
    }

    const signer = await createKeyPairSignerFromBytes(bs58.decode(treasuryPrivateKey));

    const client = new x402Client();

    client.register('solana:*', new ExactSvmScheme(signer));

    let callCount = 0;
    let capturedPaymentSignature: string | null = null;

    const fakeFetch: typeof fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      callCount += 1;

      if (callCount === 1) {
        return new Response('{}', {
          status: 402,
          headers: {
            'Content-Type': 'application/json',
            'PAYMENT-REQUIRED': params.paymentRequiredB64,
          },
        });
      }

      const requestHeaders = this.extractHeadersFromFetchArgs(input, init);

      capturedPaymentSignature =
        requestHeaders.get('PAYMENT-SIGNATURE') ??
        requestHeaders.get('payment-signature');

      if (capturedPaymentSignature === null || capturedPaymentSignature.length === 0) {
        throw new InternalServerErrorException(
          'Official x402 client did not generate PAYMENT-SIGNATURE',
        );
      }

      this.logger.log(
        `Canonical x402 PAYMENT-SIGNATURE generated. length=${capturedPaymentSignature.length}`,
      );

      return new Response(
        JSON.stringify({
          ok: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    };

    const paidFetch = wrapFetchWithPayment(fakeFetch, client);

    await paidFetch(params.sellerUrl, {
      method: 'GET',
    });

    if (!capturedPaymentSignature) {
      throw new InternalServerErrorException('PAYMENT-SIGNATURE was not captured');
    }

    return capturedPaymentSignature;
  }

  private extractHeadersFromFetchArgs(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Headers {
    const headers = new Headers();

    if (input instanceof Request) {
      input.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    if (init?.headers !== undefined) {
      const initHeaders = new Headers(init.headers);

      initHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    return headers;
  }
}