import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import bs58 from 'bs58';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY ?? '';
const SELLER_SOL_RECEIVER = process.env.SELLER_SOL_RECEIVER ?? '';

const USDC_DEVNET_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

if (TREASURY_PRIVATE_KEY.length === 0) {
  throw new Error('TREASURY_PRIVATE_KEY is missing');
}

if (SELLER_SOL_RECEIVER.length === 0) {
  throw new Error('SELLER_SOL_RECEIVER is missing');
}

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
const treasury = Keypair.fromSecretKey(bs58.decode(TREASURY_PRIVATE_KEY));
const sellerOwner = new PublicKey(SELLER_SOL_RECEIVER);

const sellerUsdcAta = await getAssociatedTokenAddress(
  USDC_DEVNET_MINT,
  sellerOwner,
);

console.log('Treasury:', treasury.publicKey.toBase58());
console.log('Seller owner:', sellerOwner.toBase58());
console.log('USDC mint:', USDC_DEVNET_MINT.toBase58());
console.log('Seller USDC ATA:', sellerUsdcAta.toBase58());

try {
  const account = await getAccount(connection, sellerUsdcAta);

  console.log('Seller USDC ATA already exists.');
  console.log('Seller USDC raw amount:', account.amount.toString());
  console.log('Seller USDC:', Number(account.amount) / 1_000_000);
} catch {
  console.log('Seller USDC ATA does not exist. Creating...');

  const tx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      treasury.publicKey,
      sellerUsdcAta,
      sellerOwner,
      USDC_DEVNET_MINT,
    ),
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [treasury], {
    commitment: 'confirmed',
  });

  console.log('Seller USDC ATA created.');
  console.log('Tx signature:', signature);
}