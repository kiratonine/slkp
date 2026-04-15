export type Screen =
  | 'card'
  | 'ai-agent'
  | 'set-limit'
  | 'link-agent'
  | 'payment-confirm'
  | 'payment-success';

export interface AgentState {
  enabled: boolean;
  dailyLimit: number;
  agentName: string;
  agentKey: string;
  linked: boolean;
  spentToday: number;
}
