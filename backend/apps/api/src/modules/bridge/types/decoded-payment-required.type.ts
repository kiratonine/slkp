export type DecodedPaymentRequired = {
  seller: string;
  amount: string;
  token: string;
  network: string;
  payTo?: string;
  purpose?: string;
  assetMint?: string;
  amountAtomic?: string;
};

export type X402Resource = {
  url?: string;
  description?: string;
  mimeType?: string;
};

export type X402PaymentRequirement = {
  scheme?: string;
  network?: string;
  amount?: string;
  asset?: string;
  payTo?: string;
  maxTimeoutSeconds?: number;
  extra?: {
    feePayer?: string;
    memo?: string;
  };
};

export type X402PaymentRequiredObject = {
  x402Version?: number;
  error?: string;
  resource?: X402Resource;
  accepts?: X402PaymentRequirement[];
};

export type ParsedPaymentRequired =
  | {
      kind: 'legacy';
      payment: DecodedPaymentRequired;
    }
  | {
      kind: 'x402';
      payment: DecodedPaymentRequired;
      raw: X402PaymentRequiredObject;
    };