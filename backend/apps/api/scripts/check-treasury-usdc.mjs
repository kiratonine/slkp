import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import bs58 from 'bs58';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY ?? '';

const USDC_DEVNET_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

if (TREASURY_PRIVATE_KEY.length === 0) {
  throw new Error('TREASURY_PRIVATE_KEY is missing');
}

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
const treasury = Keypair.fromSecretKey(bs58.decode(TREASURY_PRIVATE_KEY));

const treasuryAddress = treasury.publicKey;
const treasuryAta = await getAssociatedTokenAddress(USDC_DEVNET_MINT, treasuryAddress);

console.log('Treasury address:', treasuryAddress.toBase58());
console.log('USDC mint:', USDC_DEVNET_MINT.toBase58());
console.log('Treasury USDC ATA:', treasuryAta.toBase58());

const solLamports = await connection.getBalance(treasuryAddress);
console.log('Treasury SOL:', solLamports / 1_000_000_000);

try {
  const tokenAccount = await getAccount(connection, treasuryAta);
  const rawAmount = tokenAccount.amount;
  const uiAmount = Number(rawAmount) / 1_000_000;

  console.log('Treasury USDC raw:', rawAmount.toString());
  console.log('Treasury USDC:', uiAmount);
} catch (error) {
  console.log('Treasury USDC ATA not found or empty.');
  console.log('Fund this treasury address with Solana Devnet USDC.');
}