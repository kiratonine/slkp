import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BridgePayRequest } from '../types/bridge-pay-request.type';

export class BridgePayDto implements BridgePayRequest {
  @ApiProperty({
    description: 'Agent session token',
    example: 'eyJ...',
  })
  @IsString()
  public sessionToken!: string;

  @ApiProperty({
    description: 'Seller API URL',
    example: 'https://seller.dev/paid/usdc',
  })
  @IsString()
  public sellerUrl!: string;

  @ApiProperty({
    description: 'Base64 encoded x402 PAYMENT-REQUIRED payload',
    example: 'eyJ4NDAyVmVyc2lvbiI6Mn0=',
  })
  @IsString()
  public paymentRequiredB64!: string;

  @ApiProperty({
    description: 'Idempotency key for safe retries',
    example: 'f5d1c0d2-6a7b-4c1d-9b3d-1f2e3d4c5b6a',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(200)
  public idempotencyKey!: string;

  @ApiPropertyOptional({
    description: 'Human-readable payment purpose',
    example: 'premium fx quote',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  public purpose?: string;
}