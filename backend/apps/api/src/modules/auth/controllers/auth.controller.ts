import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { AuthRegisterService } from '../services/auth-register.service';
import { RegisterResponse } from '../types/register-response.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  public constructor(private readonly authRegisterService: AuthRegisterService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a user, initial KZT balance and default agent settings.',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
  })
  @ApiBadRequestResponse({
    description: 'Validation error or email already exists',
  })
  public async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authRegisterService.register(registerDto);
  }
}