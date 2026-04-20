import { Module } from '@nestjs/common';
import { SolanaService } from './services/solana.service';

@Module({
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}