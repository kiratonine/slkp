import { BadRequestException, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { DecodedPaymentRequired } from '../types/decoded-payment-required.type';

@Injectable()
export class BridgePaymentRequiredParserService {
  public parse(paymentRequiredB64: string): DecodedPaymentRequired {
    let parsedValue: unknown;

    try {
      const decoded = Buffer.from(paymentRequiredB64, 'base64').toString('utf-8');
      parsedValue = JSON.parse(decoded);
    } catch {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Malformed PAYMENT-REQUIRED payload',
        errorCode: ErrorCode.PAYMENT_REQUIRED_MALFORMED,
      });
    }

    if (!this.isDecodedPaymentRequired(parsedValue)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Malformed PAYMENT-REQUIRED payload',
        errorCode: ErrorCode.PAYMENT_REQUIRED_MALFORMED,
      });
    }

    return parsedValue;
  }

  private isDecodedPaymentRequired(value: unknown): value is DecodedPaymentRequired {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      typeof candidate.seller === 'string' &&
      typeof candidate.amount === 'string' &&
      typeof candidate.token === 'string' &&
      typeof candidate.network === 'string' &&
      (candidate.payTo === undefined || typeof candidate.payTo === 'string') &&
      (candidate.purpose === undefined || typeof candidate.purpose === 'string')
    );
  }
}