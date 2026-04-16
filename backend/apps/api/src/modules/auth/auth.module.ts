import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthRegisterService } from './services/auth-register.service';

@Module({
  controllers: [AuthController],
  providers: [AuthPasswordService, AuthRegisterService],
})
export class AuthModule {}