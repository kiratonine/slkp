import { Module } from '@nestjs/common';
import { AgentSettingsController } from './controllers/agent-settings.controller';
import { AgentSettingsService } from './services/agent-settings.service';

@Module({
  controllers: [AgentSettingsController],
  providers: [AgentSettingsService],
  exports: [AgentSettingsService],
})
export class AgentSettingsModule {}