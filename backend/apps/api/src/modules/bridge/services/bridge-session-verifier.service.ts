import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AgentSessionStatus } from '../../../../prisma/generated/client';
import { BridgeSessionTokenPayload } from '../types/bridge-session-token-payload.type';
import { VerifiedAgentSession } from '../types/verified-agent-session.type';
import { createHash } from 'crypto';

@Injectable()
export class BridgeSessionVerifierService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  public async verifySessionToken(sessionToken: string): Promise<VerifiedAgentSession> {
    let payload: BridgeSessionTokenPayload;

    try {
      const jwtSessionSecret =
        this.configService.get<string>('jwtSessionSecret') ??
        process.env.JWT_SESSION_SECRET ??
        'change_me_session_secret';

      payload = await this.jwtService.verifyAsync<BridgeSessionTokenPayload>(sessionToken, {
        secret: jwtSessionSecret,
      });
    } catch {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid agent session token',
        errorCode: ErrorCode.AGENT_SESSION_INVALID,
      });
    }

    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');

    const session = await this.prismaService.agentSession.findUnique({
      where: {
        id: payload.sessionId,
      },
    });

    if (session === null || session.tokenHash !== tokenHash) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid agent session token',
        errorCode: ErrorCode.AGENT_SESSION_INVALID,
      });
    }

    if (session.status === AgentSessionStatus.REVOKED) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Agent session is revoked',
        errorCode: ErrorCode.AGENT_SESSION_REVOKED,
      });
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Agent session is expired',
        errorCode: ErrorCode.AGENT_SESSION_EXPIRED,
      });
    }

    return {
      sessionId: session.id,
      userId: session.userId,
      agentName: payload.agentName,
      dailyLimitKzt: payload.dailyLimitKzt,
      perTransactionLimitKzt: payload.perTransactionLimitKzt,
      expiresAt: session.expiresAt.toISOString(),
    };
  }
}