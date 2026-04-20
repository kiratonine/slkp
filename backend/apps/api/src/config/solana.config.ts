export interface SolanaConfig {
  rpcUrl: string;
  treasuryPrivateKey: string;
  commitment: string;
}

export const solanaConfig = (): SolanaConfig => ({
  rpcUrl: process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
  treasuryPrivateKey: process.env.TREASURY_PRIVATE_KEY ?? '',
  commitment: process.env.SOLANA_COMMITMENT ?? 'confirmed',
});