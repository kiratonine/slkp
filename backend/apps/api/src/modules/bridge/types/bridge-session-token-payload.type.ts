export type BridgeSessionTokenPayload = {
  sessionId: string;
  userId: string;
  agentName: string;
  dailyLimitKzt: number;
  perTransactionLimitKzt: number;
  iat?: number;
  exp?: number;
};