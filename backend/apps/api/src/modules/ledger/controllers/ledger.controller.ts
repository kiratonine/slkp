import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { type JwtPayload } from '../../../common/types/jwt-payload.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LedgerService } from '../services/ledger.service';
import { ListLedgerResponse } from '../types/list-ledger-response.type';

@ApiTags('Ledger')
@ApiBearerAuth()
@Controller('ledger')
export class LedgerController {
  public constructor(private readonly ledgerService: LedgerService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List current user ledger entries',
  })
  @ApiOkResponse({
    description: 'Returns current user ledger history',
  })
  public async listEntries(@CurrentUser() user: JwtPayload): Promise<ListLedgerResponse> {
    return this.ledgerService.listEntries(user.sub);
  }
}