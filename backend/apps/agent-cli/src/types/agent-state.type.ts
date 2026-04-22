export type AgentState = {
  isBridgeEnabled: boolean;
  sessionToken: string | null;
  isWaitingForSessionToken: boolean;
};