import 'dotenv/config';
import { AgentRuntimeService } from './services/agent-runtime.service';

function bootstrap(): void {
  const agentRuntimeService = new AgentRuntimeService();
  agentRuntimeService.start();
}

bootstrap();