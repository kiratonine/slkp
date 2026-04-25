export type SellerConfig = {
  port: number;
  baseUrl: string;
  payTo: string;
  network: `${string}:${string}`;
  price: string;
  resourcePath: '/paid/sol';
  facilitatorUrl: string;
};

export function getSellerConfig(): SellerConfig {
  return {
    port: Number(process.env.PORT ?? 3002),
    baseUrl: process.env.SELLER_BASE_URL ?? 'http://localhost:3002',
    payTo: process.env.SELLER_SOL_RECEIVER ?? '',
    network: (
    process.env.X402_NETWORK ?? 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
    ) as `${string}:${string}`,
    resourcePath: '/paid/sol',
    price: process.env.X402_PRICE_SOL ?? '$0.001',
    facilitatorUrl:
      process.env.FACILITATOR_URL ?? 'https://facilitator.x402.org',
  };
}