import axios from 'axios';
import { BridgePayResponse } from '../types/bridge-pay-response.type';

export class BridgeClientService {
  private readonly bridgeUrl: string;

  public constructor() {
    this.bridgeUrl = process.env.BRIDGE_URL ?? 'http://localhost:3001/v1';
  }

  public async pay(params: {
    sessionToken: string;
    sellerUrl: string;
    paymentRequiredB64: string;
    purpose: string;
  }): Promise<BridgePayResponse> {
    const response = await axios.post<BridgePayResponse>(`${this.bridgeUrl}/bridge/pay`, {
      sessionToken: params.sessionToken,
      sellerUrl: params.sellerUrl,
      paymentRequiredB64: params.paymentRequiredB64,
      idempotencyKey: `agent-${Date.now()}`,
      purpose: params.purpose,
    });

    return response.data;
  }
}