import { Injectable } from '@nestjs/common';
import { Balance } from '../../../../prisma/generated/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

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
}