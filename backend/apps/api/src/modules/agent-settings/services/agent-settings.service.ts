import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentSettings } from '../../../../prisma/generated/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { UpdateAgentSettingsDto } from '../dto/update-agent-settings.dto';
import { AgentSettingsResponse } from '../types/agent-settings-response.type';
import { ErrorCode } from '../../../common/enums/error-code.enum';

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

  public async getByUserId(userId: string): Promise<AgentSettingsResponse> {
    const settings = await this.prismaService.agentSettings.findUnique({
      where: {
        userId,
      },
    });

    if (settings === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Agent settings not found',
        errorCode: ErrorCode.AGENT_SETTINGS_NOT_FOUND,
      });
    }

    return {
      isEnabled: settings.isEnabled,
      dailyLimitKzt: settings.dailyLimitKzt,
      perTransactionLimitKzt: settings.perTransactionLimitKzt,
      requireConfirmNewSeller: settings.requireConfirmNewSeller,
      updatedAt: settings.updatedAt.toISOString(),
    };
  }

  public async updateByUserId(
    userId: string,
    updateDto: UpdateAgentSettingsDto,
  ): Promise<AgentSettingsResponse> {
    const existingSettings = await this.prismaService.agentSettings.findUnique({
      where: {
        userId,
      },
    });

    if (existingSettings === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Agent settings not found',
        errorCode: ErrorCode.AGENT_SETTINGS_NOT_FOUND,
      });
    }

    const updatedSettings = await this.prismaService.agentSettings.update({
      where: {
        userId,
      },
      data: {
        isEnabled: updateDto.isEnabled,
        dailyLimitKzt: updateDto.dailyLimitKzt,
        perTransactionLimitKzt: updateDto.perTransactionLimitKzt,
        requireConfirmNewSeller: updateDto.requireConfirmNewSeller,
      },
    });

    return {
      isEnabled: updatedSettings.isEnabled,
      dailyLimitKzt: updatedSettings.dailyLimitKzt,
      perTransactionLimitKzt: updatedSettings.perTransactionLimitKzt,
      requireConfirmNewSeller: updatedSettings.requireConfirmNewSeller,
      updatedAt: updatedSettings.updatedAt.toISOString(),
    };
  }
}