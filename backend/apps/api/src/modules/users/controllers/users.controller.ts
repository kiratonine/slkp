import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { type JwtPayload } from '../../../common/types/jwt-payload.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { UserPublic } from '../types/user-public.type';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user',
  })
  @ApiOkResponse({
    description: 'Returns current authenticated user',
  })
  public async getMe(@CurrentUser() user: JwtPayload): Promise<UserPublic> {
    const dbUser = await this.usersService.findById(user.sub);

    return {
      id: dbUser!.id,
      email: dbUser!.email,
      createdAt: dbUser!.createdAt.toISOString(),
    };
  }
}