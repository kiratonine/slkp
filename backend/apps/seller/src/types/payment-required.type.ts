export type PaymentRequiredPayload = {
  seller: string;
  amount: string;
  token: string;
  network: string;
  payTo: string;
  purpose: string;
};