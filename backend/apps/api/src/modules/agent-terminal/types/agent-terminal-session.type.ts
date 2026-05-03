import { ChildProcessWithoutNullStreams } from 'node:child_process';

export type AgentTerminalSession = {
  socketId: string;
  process: ChildProcessWithoutNullStreams;
  startedAt: Date;
};