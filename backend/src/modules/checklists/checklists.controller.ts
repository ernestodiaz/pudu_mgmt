import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChecklistsService, ChecklistResponseDto } from './checklists.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ServiceType } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ChecklistsController {
  constructor(private service: ChecklistsService) {}

  @Get('checklist-templates')
  @ApiOperation({ summary: 'List checklist templates' })
  findTemplates(
    @Query('serviceType') serviceType?: ServiceType,
    @Query('modelId') modelId?: string,
  ) {
    return this.service.findAllTemplates(serviceType, modelId);
  }

  @Post('checklist-templates')
  @Roles(UserRole.BRAND_ADMIN)
  @ApiOperation({ summary: 'Create checklist template' })
  createTemplate(@Body() body: any) {
    return this.service.createTemplate(body);
  }

  @Get('service-orders/:orderId/checklists')
  @ApiOperation({ summary: 'Get checklist instances for a service order' })
  getOrderChecklists(@Param('orderId') orderId: string) {
    return this.service.getInstancesForOrder(orderId);
  }

  @Post('checklists/:instanceId/responses')
  @Roles(UserRole.BRAND_ADMIN, UserRole.BRAND_TECHNICIAN)
  @ApiOperation({ summary: 'Submit checklist responses (bulk)' })
  submitResponses(
    @Param('instanceId') instanceId: string,
    @Body() body: { responses: ChecklistResponseDto[] },
    @CurrentUser() user: User,
  ) {
    return this.service.submitResponses(instanceId, body.responses, user);
  }
}
