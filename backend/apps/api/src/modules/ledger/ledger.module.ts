import { Module } from '@nestjs/common';
import { LedgerController } from './controllers/ledger.controller';
import { LedgerService } from './services/ledger.service';

@Module({
  controllers: [LedgerController],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}