export type BridgePaymentItem = {
  id: string;
  sellerUrl: string;
  purpose: string | null;
  amountAtomic: string | null;
  asset: string | null;
  network: string | null;
  estimatedKztDebit: number | null;
  status: string;
  decision: string | null;
  rejectionReason: string | null;
  paymentResponseB64: string | null;
  solanaTxSignature: string | null;
  payToAddress: string | null;
  executedAt: string | null;
  createdAt: string;
};