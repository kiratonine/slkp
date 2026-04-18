import { Injectable } from '@nestjs/common';
import {
  BridgePaymentDecision,
  BridgePaymentStatus,
} from '../../../../prisma/generated/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AgentSettingsService } from '../../agent-settings/services/agent-settings.service';
import { BalancesService } from '../../balances/services/balances.service';
import { BridgePayDto } from '../dto/bridge-pay.dto';
import { BridgePayResponse } from '../types/bridge-pay-response.type';
import { BridgeIdempotencyService } from './bridge-idempotency.service';
import { BridgePaymentRequiredParserService } from './bridge-payment-required-parser.service';
import { BridgePaymentValidatorService } from './bridge-payment-validator.service';
import { BridgeSessionVerifierService } from './bridge-session-verifier.service';

@Injectable()
export class BridgeService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly balancesService: BalancesService,
    private readonly agentSettingsService: AgentSettingsService,
    private readonly bridgeSessionVerifierService: BridgeSessionVerifierService,
    private readonly bridgeIdempotencyService: BridgeIdempotencyService,
    private readonly bridgePaymentRequiredParserService: BridgePaymentRequiredParserService,
    private readonly bridgePaymentValidatorService: BridgePaymentValidatorService,
  ) {}

  public async pay(dto: BridgePayDto): Promise<BridgePayResponse> {
    const verifiedSession = await this.bridgeSessionVerifierService.verifySessionToken(
      dto.sessionToken,
    );

    const existing = await this.bridgeIdempotencyService.findExisting(
      verifiedSession.sessionId,
      dto.idempotencyKey,
    );

    if (existing !== null && existing.status === BridgePaymentStatus.SUCCEEDED) {
      return {
        status: 'ok',
        paymentId: existing.id,
        paymentSignatureB64: existing.paymentSignatureB64 ?? '',
        asset: existing.asset ?? '',
        amountAtomic: existing.amountAtomic ?? '',
        network: existing.network ?? '',
        estimatedKztDebit: existing.estimatedKztDebit ?? 0,
      };
    }

    if (existing !== null && existing.status === BridgePaymentStatus.FAILED) {
      return {
        status: 'rejected',
        paymentId: existing.id,
        reason: existing.rejectionReason ?? 'Payment was rejected',
      };
    }

    await this.bridgeIdempotencyService.ensureNoConflict(
      verifiedSession.sessionId,
      dto.idempotencyKey,
    );

    const payment = await this.bridgeIdempotencyService.createPending({
      agentSessionId: verifiedSession.sessionId,
      userId: verifiedSession.userId,
      idempotencyKey: dto.idempotencyKey,
      sellerUrl: dto.sellerUrl,
      paymentRequiredB64: dto.paymentRequiredB64,
      purpose: dto.purpose,
    });

    try {
      const decodedPayment = this.bridgePaymentRequiredParserService.parse(dto.paymentRequiredB64);

      const agentSettings = await this.agentSettingsService.getByUserId(verifiedSession.userId);
      const balance = await this.balancesService.getBalanceEntityByUserId(verifiedSession.userId);

      const validationResult = this.bridgePaymentValidatorService.validate({
        isAgentPaymentsEnabled: agentSettings.isEnabled,
        perTransactionLimitKzt: agentSettings.perTransactionLimitKzt,
        currentBalanceKzt: balance.amountKzt,
        payment: decodedPayment,
      });

      const approvedPayment = await this.prismaService.bridgePayment.update({
        where: {
          id: payment.id,
        },
        data: {
          decision: BridgePaymentDecision.APPROVED,
          status: BridgePaymentStatus.SUCCEEDED,
          amountAtomic: validationResult.amountAtomic,
          asset: validationResult.asset,
          network: validationResult.network,
          estimatedKztDebit: validationResult.estimatedKztDebit,
          paymentSignatureB64: this.createMockPaymentSignature(dto.paymentRequiredB64),
        },
      });

      return {
        status: 'ok',
        paymentId: approvedPayment.id,
        paymentSignatureB64: approvedPayment.paymentSignatureB64 ?? '',
        asset: approvedPayment.asset ?? '',
        amountAtomic: approvedPayment.amountAtomic ?? '',
        network: approvedPayment.network ?? '',
        estimatedKztDebit: approvedPayment.estimatedKztDebit ?? 0,
      };
    } catch (error: unknown) {
      const rejectionReason = this.extractErrorMessage(error);

      const rejectedPayment = await this.prismaService.bridgePayment.update({
        where: {
          id: payment.id,
        },
        data: {
          decision: BridgePaymentDecision.REJECTED,
          rejectionReason,
          status: BridgePaymentStatus.FAILED,
        },
      });

      return {
        status: 'rejected',
        paymentId: rejectedPayment.id,
        reason: rejectedPayment.rejectionReason ?? 'Payment was rejected',
      };
    }
  }

  private createMockPaymentSignature(paymentRequiredB64: string): string {
    const mockPayload = {
      type: 'mock-payment-signature',
      paymentRequiredB64,
      createdAt: new Date().toISOString(),
    };

    return Buffer.from(JSON.stringify(mockPayload), 'utf-8').toString('base64');
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: unknown }).response;

      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response &&
        typeof (response as { message?: unknown }).message === 'string'
      ) {
        return (response as { message: string }).message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Payment was rejected';
  }
}