import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { MaintenanceScheduleStatus } from '../../common/enums';

@ApiTags('maintenance')
@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private service: MaintenanceService) {}

  @Get()
  @ApiOperation({ summary: 'List maintenance schedules' })
  findAll(@Query('status') status?: MaintenanceScheduleStatus) {
    return this.service.findAll({ status });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get robots with upcoming maintenance (next 90 days)' })
  getUpcoming(@Query('days') days?: string) {
    return this.service.getUpcoming(days ? parseInt(days) : 90);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get robots with overdue maintenance' })
  getOverdue() {
    return this.service.getOverdue();
  }

  @Put('alerts/:alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a maintenance alert' })
  acknowledgeAlert(@Param('alertId') alertId: string, @CurrentUser() user: User) {
    return this.service.acknowledgeAlert(alertId, user.id);
  }
}
