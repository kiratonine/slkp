import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentSessionStatus } from '../../../../prisma/generated/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AgentSessionStatusEnum } from '../enums/agent-session-status.enum';
import { CreateAgentSessionDto } from '../dto/create-agent-session.dto';
import { CreateAgentSessionResponse } from '../types/create-agent-session-response.type';
import { ListAgentSessionsResponse } from '../types/list-agent-sessions-response.type';
import { RevokeAgentSessionResponse } from '../types/revoke-agent-session-response.type';
import { AgentSessionTokenService } from './agent-session-token.service';
import { GetAgentSessionResponse } from '../types/get-agent-session-response.type';
import { ErrorCode } from '../../../common/enums/error-code.enum';

@Injectable()
export class AgentSessionsService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly agentSessionTokenService: AgentSessionTokenService,
  ) {}

  public async create(
    userId: string,
    createDto: CreateAgentSessionDto,
  ): Promise<CreateAgentSessionResponse> {
    const agentSettings = await this.prismaService.agentSettings.findUnique({
      where: {
        userId,
      },
    });

    if (agentSettings === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Agent settings not found',
        errorCode: ErrorCode.AGENT_SETTINGS_NOT_FOUND,
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + createDto.expiresInDays);

    const createdSession = await this.prismaService.agentSession.create({
      data: {
        userId,
        name: createDto.name,
        tokenHash: 'pending',
        status: AgentSessionStatus.ACTIVE,
        expiresAt,
      },
    });

    const sessionToken = await this.agentSessionTokenService.signToken(
      {
        sessionId: createdSession.id,
        userId,
        agentName: createdSession.name,
        dailyLimitKzt: agentSettings.dailyLimitKzt,
        perTransactionLimitKzt: agentSettings.perTransactionLimitKzt,
      },
      createDto.expiresInDays,
    );

    const tokenHash = this.agentSessionTokenService.hashToken(sessionToken);

    const updatedSession = await this.prismaService.agentSession.update({
      where: {
        id: createdSession.id,
      },
      data: {
        tokenHash,
      },
    });

    return {
      session: {
        id: updatedSession.id,
        name: updatedSession.name,
        status: updatedSession.status as AgentSessionStatusEnum,
        expiresAt: updatedSession.expiresAt.toISOString(),
        revokedAt: updatedSession.revokedAt?.toISOString() ?? null,
        createdAt: updatedSession.createdAt.toISOString(),
      },
      sessionToken,
    };
  }

  public async list(userId: string): Promise<ListAgentSessionsResponse> {
    const sessions = await this.prismaService.agentSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        name: session.name,
        status: session.status as AgentSessionStatusEnum,
        expiresAt: session.expiresAt.toISOString(),
        revokedAt: session.revokedAt?.toISOString() ?? null,
        createdAt: session.createdAt.toISOString(),
      })),
    };
  }

  public async revoke(userId: string, sessionId: string): Promise<RevokeAgentSessionResponse> {
    const session = await this.prismaService.agentSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (session === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Agent session not found',
      });
    }

    const revokedSession = await this.prismaService.agentSession.update({
      where: {
        id: session.id,
      },
      data: {
        status: AgentSessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    return {
      session: {
        id: revokedSession.id,
        name: revokedSession.name,
        status: revokedSession.status as AgentSessionStatusEnum,
        expiresAt: revokedSession.expiresAt.toISOString(),
        revokedAt: revokedSession.revokedAt?.toISOString() ?? null,
        createdAt: revokedSession.createdAt.toISOString(),
      },
    };
  }

  public async getById(userId: string, sessionId: string): Promise<GetAgentSessionResponse> {
    const session = await this.prismaService.agentSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (session === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Agent session not found',
        errorCode: ErrorCode.AGENT_SESSION_NOT_FOUND,
      });
    }

    return {
      session: {
        id: session.id,
        name: session.name,
        status: session.status as AgentSessionStatusEnum,
        expiresAt: session.expiresAt.toISOString(),
        revokedAt: session.revokedAt?.toISOString() ?? null,
        createdAt: session.createdAt.toISOString(),
      },
    };
  }
}