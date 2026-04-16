import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { INITIAL_BALANCE_KZT } from '../../../common/constants/balance.constants';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponse } from '../types/register-response.type';
import { AgentSettingsService } from '../../agent-settings/services/agent-settings.service';
import { BalancesService } from '../../balances/services/balances.service';
import { UsersService } from '../../users/services/users.service';
import { AuthPasswordService } from './auth-password.service';

@Injectable()
export class AuthRegisterService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly balancesService: BalancesService,
    private readonly agentSettingsService: AgentSettingsService,
    private readonly authPasswordService: AuthPasswordService,
  ) {}

  public async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser !== null) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Email already exists',
        errorCode: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
      });
    }

    const passwordHash = await this.authPasswordService.hashPassword(registerDto.password);

    const createdUser = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
      },
    });

    const createdBalance = await this.balancesService.createInitialBalance(
      createdUser.id,
      INITIAL_BALANCE_KZT,
    );

    const createdAgentSettings = await this.agentSettingsService.createDefaultSettings(
      createdUser.id,
    );

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
  }
}