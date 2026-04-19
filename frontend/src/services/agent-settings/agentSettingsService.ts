import { apiGet, apiPut } from "../api/client";
import type { AgentSettings } from "../../types/auth";

export type UpdateAgentSettingsRequest = {
  isEnabled: boolean;
  dailyLimitKzt: number;
  perTransactionLimitKzt: number;
  requireConfirmNewSeller: boolean;
};

export const agentSettingsService = {
  getSettings: (): Promise<AgentSettings> =>
    apiGet<AgentSettings>("/settings/agent-payments"),

  updateSettings: (data: UpdateAgentSettingsRequest): Promise<AgentSettings> =>
    apiPut<AgentSettings>("/settings/agent-payments", data),
};
