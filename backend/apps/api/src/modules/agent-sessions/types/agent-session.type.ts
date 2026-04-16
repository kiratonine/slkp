import { AgentSessionStatusEnum } from '../enums/agent-session-status.enum';

export type AgentSessionType = {
  id: string;
  name: string;
  status: AgentSessionStatusEnum;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};