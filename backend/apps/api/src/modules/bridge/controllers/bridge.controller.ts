import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { type JwtPayload } from '../../../common/types/jwt-payload.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BridgePayDto } from '../dto/bridge-pay.dto';
import { BridgeService } from '../services/bridge.service';
import { BridgePayResponse } from '../types/bridge-pay-response.type';
import { ListBridgePaymentsResponse } from '../types/list-bridge-payments-response.type';
import { Param } from '@nestjs/common';
import { GetBridgePaymentResponse } from '../types/get-bridge-payment-response.type';
import { ConfirmBridgePaymentDto } from '../dto/confirm-bridge-payment.dto';
import { ConfirmBridgePaymentResponse } from '../types/confirm-bridge-payment-response.type';

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

  @Get('payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List current user bridge payments',
    description: 'Returns bridge payment history for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Returns current user bridge payments',
  })
  public async listPayments(
    @CurrentUser() user: JwtPayload,
  ): Promise<ListBridgePaymentsResponse> {
    return this.bridgeService.listPayments(user.sub);
  }

  @Get('payments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user bridge payment by id',
    description: 'Returns one bridge payment that belongs to the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Returns current user bridge payment by id',
  })
  public async getPaymentById(
    @CurrentUser() user: JwtPayload,
    @Param('id') paymentId: string,
  ): Promise<GetBridgePaymentResponse> {
    return this.bridgeService.getPaymentById(user.sub, paymentId);
  }

  @Post('payments/:id/confirm')
  @ApiOperation({
    summary: 'Confirm bridge payment after successful seller response',
    description:
      'Finalizes PENDING bridge payment after seller accepted PAYMENT-SIGNATURE. Debits KZT balance, creates ledger entry and marks payment as SUCCEEDED.',
  })
  @ApiOkResponse({
    description: 'Bridge payment confirmed',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or revoked agent session token',
  })
  @ApiBadRequestResponse({
    description: 'Payment cannot be confirmed',
  })
  public async confirmPayment(
    @Param('id') paymentId: string,
    @Body() dto: ConfirmBridgePaymentDto,
  ): Promise<ConfirmBridgePaymentResponse> {
    return this.bridgeService.confirmPayment({
      paymentId,
      dto,
    });
  }
}