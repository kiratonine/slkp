import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentSettingsModule } from './modules/agent-settings/agent-settings.module';
import { AuthModule } from './modules/auth/auth.module';
import { BalancesModule } from './modules/balances/balances.module';
import { UsersModule } from './modules/users/users.module';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { validateEnvironment } from './config/env.validation';
import { PrismaModule } from './database/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig],
      validate: validateEnvironment,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BalancesModule,
    AgentSettingsModule,
  ],
})
export class AppModule {}