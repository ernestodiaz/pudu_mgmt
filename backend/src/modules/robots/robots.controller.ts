import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RobotsService, RobotFilter } from './robots.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('robots')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('robots')
export class RobotsController {
  constructor(private service: RobotsService) {}

  @Get()
  @ApiOperation({ summary: 'List robots with filters' })
  findAll(@Query() query: RobotFilter) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get robot details' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/service-history')
  @ApiOperation({ summary: 'Get full service history for a robot' })
  getHistory(@Param('id') id: string) {
    return this.service.getServiceHistory(id);
  }

  @Post()
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Register a new robot' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Update robot data' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
