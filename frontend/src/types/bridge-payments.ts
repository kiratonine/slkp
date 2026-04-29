export type BridgePaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export type BridgePaymentDecision = "APPROVED" | "REJECTED";

export type BridgePayment = {
  id: string;
  sellerUrl: string;
  purpose: string | null;
  amountAtomic: string | null;
  asset: string | null;
  network: string | null;
  estimatedKztDebit: number | null;
  status: BridgePaymentStatus;
  decision: BridgePaymentDecision | null;
  rejectionReason: string | null;
  solanaTxSignature: string | null;
  payToAddress: string | null;
  executedAt: string | null;
  createdAt: string;
};

export type ListBridgePaymentsResponse = {
  payments: BridgePayment[];
};

export type GetBridgePaymentResponse = {
  payment: BridgePayment;
};
