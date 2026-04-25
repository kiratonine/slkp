import { createS1lkX402Client } from '@s1lk/x402-agent-sdk';

export class AgentPaymentService {
  private readonly sellerUrl: string;
  private readonly bridgeUrl: string;

  public constructor() {
    this.sellerUrl = process.env.SELLER_URL ?? 'http://localhost:3002';
    this.bridgeUrl = process.env.BRIDGE_URL ?? 'http://localhost:3001/v1';
  }

  public async runPremiumSolQuote(sessionToken: string): Promise<void> {
    const client = createS1lkX402Client({
      bridgeBaseUrl: this.bridgeUrl,
      sessionTokenProvider: async () => sessionToken,
      onLog: (message: string, meta?: Record<string, unknown>) => {
        if (meta !== undefined) {
          console.log(`[sdk] ${message}`, meta);
          return;
        }

        console.log(`[sdk] ${message}`);
      },
      onPaymentRequired: async () => {
        console.log('[2] Got 402 from seller');
        console.log('[3] Calling bridge /bridge/pay through SDK');
      },
      onPaymentApproved: async (paymentId: string) => {
        console.log('[4] Bridge approved payment');
        console.log(`[tx] paymentId=${paymentId}`);
        console.log('[5] Retrying seller with PAYMENT-SIGNATURE');
      },
      onPaymentRejected: async (reason: string) => {
        console.log('[4] Bridge rejected payment');
        console.log(`[reason] ${reason}`);
      },
    });

    console.log('[1] Calling seller /paid/sol');

    const response = await client.fetch(`${this.sellerUrl}/paid/sol`);

    const data = (await response.json()) as unknown;

    console.log('[6] Seller returned success');
    console.log(JSON.stringify(data, null, 2));
  }
}