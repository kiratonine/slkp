export type VerifiedAgentSession = {
  sessionId: string;
  userId: string;
  agentName: string;
  dailyLimitKzt: number;
  perTransactionLimitKzt: number;
  expiresAt: string;
};