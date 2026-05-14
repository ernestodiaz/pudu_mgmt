import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportingService, ReportFilter } from './reporting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportingController {
  constructor(private service: ReportingService) {}

  @Get('dashboard')
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Dashboard KPIs' })
  getDashboard(@Query() filter: ReportFilter) {
    return this.service.getDashboardKpis(filter);
  }

  @Get('service-summary')
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Service orders summary report' })
  getServiceSummary(@Query() filter: ReportFilter) {
    return this.service.getServiceSummary(filter);
  }

  @Get('robots/:id')
  @ApiOperation({ summary: 'Complete report for a specific robot' })
  getRobotReport(@Param('id') id: string) {
    return this.service.getRobotReport(id);
  }

  @Get('maintenance-compliance')
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Maintenance compliance report' })
  getMaintenanceCompliance(@Query() filter: ReportFilter) {
    return this.service.getMaintenanceCompliance(filter);
  }
}
