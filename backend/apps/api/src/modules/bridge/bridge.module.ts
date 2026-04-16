import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { BridgeController } from './controllers/bridge.controller';
import { BridgeIdempotencyService } from './services/bridge-idempotency.service';
import { BridgeService } from './services/bridge.service';
import { BridgeSessionVerifierService } from './services/bridge-session-verifier.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret:
          configService.get<string>('jwtSessionSecret') ??
          process.env.JWT_SESSION_SECRET ??
          'change_me_session_secret',
      }),
    }),
  ],
  controllers: [BridgeController],
  providers: [
    BridgeSessionVerifierService,
    BridgeIdempotencyService,
    BridgeService,
  ],
  exports: [
    BridgeSessionVerifierService,
    BridgeIdempotencyService,
    BridgeService,
  ],
})
export class BridgeModule {}