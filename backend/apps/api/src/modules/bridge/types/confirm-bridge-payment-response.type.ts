export type ConfirmBridgePaymentResponse = {
  status: 'confirmed';
  paymentId: string;
  ledgerEntryId: string | null;
  estimatedKztDebit: number;
};