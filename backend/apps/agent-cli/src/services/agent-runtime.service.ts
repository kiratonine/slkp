import readline from 'node:readline';
import { AGENT_MESSAGES } from '../constants/agent-prompts.constants.js';
import { AgentState } from '../types/agent-state.type.js';
import { AgentCommandParserService } from './agent-command-parser.service.js';
import { AgentPaymentService } from './agent-payment.service.js';

export class AgentRuntimeService {
  private readonly state: AgentState;
  private readonly commandParserService: AgentCommandParserService;
  private readonly agentPaymentService: AgentPaymentService;
  private readonly rl: readline.Interface;

  public constructor() {
    this.state = {
      isBridgeEnabled: false,
      sessionToken: null,
      isWaitingForSessionToken: false,
    };

    this.commandParserService = new AgentCommandParserService();
    this.agentPaymentService = new AgentPaymentService();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  public start(): void {
    console.log(AGENT_MESSAGES.started);
    console.log(AGENT_MESSAGES.enterCommand);

    this.rl.on('line', async (input: string) => {
      await this.handleInput(input.trim());
    });
  }

  private async handleInput(input: string): Promise<void> {
    if (this.state.isWaitingForSessionToken) {
      await this.handleSessionTokenInput(input);
      return;
    }

    if (this.commandParserService.isEnableBridgeCommand(input)) {
      this.enableBridge();
      return;
    }

    if (this.commandParserService.isPremiumQuoteCommand(input)) {
      await this.handlePremiumQuoteCommand();
      return;
    }

    console.log(AGENT_MESSAGES.unknownCommand);
    console.log(AGENT_MESSAGES.enterCommand);
  }

  private enableBridge(): void {
    console.log(AGENT_MESSAGES.bridgeDetected);
    console.log(AGENT_MESSAGES.bridgeInit);

    this.state.isBridgeEnabled = true;
    this.state.isWaitingForSessionToken = true;

    console.log(AGENT_MESSAGES.bridgeEnabled);
    console.log(AGENT_MESSAGES.askSessionToken);
  }

  private async handleSessionTokenInput(input: string): Promise<void> {
    if (input.length === 0) {
      console.log('[agent] Session token пустой. Вставьте корректный token.');
      return;
    }

    this.state.sessionToken = input;
    this.state.isWaitingForSessionToken = false;

    console.log(AGENT_MESSAGES.sessionStored);
    console.log(AGENT_MESSAGES.readyForPayments);
    console.log(AGENT_MESSAGES.enterCommand);
  }

  private async handlePremiumQuoteCommand(): Promise<void> {
    if (!this.state.isBridgeEnabled) {
      console.log(AGENT_MESSAGES.bridgeNotEnabled);
      console.log(AGENT_MESSAGES.enterCommand);
      return;
    }

    if (this.state.sessionToken === null) {
      console.log(AGENT_MESSAGES.sessionMissing);
      console.log(AGENT_MESSAGES.askSessionToken);
      this.state.isWaitingForSessionToken = true;
      return;
    }

    console.log(AGENT_MESSAGES.runningPremiumFlow);

    try {
      await this.agentPaymentService.runPremiumSolQuote(this.state.sessionToken);
    } catch (error: unknown) {
      console.error('[agent] Payment flow failed:', error);
    }

    console.log(AGENT_MESSAGES.enterCommand);
  }
}