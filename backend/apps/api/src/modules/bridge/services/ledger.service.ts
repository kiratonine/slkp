import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class LedgerService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createDebit(params: {
    userId: string;
    paymentId: string;
    amountKzt: number;
  }) {
    return this.prismaService.ledgerEntry.create({
      data: {
        userId: params.userId,
        paymentId: params.paymentId,
        amountKzt: -params.amountKzt,
        type: 'DEBIT',
      },
    });
  }

  public async getTodaySpent(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await this.prismaService.ledgerEntry.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
        },
      },
      _sum: {
        amountKzt: true,
      },
    });

    return Math.abs(result._sum.amountKzt ?? 0);
  }
}