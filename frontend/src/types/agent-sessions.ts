export type AgentSessionStatus = "ACTIVE" | "REVOKED";

export type AgentSession = {
  id: string;
  name: string;
  status: AgentSessionStatus;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export type CreateAgentSessionRequest = {
  name: string;
  expiresInDays: number;
};

export type CreateAgentSessionResponse = {
  session: AgentSession;
  sessionToken: string;
};

export type ListAgentSessionsResponse = {
  sessions: AgentSession[];
};

export type GetAgentSessionResponse = {
  session: AgentSession;
};

export type RevokeAgentSessionResponse = {
  session: AgentSession;
};
