import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AgentSessionsController } from './controllers/agent-sessions.controller';
import { AgentSessionTokenService } from './services/agent-session-token.service';
import { AgentSessionsService } from './services/agent-sessions.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const jwtSessionSecret =
          configService.get<string>('jwtSessionSecret') ??
          process.env.JWT_SESSION_SECRET ??
          'change_me_session_secret';

        const jwtAccessExpiresIn =
          (configService.get<string>('jwtAccessExpiresIn') ??
            process.env.JWT_ACCESS_EXPIRES_IN ??
            '7d') as StringValue;

        return {
          secret: jwtSessionSecret,
          signOptions: {
            expiresIn: jwtAccessExpiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AgentSessionsController],
  providers: [AgentSessionTokenService, AgentSessionsService],
  exports: [AgentSessionTokenService, AgentSessionsService],
})
export class AgentSessionsModule {}