import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { SolanaTransferResult } from '../types/solana-transfer-result.type';

@Injectable()
export class SolanaService {
  private readonly connection: Connection;
  private readonly treasuryKeypair: Keypair;
  private readonly commitment: Commitment;

  public constructor(private readonly configService: ConfigService) {
    const rpcUrl =
      this.configService.get<string>('rpcUrl') ??
      process.env.SOLANA_RPC_URL ??
      'https://api.devnet.solana.com';

    const commitmentValue =
      this.configService.get<string>('commitment') ??
      process.env.SOLANA_COMMITMENT ??
      'confirmed';

    const privateKeyBase58 =
      this.configService.get<string>('treasuryPrivateKey') ??
      process.env.TREASURY_PRIVATE_KEY ??
      '';

    if (privateKeyBase58.length === 0) {
      throw new InternalServerErrorException('TREASURY_PRIVATE_KEY is not configured');
    }

    this.commitment = commitmentValue as Commitment;
    this.connection = new Connection(rpcUrl, this.commitment);
    this.treasuryKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
  }

  public getTreasuryAddress(): string {
    return this.treasuryKeypair.publicKey.toBase58();
  }

  public async transferSol(params: {
    toAddress: string;
    amountSol: number;
  }): Promise<SolanaTransferResult> {
    const lamports = Math.round(params.amountSol * LAMPORTS_PER_SOL);

    if (!Number.isFinite(lamports) || lamports <= 0) {
      throw new InternalServerErrorException('Invalid SOL amount');
    }

    const recipient = new PublicKey(params.toAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.treasuryKeypair.publicKey,
        toPubkey: recipient,
        lamports,
      }),
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.treasuryKeypair],
      {
        commitment: this.commitment,
      },
    );

    return {
      signature,
      fromAddress: this.treasuryKeypair.publicKey.toBase58(),
      toAddress: recipient.toBase58(),
      lamports,
    };
  }
}