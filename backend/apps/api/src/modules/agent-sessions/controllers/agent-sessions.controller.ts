import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { type JwtPayload } from '../../../common/types/jwt-payload.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateAgentSessionDto } from '../dto/create-agent-session.dto';
import { CreateAgentSessionResponse } from '../types/create-agent-session-response.type';
import { ListAgentSessionsResponse } from '../types/list-agent-sessions-response.type';
import { RevokeAgentSessionResponse } from '../types/revoke-agent-session-response.type';
import { AgentSessionsService } from '../services/agent-sessions.service';
import { GetAgentSessionResponse } from '../types/get-agent-session-response.type';

@ApiTags('Agent Sessions')
@ApiBearerAuth()
@Controller('agent-sessions')
export class AgentSessionsController {
  public constructor(private readonly agentSessionsService: AgentSessionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create agent session',
  })
  @ApiCreatedResponse({
    description: 'Agent session successfully created',
  })
  public async create(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateAgentSessionDto,
  ): Promise<CreateAgentSessionResponse> {
    return this.agentSessionsService.create(user.sub, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List current user agent sessions',
    description: 'Returns all agent sessions created by the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Returns current user agent sessions',
  })
  public async list(@CurrentUser() user: JwtPayload): Promise<ListAgentSessionsResponse> {
    return this.agentSessionsService.list(user.sub);
  }

  @Post(':id/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Revoke agent session',
  })
  @ApiOkResponse({
    description: 'Agent session successfully revoked',
  })
  public async revoke(
    @CurrentUser() user: JwtPayload,
    @Param('id') sessionId: string,
  ): Promise<RevokeAgentSessionResponse> {
    return this.agentSessionsService.revoke(user.sub, sessionId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user agent session by id',
    description: 'Returns one agent session that belongs to the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Returns current user agent session by id',
  })
  public async getById(
    @CurrentUser() user: JwtPayload,
    @Param('id') sessionId: string,
  ): Promise<GetAgentSessionResponse> {
    return this.agentSessionsService.getById(user.sub, sessionId);
  }
}