import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CreateAgentSessionRequest } from '../types/create-agent-session-request.type';

export class CreateAgentSessionDto implements CreateAgentSessionRequest {
  @ApiProperty({
    example: 'Main CLI Agent',
    description: 'Human-readable agent session name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  public name!: string;

  @ApiProperty({
    example: 7,
    description: 'Session lifetime in days',
    minimum: 1,
    maximum: 30,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  public expiresInDays!: number;
}