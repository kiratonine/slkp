import { Module } from '@nestjs/common';
import { AgentSettingsService } from '../agent-settings/services/agent-settings.service';
import { BalancesService } from '../balances/services/balances.service';
import { UsersService } from '../users/services/users.service';
import { AuthController } from './controllers/auth.controller';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthRegisterService } from './services/auth-register.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthPasswordService,
    AuthRegisterService,
    UsersService,
    BalancesService,
    AgentSettingsService,
  ],
})
export class AuthModule {}