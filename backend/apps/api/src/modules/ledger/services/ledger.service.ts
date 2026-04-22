import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ListLedgerResponse } from '../types/list-ledger-response.type';

@Injectable()
export class LedgerService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async listEntries(userId: string): Promise<ListLedgerResponse> {
    const entries = await this.prismaService.ledgerEntry.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        paymentId: entry.paymentId,
        amountKzt: entry.amountKzt,
        type: entry.type,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }
}