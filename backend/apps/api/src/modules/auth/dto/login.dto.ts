import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { LoginRequest } from '../types/login-request.type';

export class LoginDto implements LoginRequest {
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