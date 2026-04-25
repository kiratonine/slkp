export type X402PaymentResponse = {
  success?: boolean;
  transaction?: string;
  txSignature?: string;
  signature?: string;
  transactionHash?: string;
  network?: string;
  payer?: string;
  [key: string]: unknown;
};