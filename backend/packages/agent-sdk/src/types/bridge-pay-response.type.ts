export type BridgePayResponse =
  | {
      status: 'ok';
      paymentId: string;
      paymentSignatureB64: string;
      asset: string;
      amountAtomic: string;
      network: string;
      estimatedKztDebit: number;
    }
  | {
      status: 'rejected';
      paymentId: string;
      reason: string;
    };