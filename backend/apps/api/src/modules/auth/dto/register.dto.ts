import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { RegisterRequest } from '../types/register-request.type';

export class RegisterDto implements RegisterRequest {
  @ApiProperty({
    example: 'denis@example.com',
    description: 'User email address',
  })
  @IsEmail()
  public email!: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'User password',
    minLength: 8,
    maxLength: 64,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  public password!: string;
}