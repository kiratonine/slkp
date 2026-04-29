export type LedgerEntry = {
  id: string;
  paymentId: string;
  amountKzt: number;
  type: string;
  createdAt: string;
};

export type ListLedgerResponse = {
  entries: LedgerEntry[];
};
