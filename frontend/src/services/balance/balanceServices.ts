import { apiGet } from "../api/client";
import type { Balance } from "../../types/auth";

export const balanceService = {
  getBalance: (): Promise<Balance> => apiGet<Balance>("/balance"),
};
