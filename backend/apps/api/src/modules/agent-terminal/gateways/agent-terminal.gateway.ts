import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AgentTerminalProcessService } from '../services/agent-terminal-process.service';
import {
  type AgentTerminalInputPayload,
  AgentTerminalOutputPayload,
  AgentTerminalStatusPayload,
} from '../types/agent-terminal-events.type';

@WebSocketGateway({
  namespace: 'agent-terminal',
  cors: {
    origin: '*',
  },
})
export class AgentTerminalGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  public constructor(
    private readonly configService: ConfigService,
    private readonly processService: AgentTerminalProcessService,
  ) {}

  public handleConnection(socket: Socket): void {
    if (!this.isAuthorized(socket)) {
      socket.emit('terminal:output', {
        stream: 'system',
        data: '[system] Unauthorized terminal connection.\n',
      } satisfies AgentTerminalOutputPayload);

      socket.disconnect(true);
      return;
    }

    socket.emit('terminal:output', {
      stream: 'system',
      data: '[system] Connected to S1lk x402 Agent Terminal.\n',
    } satisfies AgentTerminalOutputPayload);

    socket.emit('terminal:status', {
      running: false,
    } satisfies AgentTerminalStatusPayload);
  }

  public handleDisconnect(socket: Socket): void {
    this.processService.stop(socket.id);
  }

  @SubscribeMessage('terminal:start')
  public handleStart(@ConnectedSocket() socket: Socket): void {
    this.processService.start(socket.id, {
      onOutput: (data, stream) => {
        socket.emit('terminal:output', {
          stream,
          data,
        } satisfies AgentTerminalOutputPayload);
      },
      onSystem: (data) => {
        socket.emit('terminal:output', {
          stream: 'system',
          data,
        } satisfies AgentTerminalOutputPayload);
      },
      onExit: () => {
        socket.emit('terminal:status', {
          running: false,
        } satisfies AgentTerminalStatusPayload);
      },
    });

    socket.emit('terminal:status', {
      running: this.processService.isRunning(socket.id),
    } satisfies AgentTerminalStatusPayload);
  }

  @SubscribeMessage('terminal:input')
  public handleInput(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: AgentTerminalInputPayload,
  ): void {
    if (typeof payload.data !== 'string') {
      return;
    }

    this.processService.write(socket.id, payload.data);
  }

  @SubscribeMessage('terminal:stop')
  public handleStop(@ConnectedSocket() socket: Socket): void {
    this.processService.stop(socket.id);

    socket.emit('terminal:status', {
      running: false,
    } satisfies AgentTerminalStatusPayload);

    socket.emit('terminal:output', {
      stream: 'system',
      data: '[system] Stop requested.\n',
    } satisfies AgentTerminalOutputPayload);
  }

  private isAuthorized(socket: Socket): boolean {
    const expectedToken = this.configService.get<string>(
      'AGENT_TERMINAL_DEMO_TOKEN',
    );

    if (expectedToken === undefined || expectedToken.length === 0) {
      return true;
    }

    const auth = socket.handshake.auth as Record<string, unknown>;
    const receivedToken = auth.token;

    return typeof receivedToken === 'string' && receivedToken === expectedToken;
  }
}