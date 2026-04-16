import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, Max, Min } from 'class-validator';
import { UpdateAgentSettingsRequest } from '../types/update-agent-settings-request.type';

export class UpdateAgentSettingsDto implements UpdateAgentSettingsRequest {
  @ApiProperty({
    example: true,
    description: 'Enable or disable agent payments',
  })
  @IsBoolean()
  public isEnabled!: boolean;

  @ApiProperty({
    example: 3000,
    description: 'Daily spending limit in KZT',
    minimum: 0,
    maximum: 10000000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000000)
  public dailyLimitKzt!: number;

  @ApiProperty({
    example: 500,
    description: 'Per-transaction spending limit in KZT',
    minimum: 0,
    maximum: 10000000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000000)
  public perTransactionLimitKzt!: number;

  @ApiProperty({
    example: true,
    description: 'Require manual confirmation for first payment to a new seller',
  })
  @IsBoolean()
  public requireConfirmNewSeller!: boolean;
}