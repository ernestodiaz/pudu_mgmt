import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('technicians')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('technicians')
export class TechniciansController {
  constructor(private service: TechniciansService) {}

  @Get()
  @ApiOperation({ summary: 'List technicians' })
  @ApiQuery({ name: 'countryId', required: false })
  @ApiQuery({ name: 'available', required: false, type: Boolean })
  findAll(@Query('countryId') countryId?: string, @Query('available') available?: string) {
    const availableFilter = available !== undefined ? available === 'true' : undefined;
    return this.service.findAll(countryId, availableFilter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: "Get technician's upcoming schedule" })
  getSchedule(@Param('id') id: string) {
    return this.service.getSchedule(id);
  }

  @Post()
  @Roles(UserRole.BRAND_ADMIN)
  @ApiOperation({ summary: 'Create technician with user account' })
  create(@Body() body: any) {
    const { countryId, specializations, ...userDto } = body;
    return this.service.create(userDto, { countryId, specializations });
  }

  @Put(':id')
  @Roles(UserRole.BRAND_ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Put(':id/availability')
  @Roles(UserRole.BRAND_ADMIN, UserRole.BRAND_TECHNICIAN)
  @ApiOperation({ summary: 'Set technician availability' })
  setAvailability(@Param('id') id: string, @Body() body: { isAvailable: boolean }) {
    return this.service.setAvailability(id, body.isAvailable);
  }
}
