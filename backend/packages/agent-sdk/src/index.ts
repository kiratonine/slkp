import { S1lkX402Client } from './client/s1lk-x402-client.js';
import { CreateS1lkX402ClientOptions } from './types/create-client-options.type.js';

export function createS1lkX402Client(
  options: CreateS1lkX402ClientOptions,
): S1lkX402Client {
  return new S1lkX402Client(options);
}

export { S1lkX402Client } from './client/s1lk-x402-client.js';

export { S1lkX402Error } from './errors/s1lk-x402-error.js';
export { S1lkX402PaymentRejectedError } from './errors/s1lk-x402-payment-rejected.error.js';
export { S1lkX402SessionTokenMissingError } from './errors/s1lk-x402-session-token-missing.error.js';
export { S1lkX402Invalid402ResponseError } from './errors/s1lk-x402-invalid-402-response.error.js';
export { S1lkX402BridgeRequestError } from './errors/s1lk-x402-bridge-request.error.js';

export type { BridgePayRequest } from './types/bridge-pay-request.type.js';
export type { BridgePayResponse } from './types/bridge-pay-response.type.js';
export type { CreateS1lkX402ClientOptions } from './types/create-client-options.type.js';
export type { SessionTokenProvider } from './types/session-token-provider.type.js';