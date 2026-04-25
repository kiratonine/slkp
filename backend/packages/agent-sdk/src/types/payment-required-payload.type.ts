export type PaymentRequiredPayload = {
  x402Version?: number;
  accepts?: unknown[];
};

export type Seller402JsonPayload = {
  paymentRequiredB64?: string;
};