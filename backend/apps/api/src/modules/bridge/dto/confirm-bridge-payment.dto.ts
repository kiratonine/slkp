import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmBridgePaymentDto {
  @ApiProperty({
    description: 'Agent session token used to authorize payment confirmation',
    example: 'eyJ...',
  })
  @IsString()
  public sessionToken!: string;

  @ApiPropertyOptional({
    description: 'Base64 encoded x402 PAYMENT-RESPONSE header returned by seller after successful retry',
    example: 'eyJ4NDAyVmVyc2lvbiI6Mn0=',
  })
  @IsOptional()
  @IsString()
  public paymentResponseB64?: string;
}