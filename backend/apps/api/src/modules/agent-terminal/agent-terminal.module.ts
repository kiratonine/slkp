import { Module } from '@nestjs/common';
import { AgentTerminalGateway } from './gateways/agent-terminal.gateway';
import { AgentTerminalProcessService } from './services/agent-terminal-process.service';

@Module({
  providers: [AgentTerminalGateway, AgentTerminalProcessService],
})
export class AgentTerminalModule {}