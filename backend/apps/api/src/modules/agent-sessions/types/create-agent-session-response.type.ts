import { AgentSessionType } from './agent-session.type';

export type CreateAgentSessionResponse = {
  session: AgentSessionType;
  sessionToken: string;
};