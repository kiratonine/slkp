import { AgentSettingsResponse } from '../../agent-settings/types/agent-settings-response.type';
import { BalanceResponse } from '../../balances/types/balance-response.type';
import { UserPublic } from '../../users/types/user-public.type';

export type RegisterResponse = {
  user: UserPublic;
  balance: BalanceResponse;
  agentSettings: AgentSettingsResponse;
};