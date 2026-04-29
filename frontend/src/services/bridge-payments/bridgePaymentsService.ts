import { apiGet } from "../api/client";
import type {
  GetBridgePaymentResponse,
  ListBridgePaymentsResponse,
} from "../../types/bridge-payments";

export const bridgePaymentsService = {
  list: (): Promise<ListBridgePaymentsResponse> =>
    apiGet<ListBridgePaymentsResponse>("/bridge/payments"),

  getById: (id: string): Promise<GetBridgePaymentResponse> =>
    apiGet<GetBridgePaymentResponse>(`/bridge/payments/${id}`),
};
