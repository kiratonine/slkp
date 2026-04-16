import { Module } from '@nestjs/common';
import { BalancesController } from './controllers/balances.controller';
import { BalancesService } from './services/balances.service';

@Module({
  controllers: [BalancesController],
  providers: [BalancesService],
  exports: [BalancesService],
})
export class BalancesModule {}