import { apiGet, apiPost } from "../api/client";
import type {
  CreateAgentSessionRequest,
  CreateAgentSessionResponse,
  GetAgentSessionResponse,
  ListAgentSessionsResponse,
  RevokeAgentSessionResponse,
} from "../../types/agent-sessions";

export const agentSessionsService = {
  list: (): Promise<ListAgentSessionsResponse> =>
    apiGet<ListAgentSessionsResponse>("/agent-sessions"),

  create: (
    data: CreateAgentSessionRequest,
  ): Promise<CreateAgentSessionResponse> =>
    apiPost<CreateAgentSessionResponse>("/agent-sessions", data),

  getById: (id: string): Promise<GetAgentSessionResponse> =>
    apiGet<GetAgentSessionResponse>(`/agent-sessions/${id}`),

  revoke: (id: string): Promise<RevokeAgentSessionResponse> =>
    apiPost<RevokeAgentSessionResponse>(`/agent-sessions/${id}/revoke`),
};
