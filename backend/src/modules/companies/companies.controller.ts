import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CompaniesController {
  constructor(private service: CompaniesService) {}

  @Get('client-companies')
  @ApiOperation({ summary: 'List client companies (distributors)' })
  findAllClients(@Query('countryId') countryId?: string) {
    return this.service.findAllClients(countryId);
  }

  @Get('client-companies/:id')
  findClient(@Param('id') id: string) {
    return this.service.findClientById(id);
  }

  @Post('client-companies')
  @Roles(UserRole.BRAND_ADMIN)
  createClient(@Body() body: any) {
    return this.service.createClient(body);
  }

  @Put('client-companies/:id')
  @Roles(UserRole.BRAND_ADMIN)
  updateClient(@Param('id') id: string, @Body() body: any) {
    return this.service.updateClient(id, body);
  }

  @Get('end-user-companies')
  @ApiOperation({ summary: 'List end user companies' })
  findAllEndUsers(
    @Query('clientCompanyId') clientCompanyId?: string,
    @Query('countryId') countryId?: string,
  ) {
    return this.service.findAllEndUsers(clientCompanyId, countryId);
  }

  @Get('end-user-companies/:id')
  findEndUser(@Param('id') id: string) {
    return this.service.findEndUserById(id);
  }

  @Post('end-user-companies')
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  createEndUser(@Body() body: any) {
    return this.service.createEndUser(body);
  }

  @Put('end-user-companies/:id')
  @Roles(UserRole.BRAND_ADMIN, UserRole.CLIENT_ADMIN)
  updateEndUser(@Param('id') id: string, @Body() body: any) {
    return this.service.updateEndUser(id, body);
  }
}
