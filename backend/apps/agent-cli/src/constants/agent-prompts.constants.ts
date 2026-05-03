export const AGENT_MESSAGES = {
  started: 'AI Agent started.',
  enterCommand: 'Enter command:',
  bridgeDetected: '[agent] S1lk x402 Bridge connection command detected',
  bridgeInit: '[agent] Enabling x402 payment capability...',
  bridgeEnabled: '[agent] S1lk x402 Bridge connected successfully',
  askSessionToken: '[agent] Paste your sessionToken:',
  sessionStored: '[agent] Session token stored in runtime memory',
  readyForPayments:
    '[agent] I can now pay x402 requests through S1lk x402 Bridge',
  unknownCommand: '[agent] Unknown command. Please try again.',
  bridgeNotEnabled:
    '[agent] S1lk x402 Bridge is not connected yet. Connect it first.',
  sessionMissing:
    '[agent] Session token is missing. Connect the bridge and paste your token first.',
  runningPremiumFlow: '[agent] Running premium x402 payment flow...',
} as const;