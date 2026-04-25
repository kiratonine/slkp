import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AgentSettingsService } from '../agent-settings/services/agent-settings.service';
import { BalancesService } from '../balances/services/balances.service';
import { BridgeController } from './controllers/bridge.controller';
import { BridgeIdempotencyService } from './services/bridge-idempotency.service';
import { BridgePaymentRequiredParserService } from './services/bridge-payment-required-parser.service';
import { BridgePaymentValidatorService } from './services/bridge-payment-validator.service';
import { BridgeService } from './services/bridge.service';
import { BridgeSessionVerifierService } from './services/bridge-session-verifier.service';
import { LedgerService } from './services/ledger.service';
import { SolanaService } from '../solana/services/solana.service';
import { BridgeX402PaymentSignerService } from './services/bridge-x402-payment-signer.service';
import { BridgeX402PaymentResponseParserService } from './services/bridge-x402-payment-response-parser.service';

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
    BalancesService,
    AgentSettingsService,
    BridgeSessionVerifierService,
    BridgeIdempotencyService,
    BridgePaymentRequiredParserService,
    BridgePaymentValidatorService,
    BridgeService,
    LedgerService,
    SolanaService,
    BridgeX402PaymentSignerService,
    BridgeX402PaymentResponseParserService,
  ],
  exports: [
    BridgeSessionVerifierService,
    BridgeIdempotencyService,
    BridgePaymentRequiredParserService,
    BridgePaymentValidatorService,
    BridgeService,
    BridgeX402PaymentSignerService,
    BridgeX402PaymentResponseParserService,
  ],
})
export class BridgeModule {}