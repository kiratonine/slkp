import { SessionTokenProvider } from './session-token-provider.type.js';

export type CreateS1lkX402ClientOptions = {
  bridgeBaseUrl: string;
  sessionTokenProvider?: SessionTokenProvider;
  fetchImpl?: typeof fetch;
  onLog?: (message: string, meta?: Record<string, unknown>) => void;
  onPaymentRequired?: (sellerUrl: string) => Promise<void>;
  onPaymentApproved?: (paymentId: string) => Promise<void>;
  onPaymentRejected?: (reason: string) => Promise<void>;
};