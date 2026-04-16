import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';

type SessionTokenPayload = {
  sessionId: string;
  userId: string;
  agentName: string;
  dailyLimitKzt: number;
  perTransactionLimitKzt: number;
};

@Injectable()
export class AgentSessionTokenService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async signToken(
    payload: SessionTokenPayload,
    expiresInDays: number,
  ): Promise<string> {
    const jwtSessionSecret =
      this.configService.get<string>('jwtSessionSecret') ??
      process.env.JWT_SESSION_SECRET ??
      'change_me_session_secret';

    return this.jwtService.signAsync(payload, {
      secret: jwtSessionSecret,
      expiresIn: `${expiresInDays}d`,
    });
  }

  public hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}