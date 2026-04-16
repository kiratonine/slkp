import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthController } from './controllers/auth.controller';
import { AuthLoginService } from './services/auth-login.service';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthRegisterService } from './services/auth-register.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const jwtAccessSecret =
          configService.get<string>('jwtAccessSecret') ??
          process.env.JWT_ACCESS_SECRET ??
          'change_me_access_secret';

        const jwtAccessExpiresIn =
          (configService.get<string>('jwtAccessExpiresIn') ??
            process.env.JWT_ACCESS_EXPIRES_IN ??
            '7d') as StringValue;

        return {
          secret: jwtAccessSecret,
          signOptions: {
            expiresIn: jwtAccessExpiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthPasswordService, AuthRegisterService, AuthLoginService, JwtStrategy],
})
export class AuthModule {}