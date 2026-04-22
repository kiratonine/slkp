import axios from 'axios';
import { BridgeClientService } from './bridge-client.service';
import { SellerClientService, Seller402Response } from './seller-client.service';

export class AgentFlowService {
  private readonly sellerClientService: SellerClientService;
  private readonly bridgeClientService: BridgeClientService;
  private readonly sellerUrl: string;

  public constructor() {
    this.sellerClientService = new SellerClientService();
    this.bridgeClientService = new BridgeClientService();
    this.sellerUrl = process.env.SELLER_URL ?? 'http://localhost:3002';
  }

  public async runPremiumSolQuote(sessionToken: string): Promise<void> {
    console.log('[1] Calling seller /paid/sol');

    try {
      const firstAttempt = await this.sellerClientService.requestPaidSol();
      console.log('[unexpected] Seller returned success immediately');
      console.log(JSON.stringify(firstAttempt, null, 2));
      return;
    } catch (error: unknown) {
      if (!axios.isAxiosError(error) || error.response?.status !== 402) {
        console.error('[error] Seller call failed:', error);
        return;
      }

      const seller402 = error.response.data as Seller402Response;

      console.log('[2] Got 402 from seller');
      console.log('[3] Calling bridge /bridge/pay');

      const bridgeResponse = await this.bridgeClientService.pay({
        sessionToken,
        sellerUrl: `${this.sellerUrl}/paid/sol`,
        paymentRequiredB64: seller402.paymentRequiredB64,
        purpose: 'premium sol quote',
      });

      if (bridgeResponse.status !== 'ok') {
        console.error('[4] Bridge rejected payment:', bridgeResponse);
        return;
      }

      console.log('[4] Bridge approved payment');
      console.log(`[tx] paymentId=${bridgeResponse.paymentId}`);
      console.log('[5] Retrying seller with PAYMENT-SIGNATURE');

      const secondAttempt = await this.sellerClientService.requestPaidSolWithSignature(
        bridgeResponse.paymentSignatureB64,
      );

      console.log('[6] Seller returned success');
      console.log(JSON.stringify(secondAttempt, null, 2));
    }
  }
}