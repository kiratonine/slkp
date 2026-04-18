import { Injectable, NotFoundException } from '@nestjs/common';
import { Balance } from '../../../../prisma/generated/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { BalanceResponse } from '../types/balance-response.type';

@Injectable()
export class BalancesService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createInitialBalance(userId: string, amountKzt: number): Promise<Balance> {
    return this.prismaService.balance.create({
      data: {
        userId,
        amountKzt,
      },
    });
  }

  public async getBalanceByUserId(userId: string): Promise<BalanceResponse> {
    const balance = await this.prismaService.balance.findUnique({
      where: {
        userId,
      },
    });

    if (balance === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Balance not found',
      });
    }

    return {
      amountKzt: balance.amountKzt,
      updatedAt: balance.updatedAt.toISOString(),
    };
  }

  public async getBalanceEntityByUserId(userId: string) {
    const balance = await this.prismaService.balance.findUnique({
      where: {
        userId,
      },
    });

    if (balance === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Balance not found',
      });
    }

    return balance;
  }
}