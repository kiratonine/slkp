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
import { SolanaService } from '../../solana/services/solana.service';

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
    private readonly solanaService: SolanaService,
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

      let solanaTransferResult:
        | {
            signature: string;
            toAddress: string;
          }
        | null = null;

      if (validationResult.asset === 'SOL') {
        if (decodedPayment.payTo === undefined || decodedPayment.payTo.length === 0) {
          throw new Error('Missing payTo address for SOL payment');
        }

        solanaTransferResult = await this.solanaService.transferSol({
          toAddress: decodedPayment.payTo,
          amountSol: Number(validationResult.amountAtomic),
        });
      }

      const result = await this.prismaService.$transaction(async (tx) => {
        const balanceEntity = await tx.balance.findUnique({
          where: { userId: verifiedSession.userId },
        });

        if (balanceEntity === null) {
          throw new Error('Balance not found');
        }

        const todaySpent = await tx.ledgerEntry.aggregate({
          where: {
            userId: verifiedSession.userId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          _sum: {
            amountKzt: true,
          },
        });

        const spentToday = Math.abs(todaySpent._sum.amountKzt ?? 0);

        if (spentToday + validationResult.estimatedKztDebit > agentSettings.dailyLimitKzt) {
          throw new Error('Daily limit exceeded');
        }

        if (balanceEntity.amountKzt < validationResult.estimatedKztDebit) {
          throw new Error('Insufficient funds');
        }

        await tx.balance.update({
          where: { userId: verifiedSession.userId },
          data: {
            amountKzt: {
              decrement: validationResult.estimatedKztDebit,
            },
          },
        });

        const updatedPayment = await tx.bridgePayment.update({
          where: { id: payment.id },
          data: {
            decision: BridgePaymentDecision.APPROVED,
            status: BridgePaymentStatus.SUCCEEDED,
            amountAtomic: validationResult.amountAtomic,
            asset: validationResult.asset,
            network: validationResult.network,
            estimatedKztDebit: validationResult.estimatedKztDebit,
            paymentSignatureB64: this.createMockPaymentSignature(dto.paymentRequiredB64),
            executedAt: new Date(),
            solanaTxSignature: solanaTransferResult?.signature ?? null,
            payToAddress: decodedPayment.payTo ?? null,
          },
        });

        await tx.ledgerEntry.create({
          data: {
            userId: verifiedSession.userId,
            paymentId: payment.id,
            amountKzt: -validationResult.estimatedKztDebit,
            type: 'DEBIT',
          },
        });

        return updatedPayment;
      });

      return {
        status: 'ok',
        paymentId: result.id,
        paymentSignatureB64: result.paymentSignatureB64 ?? '',
        asset: result.asset ?? '',
        amountAtomic: result.amountAtomic ?? '',
        network: result.network ?? '',
        estimatedKztDebit: result.estimatedKztDebit ?? 0,
      };
    } catch (error: unknown) {
      let rejectionReason = this.extractErrorMessage(error);
      rejectionReason = this.normalizeRejectionReason(rejectionReason);

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

  private normalizeRejectionReason(reason: string): string {
    if (reason.includes('Daily limit')) {
      return 'Daily limit exceeded';
    }

    if (reason.includes('Insufficient funds')) {
      return 'Insufficient funds';
    }

    if (reason.includes('Malformed')) {
      return 'Malformed PAYMENT-REQUIRED payload';
    }

    if (reason.includes('Missing payTo')) {
      return 'Missing payTo address for SOL payment';
    }

    if (reason.includes('TREASURY_PRIVATE_KEY')) {
      return 'Treasury wallet is not configured';
    }

    return 'Payment rejected';
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