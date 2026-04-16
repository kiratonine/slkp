export type AgentSettingsResponse = {
  isEnabled: boolean;
  dailyLimitKzt: number;
  perTransactionLimitKzt: number;
  requireConfirmNewSeller: boolean;
  updatedAt: string;
};