import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EquipmentCatalogService } from './equipment-catalog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('equipment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class EquipmentCatalogController {
  constructor(private service: EquipmentCatalogService) {}

  @Get('brands')
  @ApiOperation({ summary: 'List all brands' })
  findAllBrands() {
    return this.service.findAllBrands();
  }

  @Get('brands/:id')
  findBrand(@Param('id') id: string) {
    return this.service.findBrandById(id);
  }

  @Post('brands')
  @Roles(UserRole.BRAND_ADMIN)
  createBrand(@Body() body: any) {
    return this.service.createBrand(body);
  }

  @Put('brands/:id')
  @Roles(UserRole.BRAND_ADMIN)
  updateBrand(@Param('id') id: string, @Body() body: any) {
    return this.service.updateBrand(id, body);
  }

  @Get('models')
  @ApiOperation({ summary: 'List equipment models' })
  findAllModels(@Query('brandId') brandId?: string) {
    return this.service.findAllModels(brandId);
  }

  @Get('models/:id')
  findModel(@Param('id') id: string) {
    return this.service.findModelById(id);
  }

  @Post('models')
  @Roles(UserRole.BRAND_ADMIN)
  createModel(@Body() body: any) {
    return this.service.createModel(body);
  }

  @Put('models/:id')
  @Roles(UserRole.BRAND_ADMIN)
  updateModel(@Param('id') id: string, @Body() body: any) {
    return this.service.updateModel(id, body);
  }
}
