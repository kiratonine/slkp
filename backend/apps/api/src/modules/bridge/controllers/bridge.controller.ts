import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BridgePayDto } from '../dto/bridge-pay.dto';
import { BridgeService } from '../services/bridge.service';
import { BridgePayResponse } from '../types/bridge-pay-response.type';

@ApiTags('Bridge')
@Controller('bridge')
export class BridgeController {
  public constructor(private readonly bridgeService: BridgeService) {}

  @Post('pay')
  @ApiOperation({
    summary: 'Process agent payment request',
    description:
      'Validates session token, checks idempotency and prepares bridge payment execution.',
  })
  @ApiOkResponse({
    description: 'Bridge payment request processed',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or revoked agent session token',
  })
  @ApiConflictResponse({
    description: 'Idempotency key conflict',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  public async pay(@Body() dto: BridgePayDto): Promise<BridgePayResponse> {
    return this.bridgeService.pay(dto);
  }
}