import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { INITIAL_BALANCE_KZT } from '../../../common/constants/balance.constants';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponse } from '../types/register-response.type';
import { AuthPasswordService } from './auth-password.service';

@Injectable()
export class AuthRegisterService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly authPasswordService: AuthPasswordService,
  ) {}

  public async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser !== null) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Email already exists',
        errorCode: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
      });
    }

    const passwordHash = await this.authPasswordService.hashPassword(registerDto.password);

    const result = await this.prismaService.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: registerDto.email,
          passwordHash,
        },
      });

      const createdBalance = await tx.balance.create({
        data: {
          userId: createdUser.id,
          amountKzt: INITIAL_BALANCE_KZT,
        },
      });

      const createdAgentSettings = await tx.agentSettings.create({
        data: {
          userId: createdUser.id,
          isEnabled: false,
          dailyLimitKzt: 0,
          perTransactionLimitKzt: 0,
          requireConfirmNewSeller: true,
        },
      });

      return {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          createdAt: createdUser.createdAt.toISOString(),
        },
        balance: {
          amountKzt: createdBalance.amountKzt,
          updatedAt: createdBalance.updatedAt.toISOString(),
        },
        agentSettings: {
          isEnabled: createdAgentSettings.isEnabled,
          dailyLimitKzt: createdAgentSettings.dailyLimitKzt,
          perTransactionLimitKzt: createdAgentSettings.perTransactionLimitKzt,
          requireConfirmNewSeller: createdAgentSettings.requireConfirmNewSeller,
          updatedAt: createdAgentSettings.updatedAt.toISOString(),
        },
      };
    });

    return result;
  }
}