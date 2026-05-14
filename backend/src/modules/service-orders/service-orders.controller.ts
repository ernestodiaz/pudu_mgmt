import {
  Body, Controller, Get, HttpCode, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ServiceOrdersService, CreateServiceOrderDto, ServiceOrderFilter,
} from './service-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('service-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private service: ServiceOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List service orders with filters' })
  findAll(@Query() query: ServiceOrderFilter) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service order details' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN, UserRole.END_USER_ADMIN)
  @ApiOperation({ summary: 'Create a new service order' })
  create(@Body() dto: CreateServiceOrderDto, @CurrentUser() user: User) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Update service order details' })
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: User) {
    return this.service.update(id, body, user);
  }

  @Post(':id/assign')
  @Roles(UserRole.BRAND_ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Assign a technician to the order' })
  assign(
    @Param('id') id: string,
    @Body() body: { technicianId: string; scheduledDate?: Date },
    @CurrentUser() user: User,
  ) {
    return this.service.assign(id, body.technicianId, body.scheduledDate, user);
  }

  @Post(':id/start')
  @Roles(UserRole.BRAND_ADMIN, UserRole.BRAND_TECHNICIAN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark order as in progress (generates checklists)' })
  start(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.start(id, user);
  }

  @Post(':id/complete')
  @Roles(UserRole.BRAND_ADMIN, UserRole.BRAND_TECHNICIAN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Complete the service order' })
  complete(
    @Param('id') id: string,
    @Body() body: { resolutionNotes: string },
    @CurrentUser() user: User,
  ) {
    return this.service.complete(id, body.resolutionNotes, user);
  }

  @Post(':id/cancel')
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel the service order' })
  cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: User,
  ) {
    return this.service.cancel(id, body.reason, user);
  }
}
