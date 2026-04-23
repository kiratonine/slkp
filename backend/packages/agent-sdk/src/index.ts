import { S1lkX402Client } from './client/s1lk-x402-client';
import { CreateS1lkX402ClientOptions } from './types/create-client-options.type';

export function createS1lkX402Client(
  options: CreateS1lkX402ClientOptions,
): S1lkX402Client {
  return new S1lkX402Client(options);
}

export { S1lkX402Client } from './client/s1lk-x402-client';

export { S1lkX402Error } from './errors/s1lk-x402-error';
export { S1lkX402PaymentRejectedError } from './errors/s1lk-x402-payment-rejected.error';
export { S1lkX402SessionTokenMissingError } from './errors/s1lk-x402-session-token-missing.error';
export { S1lkX402Invalid402ResponseError } from './errors/s1lk-x402-invalid-402-response.error';
export { S1lkX402BridgeRequestError } from './errors/s1lk-x402-bridge-request.error';

export type { BridgePayRequest } from './types/bridge-pay-request.type';
export type { BridgePayResponse } from './types/bridge-pay-response.type';
export type { CreateS1lkX402ClientOptions } from './types/create-client-options.type';
export type { SessionTokenProvider } from './types/session-token-provider.type';