import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GeographyService } from './geography.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('geography')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('countries')
export class GeographyController {
  constructor(private service: GeographyService) {}

  @Get()
  @ApiOperation({ summary: 'List all countries' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get country by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.BRAND_ADMIN)
  @ApiOperation({ summary: 'Create country' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  @Roles(UserRole.BRAND_ADMIN)
  @ApiOperation({ summary: 'Update country' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
