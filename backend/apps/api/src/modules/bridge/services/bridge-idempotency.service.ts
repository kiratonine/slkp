import { ConflictException, Injectable } from '@nestjs/common';
import { BridgePaymentStatus } from '../../../../prisma/generated/client';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class BridgeIdempotencyService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findExisting(agentSessionId: string, idempotencyKey: string) {
    return this.prismaService.bridgePayment.findUnique({
      where: {
        agentSessionId_idempotencyKey: {
          agentSessionId,
          idempotencyKey,
        },
      },
    });
  }

  public async createPending(params: {
    agentSessionId: string;
    userId: string;
    idempotencyKey: string;
    sellerUrl: string;
    paymentRequiredB64: string;
    purpose?: string;
  }) {
    return this.prismaService.bridgePayment.create({
      data: {
        agentSessionId: params.agentSessionId,
        userId: params.userId,
        idempotencyKey: params.idempotencyKey,
        sellerUrl: params.sellerUrl,
        paymentRequiredB64: params.paymentRequiredB64,
        purpose: params.purpose,
        status: BridgePaymentStatus.PENDING,
      },
    });
  }

  public async ensureNoConflict(agentSessionId: string, idempotencyKey: string): Promise<void> {
    const existing = await this.findExisting(agentSessionId, idempotencyKey);

    if (existing !== null && existing.status === BridgePaymentStatus.PENDING) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Idempotency key is already in progress',
        errorCode: ErrorCode.IDEMPOTENCY_CONFLICT,
      });
    }
  }
}