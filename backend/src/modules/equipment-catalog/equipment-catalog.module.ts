import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { EquipmentModel } from './entities/equipment-model.entity';
import { EquipmentCatalogService } from './equipment-catalog.service';
import { EquipmentCatalogController } from './equipment-catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, EquipmentModel])],
  providers: [EquipmentCatalogService],
  controllers: [EquipmentCatalogController],
  exports: [EquipmentCatalogService],
})
export class EquipmentCatalogModule {}
