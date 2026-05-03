export type AgentTerminalOutputStream = 'stdout' | 'stderr' | 'system';

export type AgentTerminalOutputPayload = {
  stream: AgentTerminalOutputStream;
  data: string;
};

export type AgentTerminalInputPayload = {
  data: string;
};

export type AgentTerminalStatusPayload = {
  running: boolean;
};