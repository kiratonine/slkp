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
import { ListBridgePaymentsResponse } from '../types/list-bridge-payments-response.type';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GetBridgePaymentResponse } from '../types/get-bridge-payment-response.type';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { BridgeX402PaymentSignerService } from './bridge-x402-payment-signer.service';
import { ConfirmBridgePaymentDto } from '../dto/confirm-bridge-payment.dto';
import { ConfirmBridgePaymentResponse } from '../types/confirm-bridge-payment-response.type';
import { BridgeX402PaymentResponseParserService } from './bridge-x402-payment-response-parser.service';


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
    private readonly bridgeX402PaymentSignerService: BridgeX402PaymentSignerService,
    private readonly bridgeX402PaymentResponseParserService: BridgeX402PaymentResponseParserService,
  ) { }

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

    if (
      existing !== null &&
      existing.status === BridgePaymentStatus.PENDING &&
      existing.paymentSignatureB64 !== null
    ) {
      return {
        status: 'ok',
        paymentId: existing.id,
        paymentSignatureB64: existing.paymentSignatureB64,
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
      const parsedPaymentRequired = this.bridgePaymentRequiredParserService.parse(
        dto.paymentRequiredB64,
      );

      const decodedPayment = parsedPaymentRequired.payment;

      const agentSettings = await this.agentSettingsService.getByUserId(verifiedSession.userId);
      const balance = await this.balancesService.getBalanceEntityByUserId(verifiedSession.userId);

      const validationResult = this.bridgePaymentValidatorService.validate({
        isAgentPaymentsEnabled: agentSettings.isEnabled,
        perTransactionLimitKzt: agentSettings.perTransactionLimitKzt,
        currentBalanceKzt: balance.amountKzt,
        payment: decodedPayment,
      });

      let paymentSignatureB64 = this.createMockPaymentSignature(dto.paymentRequiredB64);

      if (parsedPaymentRequired.kind === 'x402') {
        paymentSignatureB64 = await this.bridgeX402PaymentSignerService.createPaymentSignature({
          sellerUrl: dto.sellerUrl,
          paymentRequiredB64: dto.paymentRequiredB64,
        });
      }

      let solanaTransferResult:
        | {
          signature: string;
          toAddress: string;
        }
        | null = null;

      if (validationResult.asset === 'SOL') {
        if (decodedPayment.payTo === undefined || decodedPayment.payTo.length === 0) {
          throw new BadRequestException({
            statusCode: 400,
            message: 'Missing payTo address for SOL payment',
            errorCode: ErrorCode.PAYMENT_REQUIRED_MALFORMED,
          });
        }

        solanaTransferResult = await this.solanaService.transferSol({
          toAddress: decodedPayment.payTo,
          amountSol: Number(validationResult.amountAtomic),
        });
      }

      const result = await this.prismaService.bridgePayment.update({
        where: {
          id: payment.id,
        },
        data: {
          decision: BridgePaymentDecision.APPROVED,
          status: BridgePaymentStatus.PENDING,
          amountAtomic: validationResult.amountAtomic,
          asset: validationResult.asset,
          network: validationResult.network,
          estimatedKztDebit: validationResult.estimatedKztDebit,
          paymentSignatureB64,
          payToAddress: decodedPayment.payTo ?? null,
        },
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

    if (reason.includes('Agent payments are disabled')) {
      return 'Agent payments are disabled';
    }

    if (reason.includes('Unsupported network')) {
      return 'Unsupported network';
    }

    if (reason.includes('Unsupported asset')) {
      return 'Unsupported asset';
    }

    if (reason.includes('Balance not found')) {
      return 'Balance not found';
    }

    if (reason.includes('Treasury wallet is not configured')) {
      return 'Treasury wallet is not configured';
    }

    return reason;
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
        'message' in response
      ) {
        const message = (response as { message?: unknown }).message;

        if (typeof message === 'string') {
          return message;
        }

        if (Array.isArray(message)) {
          return message.join(', ');
        }
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Payment was rejected';
  }

  public async listPayments(userId: string): Promise<ListBridgePaymentsResponse> {
    const payments = await this.prismaService.bridgePayment.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      payments: payments.map((payment) => ({
        id: payment.id,
        sellerUrl: payment.sellerUrl,
        purpose: payment.purpose,
        amountAtomic: payment.amountAtomic,
        asset: payment.asset,
        network: payment.network,
        estimatedKztDebit: payment.estimatedKztDebit,
        status: payment.status,
        decision: payment.decision,
        rejectionReason: payment.rejectionReason,
        paymentResponseB64: payment.paymentResponseB64,
        solanaTxSignature: payment.solanaTxSignature,
        payToAddress: payment.payToAddress,
        executedAt: payment.executedAt?.toISOString() ?? null,
        createdAt: payment.createdAt.toISOString(),
      })),
    };
  }

  public async getPaymentById(
    userId: string,
    paymentId: string,
  ): Promise<GetBridgePaymentResponse> {
    const payment = await this.prismaService.bridgePayment.findFirst({
      where: {
        id: paymentId,
        userId,
      },
    });

    if (payment === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Bridge payment not found',
        errorCode: ErrorCode.BRIDGE_PAYMENT_NOT_FOUND,
      });
    }

    return {
      payment: {
        id: payment.id,
        sellerUrl: payment.sellerUrl,
        purpose: payment.purpose,
        amountAtomic: payment.amountAtomic,
        asset: payment.asset,
        network: payment.network,
        estimatedKztDebit: payment.estimatedKztDebit,
        status: payment.status,
        decision: payment.decision,
        rejectionReason: payment.rejectionReason,
        paymentResponseB64: payment.paymentResponseB64,
        solanaTxSignature: payment.solanaTxSignature,
        payToAddress: payment.payToAddress,
        executedAt: payment.executedAt?.toISOString() ?? null,
        createdAt: payment.createdAt.toISOString(),
      },
    };
  }

  public async confirmPayment(params: {
    paymentId: string;
    dto: ConfirmBridgePaymentDto;
  }): Promise<ConfirmBridgePaymentResponse> {
    const verifiedSession = await this.bridgeSessionVerifierService.verifySessionToken(
      params.dto.sessionToken,
    );

    const payment = await this.prismaService.bridgePayment.findFirst({
      where: {
        id: params.paymentId,
        userId: verifiedSession.userId,
        agentSessionId: verifiedSession.sessionId,
      },
    });

    if (payment === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Bridge payment not found',
        errorCode: ErrorCode.BRIDGE_PAYMENT_NOT_FOUND,
      });
    }

    if (payment.status === BridgePaymentStatus.SUCCEEDED) {
      const existingLedgerEntry = await this.prismaService.ledgerEntry.findFirst({
        where: {
          paymentId: payment.id,
        },
      });

      return {
        status: 'confirmed',
        paymentId: payment.id,
        ledgerEntryId: existingLedgerEntry?.id ?? null,
        estimatedKztDebit: payment.estimatedKztDebit ?? 0,
      };
    }

    if (payment.status === BridgePaymentStatus.FAILED) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Cannot confirm failed bridge payment',
        errorCode: ErrorCode.BRIDGE_PAYMENT_ALREADY_FAILED,
      });
    }

    if (
      payment.decision !== BridgePaymentDecision.APPROVED ||
      payment.estimatedKztDebit === null
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Bridge payment is not approved',
        errorCode: ErrorCode.BRIDGE_PAYMENT_NOT_APPROVED,
      });
    }

    const result = await this.prismaService.$transaction(async (tx) => {
      const currentPayment = await tx.bridgePayment.findUnique({
        where: {
          id: payment.id,
        },
      });

      if (currentPayment === null) {
        throw new NotFoundException({
          statusCode: 404,
          message: 'Bridge payment not found',
          errorCode: ErrorCode.BRIDGE_PAYMENT_NOT_FOUND,
        });
      }

      if (currentPayment.status === BridgePaymentStatus.SUCCEEDED) {
        const existingLedgerEntry = await tx.ledgerEntry.findFirst({
          where: {
            paymentId: currentPayment.id,
          },
        });

        return {
          payment: currentPayment,
          ledgerEntry: existingLedgerEntry,
        };
      }

      const balance = await tx.balance.findUnique({
        where: {
          userId: verifiedSession.userId,
        },
      });

      if (balance === null) {
        throw new NotFoundException({
          statusCode: 404,
          message: 'Balance not found',
          errorCode: ErrorCode.BALANCE_NOT_FOUND,
        });
      }

      const agentSettings = await tx.agentSettings.findUnique({
        where: {
          userId: verifiedSession.userId,
        },
      });

      if (agentSettings === null) {
        throw new NotFoundException({
          statusCode: 404,
          message: 'Agent settings not found',
          errorCode: ErrorCode.AGENT_SETTINGS_NOT_FOUND,
        });
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
      const debitAmount = currentPayment.estimatedKztDebit ?? 0;

      if (spentToday + debitAmount > agentSettings.dailyLimitKzt) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Daily limit exceeded',
          errorCode: ErrorCode.DAILY_LIMIT_EXCEEDED,
        });
      }

      if (balance.amountKzt < debitAmount) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Insufficient funds',
          errorCode: ErrorCode.INSUFFICIENT_FUNDS,
        });
      }

      await tx.balance.update({
        where: {
          userId: verifiedSession.userId,
        },
        data: {
          amountKzt: {
            decrement: debitAmount,
          },
        },
      });

      const solanaTxSignature =
        this.bridgeX402PaymentResponseParserService.extractTransactionSignature(
          params.dto.paymentResponseB64,
        );

      const updatedPayment = await tx.bridgePayment.update({
        where: {
          id: currentPayment.id,
        },
        data: {
          status: BridgePaymentStatus.SUCCEEDED,
          executedAt: new Date(),
          paymentResponseB64: params.dto.paymentResponseB64 ?? null,
          solanaTxSignature: solanaTxSignature ?? currentPayment.solanaTxSignature,
        },
      });

      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          userId: verifiedSession.userId,
          paymentId: currentPayment.id,
          amountKzt: -debitAmount,
          type: 'DEBIT',
        },
      });

      return {
        payment: updatedPayment,
        ledgerEntry,
      };
    });

    return {
      status: 'confirmed',
      paymentId: result.payment.id,
      ledgerEntryId: result.ledgerEntry?.id ?? null,
      estimatedKztDebit: result.payment.estimatedKztDebit ?? 0,
    };
  }
}