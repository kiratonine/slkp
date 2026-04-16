export type BridgePayRequest = {
  sessionToken: string;
  sellerUrl: string;
  paymentRequiredB64: string;
  idempotencyKey: string;
  purpose?: string;
};