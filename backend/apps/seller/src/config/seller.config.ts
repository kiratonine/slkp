export type SellerConfig = {
  port: number;
  baseUrl: string;
  payTo: string;
  network: `${string}:${string}`;
  price: string;
  facilitatorUrl: string;
};

export function getSellerConfig(): SellerConfig {
  const port = Number(process.env.SELLER_PORT ?? 3002);

  return {
    port,
    baseUrl: process.env.SELLER_BASE_URL ?? `http://localhost:${port}`,
    payTo: process.env.SELLER_SOL_RECEIVER ?? '',
    network: (
      process.env.X402_NETWORK ?? 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
    ) as `${string}:${string}`,
    price: process.env.X402_PRICE_SOL ?? '$0.001',
    facilitatorUrl:
      process.env.FACILITATOR_URL ?? 'https://x402.org/facilitator',
  };
}