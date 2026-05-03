import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { AgentTerminalSession } from '../types/agent-terminal-session.type';

type AgentTerminalOutputStream = 'stdout' | 'stderr';

type StartProcessCallbacks = {
  onOutput: (data: string, stream: AgentTerminalOutputStream) => void;
  onSystem: (data: string) => void;
  onExit: () => void;
};

@Injectable()
export class AgentTerminalProcessService {
  private readonly logger = new Logger(AgentTerminalProcessService.name);
  private readonly sessions = new Map<string, AgentTerminalSession>();

  public constructor(private readonly configService: ConfigService) {}

  public start(socketId: string, callbacks: StartProcessCallbacks): void {
    if (this.sessions.has(socketId)) {
      callbacks.onSystem('[system] Agent CLI уже запущен.\n');
      return;
    }

    const enabled =
      this.configService.get<string>('AGENT_TERMINAL_ENABLED') ?? 'false';

    if (enabled !== 'true') {
      callbacks.onSystem('[system] Agent terminal disabled on this server.\n');
      return;
    }

    const command = this.configService.get<string>('AGENT_CLI_COMMAND') ?? 'pnpm';
    const args = this.splitArgs(
      this.configService.get<string>('AGENT_CLI_ARGS') ?? 'dev',
    );

    const cwdRaw =
      this.configService.get<string>('AGENT_CLI_CWD') ?? '../agent-cli';

    const cwd = resolve(process.cwd(), cwdRaw);

    callbacks.onSystem(
      `[system] Starting agent-cli: ${command} ${args.join(' ')}\n`,
    );
    callbacks.onSystem(`[system] Working directory: ${cwd}\n`);

    const child = spawn(command, args, {
      cwd,
      shell: false,
      env: {
        ...process.env,
        BRIDGE_URL:
          this.configService.get<string>('AGENT_CLI_BRIDGE_URL') ??
          'http://localhost:3001/v1',
        SELLER_URL:
          this.configService.get<string>('AGENT_CLI_SELLER_URL') ??
          'http://localhost:3002',
      },
    });

    const session: AgentTerminalSession = {
      socketId,
      process: child,
      startedAt: new Date(),
    };

    this.sessions.set(socketId, session);

    child.stdout.on('data', (chunk: Buffer) => {
      callbacks.onOutput(chunk.toString('utf-8'), 'stdout');
    });

    child.stderr.on('data', (chunk: Buffer) => {
      callbacks.onOutput(chunk.toString('utf-8'), 'stderr');
    });

    child.on('error', (error: Error) => {
      this.logger.error(error.message);
      callbacks.onSystem(`[system] Agent CLI error: ${error.message}\n`);
    });

    child.on('close', (code: number | null) => {
      this.sessions.delete(socketId);
      callbacks.onSystem(`[system] Agent CLI stopped. code=${code ?? 'null'}\n`);
      callbacks.onExit();
    });
  }

  public write(socketId: string, data: string): void {
    const session = this.sessions.get(socketId);

    if (session === undefined) {
      return;
    }

    session.process.stdin.write(data);
  }

  public stop(socketId: string): void {
    const session = this.sessions.get(socketId);

    if (session === undefined) {
      return;
    }

    session.process.kill('SIGTERM');
    this.sessions.delete(socketId);
  }

  public isRunning(socketId: string): boolean {
    return this.sessions.has(socketId);
  }

  private splitArgs(value: string): string[] {
    return value
      .split(' ')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}