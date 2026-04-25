import { Injectable, Logger } from '@nestjs/common';
import { X402PaymentResponse } from '../types/x402-payment-response.type';

@Injectable()
export class BridgeX402PaymentResponseParserService {
  private readonly logger = new Logger(BridgeX402PaymentResponseParserService.name);

  public extractTransactionSignature(paymentResponseB64?: string): string | null {
    if (paymentResponseB64 === undefined || paymentResponseB64.length === 0) {
      return null;
    }

    try {
      const decoded = Buffer.from(paymentResponseB64, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded) as unknown;

      if (typeof parsed !== 'object' || parsed === null) {
        return null;
      }

      const response = parsed as X402PaymentResponse;

      const directSignature =
        this.getString(response.transaction) ??
        this.getString(response.txSignature) ??
        this.getString(response.signature) ??
        this.getString(response.transactionHash);

      if (directSignature !== null) {
        return directSignature;
      }

      const nestedSignature = this.findTransactionLikeValue(response);

      if (nestedSignature !== null) {
        return nestedSignature;
      }

      this.logger.warn(`Could not extract tx signature from PAYMENT-RESPONSE: ${decoded}`);

      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`Failed to parse PAYMENT-RESPONSE: ${error.message}`);
      }

      return null;
    }
  }

  private getString(value: unknown): string | null {
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }

    return null;
  }

  private findTransactionLikeValue(value: unknown): string | null {
    if (typeof value !== 'object' || value === null) {
      return null;
    }

    const candidate = value as Record<string, unknown>;

    for (const [key, nestedValue] of Object.entries(candidate)) {
      const normalizedKey = key.toLowerCase();

      if (
        typeof nestedValue === 'string' &&
        nestedValue.length > 0 &&
        (normalizedKey.includes('transaction') ||
          normalizedKey.includes('signature') ||
          normalizedKey.includes('tx'))
      ) {
        return nestedValue;
      }

      const nestedResult = this.findTransactionLikeValue(nestedValue);

      if (nestedResult !== null) {
        return nestedResult;
      }
    }

    return null;
  }
}