import { apiGet } from "../api/client";
import type { ListLedgerResponse } from "../../types/ledger";

export const ledgerService = {
  list: (): Promise<ListLedgerResponse> =>
    apiGet<ListLedgerResponse>("/ledger"),
};
