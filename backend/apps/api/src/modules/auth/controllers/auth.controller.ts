import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthLoginService } from '../services/auth-login.service';
import { AuthRegisterService } from '../services/auth-register.service';
import { LoginResponse } from '../types/login-response.type';
import { RegisterResponse } from '../types/register-response.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  public constructor(
    private readonly authRegisterService: AuthRegisterService,
    private readonly authLoginService: AuthLoginService,
  ) {}

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Validates user credentials and returns JWT access token.',
  })
  @ApiOkResponse({
    description: 'User successfully logged in',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authLoginService.login(loginDto);
  }
}