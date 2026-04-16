import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { type JwtPayload } from '../../../common/types/jwt-payload.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BalanceResponse } from '../types/balance-response.type';
import { BalancesService } from '../services/balances.service';

@ApiTags('Balances')
@ApiBearerAuth()
@Controller('balance')
export class BalancesController {
  public constructor(private readonly balancesService: BalancesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user balance',
  })
  @ApiOkResponse({
    description: 'Returns current user balance in KZT',
  })
  public async getBalance(@CurrentUser() user: JwtPayload): Promise<BalanceResponse> {
    return this.balancesService.getBalanceByUserId(user.sub);
  }
}