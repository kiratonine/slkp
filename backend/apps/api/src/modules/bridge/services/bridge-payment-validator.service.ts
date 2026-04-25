import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import {
  MOCK_SOL_TO_KZT_RATE,
  MOCK_USDC_TO_KZT_RATE,
  SUPPORTED_ASSETS,
  SUPPORTED_NETWORKS,
} from '../constants/bridge-fx.constants';
import { DecodedPaymentRequired } from '../types/decoded-payment-required.type';

type ValidationInput = {
  isAgentPaymentsEnabled: boolean;
  perTransactionLimitKzt: number;
  currentBalanceKzt: number;
  payment: DecodedPaymentRequired;
};

type ValidationSuccess = {
  amountAtomic: string;
  asset: string;
  network: string;
  estimatedKztDebit: number;
};

@Injectable()
export class BridgePaymentValidatorService {
  public validate(input: ValidationInput): ValidationSuccess {
    if (!input.isAgentPaymentsEnabled) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Agent payments are disabled',
        errorCode: ErrorCode.AGENT_PAYMENTS_DISABLED,
      });
    }

    const normalizedNetwork = input.payment.network.toUpperCase() === 'SOLANA'
      ? 'solana'
      : input.payment.network.toLowerCase();

    if (!SUPPORTED_NETWORKS.includes(normalizedNetwork)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Unsupported network',
        errorCode: ErrorCode.UNSUPPORTED_NETWORK,
      });
    }

    const normalizedAsset = input.payment.token.toUpperCase();

    if (!SUPPORTED_ASSETS.includes(normalizedAsset)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Unsupported asset',
        errorCode: ErrorCode.UNSUPPORTED_ASSET,
      });
    }

    const parsedAmount = Number(input.payment.amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Malformed PAYMENT-REQUIRED payload',
        errorCode: ErrorCode.PAYMENT_REQUIRED_MALFORMED,
      });
    }

    const estimatedKztDebit = this.calculateKztDebit(normalizedAsset, parsedAmount);

    if (estimatedKztDebit > input.perTransactionLimitKzt) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Per transaction limit exceeded',
        errorCode: ErrorCode.PER_TX_LIMIT_EXCEEDED,
      });
    }

    if (estimatedKztDebit > input.currentBalanceKzt) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Insufficient funds',
        errorCode: ErrorCode.INSUFFICIENT_FUNDS,
      });
    }

    return {
      amountAtomic: input.payment.amountAtomic ?? input.payment.amount,
      asset: normalizedAsset,
      network: normalizedNetwork,
      estimatedKztDebit,
    };
  }

  private calculateKztDebit(asset: string, amount: number): number {
    if (asset === 'USDC') {
      return Math.ceil(amount * MOCK_USDC_TO_KZT_RATE);
    }

    if (asset === 'SOL') {
      return Math.ceil(amount * MOCK_SOL_TO_KZT_RATE);
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'Unsupported asset',
      errorCode: ErrorCode.UNSUPPORTED_ASSET,
    });
  }
}