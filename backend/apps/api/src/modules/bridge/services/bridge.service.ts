import { Injectable } from '@nestjs/common';
import {
  BridgePaymentDecision,
  BridgePaymentStatus,
} from '../../../../prisma/generated/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { BridgePayDto } from '../dto/bridge-pay.dto';
import { BridgePayResponse } from '../types/bridge-pay-response.type';
import { BridgeIdempotencyService } from './bridge-idempotency.service';
import { BridgeSessionVerifierService } from './bridge-session-verifier.service';

@Injectable()
export class BridgeService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly bridgeSessionVerifierService: BridgeSessionVerifierService,
    private readonly bridgeIdempotencyService: BridgeIdempotencyService,
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

    const rejected = await this.prismaService.bridgePayment.update({
      where: {
        id: payment.id,
      },
      data: {
        decision: BridgePaymentDecision.REJECTED,
        rejectionReason: 'Bridge payment execution is not implemented yet',
        status: BridgePaymentStatus.FAILED,
      },
    });

    return {
      status: 'rejected',
      paymentId: rejected.id,
      reason: rejected.rejectionReason ?? 'Payment was rejected',
    };
  }
}