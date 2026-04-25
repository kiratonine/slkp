import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import {
  DecodedPaymentRequired,
  ParsedPaymentRequired,
  X402PaymentRequiredObject,
  X402PaymentRequirement,
} from '../types/decoded-payment-required.type';

const SOLANA_DEVNET_CAIP2 = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';

const SOLANA_DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

const USDC_DECIMALS = 6;

@Injectable()
export class BridgePaymentRequiredParserService {
  private readonly logger = new Logger(BridgePaymentRequiredParserService.name);

  public parse(paymentRequiredB64: string): ParsedPaymentRequired {
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

    if (this.isLegacyDecodedPaymentRequired(parsedValue)) {
      return {
        kind: 'legacy',
        payment: parsedValue,
      };
    }

    if (this.isX402PaymentRequired(parsedValue)) {
      return {
        kind: 'x402',
        payment: this.normalizeX402PaymentRequired(parsedValue),
        raw: parsedValue,
      };
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'Malformed PAYMENT-REQUIRED payload',
      errorCode: ErrorCode.PAYMENT_REQUIRED_MALFORMED,
    });
  }

  private isLegacyDecodedPaymentRequired(value: unknown): value is DecodedPaymentRequired {
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

  private isX402PaymentRequired(value: unknown): value is X402PaymentRequiredObject {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      candidate.x402Version === 2 &&
      Array.isArray(candidate.accepts) &&
      candidate.accepts.length > 0
    );
  }

  private normalizeX402PaymentRequired(value: X402PaymentRequiredObject): DecodedPaymentRequired {
    const accept = this.selectSupportedAccept(value.accepts ?? []);

    const token = this.resolveTokenFromAsset(accept.asset);
    const normalizedNetwork = this.normalizeNetwork(accept.network);
    const amount = this.normalizeAtomicAmount({
      atomicAmount: accept.amount,
      token,
    });

    return {
      seller: value.resource?.url ?? 'x402-protected-resource',
      amount,
      token,
      network: normalizedNetwork,
      payTo: accept.payTo,
      purpose: value.resource?.description,
      assetMint: accept.asset,
      amountAtomic: accept.amount,
    };
  }

  private selectSupportedAccept(accepts: X402PaymentRequirement[]): X402PaymentRequirement {
    const supported = accepts.find((accept) => {
      return (
        accept.scheme === 'exact' &&
        accept.network === SOLANA_DEVNET_CAIP2 &&
        accept.asset === SOLANA_DEVNET_USDC_MINT &&
        typeof accept.amount === 'string' &&
        typeof accept.payTo === 'string'
      );
    });

    if (supported === undefined) {
      this.logger.error(`Unsupported x402 accepts=${JSON.stringify(accepts, null, 2)}`);

      throw new BadRequestException({
        statusCode: 400,
        message: 'Unsupported x402 payment requirement',
        errorCode: ErrorCode.PAYMENT_REQUIRED_MALFORMED,
      });
    }

    return supported;
  }

  private resolveTokenFromAsset(asset: string | undefined): string {
    if (asset === SOLANA_DEVNET_USDC_MINT) {
      return 'USDC';
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'Unsupported x402 asset',
      errorCode: ErrorCode.UNSUPPORTED_ASSET,
    });
  }

  private normalizeNetwork(network: string | undefined): string {
    if (network === SOLANA_DEVNET_CAIP2) {
      return 'solana';
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'Unsupported x402 network',
      errorCode: ErrorCode.UNSUPPORTED_NETWORK,
    });
  }

  private normalizeAtomicAmount(params: {
    atomicAmount: string | undefined;
    token: string;
  }): string {
    if (typeof params.atomicAmount !== 'string' || params.atomicAmount.length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Malformed PAYMENT-REQUIRED payload',
        errorCode: ErrorCode.PAYMENT_REQUIRED_MALFORMED,
      });
    }

    if (!/^\d+$/.test(params.atomicAmount)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Malformed PAYMENT-REQUIRED payload',
        errorCode: ErrorCode.PAYMENT_REQUIRED_MALFORMED,
      });
    }

    if (params.token === 'USDC') {
      return this.atomicToDecimal(params.atomicAmount, USDC_DECIMALS);
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'Unsupported asset',
      errorCode: ErrorCode.UNSUPPORTED_ASSET,
    });
  }

  private atomicToDecimal(atomicAmount: string, decimals: number): string {
    const normalized = atomicAmount.padStart(decimals + 1, '0');

    const integerPart = normalized.slice(0, normalized.length - decimals);
    const fractionalPart = normalized
      .slice(normalized.length - decimals)
      .replace(/0+$/, '');

    if (fractionalPart.length === 0) {
      return integerPart;
    }

    return `${integerPart}.${fractionalPart}`;
  }
}