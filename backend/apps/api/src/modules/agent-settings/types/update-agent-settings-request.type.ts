export type UpdateAgentSettingsRequest = {
  isEnabled: boolean;
  dailyLimitKzt: number;
  perTransactionLimitKzt: number;
  requireConfirmNewSeller: boolean;
};