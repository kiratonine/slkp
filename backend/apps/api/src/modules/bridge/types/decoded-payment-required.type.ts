export type DecodedPaymentRequired = {
  seller: string;
  amount: string;
  token: string;
  network: string;
  payTo?: string;
  purpose?: string;
};