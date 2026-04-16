import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { type JwtPayload } from '../../../common/types/jwt-payload.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateAgentSettingsDto } from '../dto/update-agent-settings.dto';
import { AgentSettingsService } from '../services/agent-settings.service';
import { AgentSettingsResponse } from '../types/agent-settings-response.type';
import { UpdateAgentSettingsResponse } from '../types/update-agent-settings-response.type';

@ApiTags('Agent Settings')
@ApiBearerAuth()
@Controller('settings/agent-payments')
export class AgentSettingsController {
  public constructor(private readonly agentSettingsService: AgentSettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user agent payment settings',
  })
  @ApiOkResponse({
    description: 'Returns current agent payment settings',
  })
  public async getSettings(@CurrentUser() user: JwtPayload): Promise<AgentSettingsResponse> {
    return this.agentSettingsService.getByUserId(user.sub);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update current user agent payment settings',
  })
  @ApiOkResponse({
    description: 'Returns updated agent payment settings',
  })
  public async updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateAgentSettingsDto,
  ): Promise<UpdateAgentSettingsResponse> {
    return this.agentSettingsService.updateByUserId(user.sub, updateDto);
  }
}