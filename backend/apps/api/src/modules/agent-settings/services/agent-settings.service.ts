import { Injectable } from '@nestjs/common';
import { AgentSettings } from '../../../../prisma/generated/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AgentSettingsService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createDefaultSettings(userId: string): Promise<AgentSettings> {
    return this.prismaService.agentSettings.create({
      data: {
        userId,
        isEnabled: false,
        dailyLimitKzt: 0,
        perTransactionLimitKzt: 0,
        requireConfirmNewSeller: true,
      },
    });
  }
}