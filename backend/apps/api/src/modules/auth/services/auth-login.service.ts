import { UnauthorizedException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { LoginResponse } from '../types/login-response.type';
import { AuthPasswordService } from './auth-password.service';

type AccessTokenPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthLoginService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly authPasswordService: AuthPasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (user === null) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid credentials',
        errorCode: ErrorCode.AUTH_INVALID_CREDENTIALS,
      });
    }

    const isPasswordValid = await this.authPasswordService.comparePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid credentials',
        errorCode: ErrorCode.AUTH_INVALID_CREDENTIALS,
      });
    }

    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const expiresIn =
      this.configService.get<string>('jwtAccessExpiresIn') ??
      process.env.JWT_ACCESS_EXPIRES_IN ??
      '7d';

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }
}