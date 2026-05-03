export class AgentCommandParserService {
  public isEnableBridgeCommand(input: string): boolean {
    const normalized = input.trim().toLowerCase();

    return (
      (normalized.includes('s1lk-x402-bridge') ||
        normalized.includes('s1lk x402 bridge')) &&
      (normalized.includes('подключи') ||
        normalized.includes('connect') ||
        normalized.includes('enable') ||
        normalized.includes('attach'))
    );
  }

  public isPremiumQuoteCommand(input: string): boolean {
    const normalized = input.trim().toLowerCase();

    return (
      normalized.includes('premium sol quote') ||
      normalized.includes('premium quote') ||
      normalized.includes('получи premium sol quote') ||
      normalized.includes('получи premium quote') ||
      normalized.includes('get premium sol quote') ||
      normalized.includes('get premium quote')
    );
  }
}