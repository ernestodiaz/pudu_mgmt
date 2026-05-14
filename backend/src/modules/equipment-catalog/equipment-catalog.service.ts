import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { EquipmentModel } from './entities/equipment-model.entity';

@Injectable()
export class EquipmentCatalogService {
  constructor(
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(EquipmentModel) private modelRepo: Repository<EquipmentModel>,
  ) {}

  // Brands
  findAllBrands() {
    return this.brandRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findBrandById(id: string) {
    const brand = await this.brandRepo.findOne({ where: { id }, relations: ['models'] });
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);
    return brand;
  }

  async createBrand(data: Partial<Brand>) {
    const brand = this.brandRepo.create(data);
    return this.brandRepo.save(brand);
  }

  async updateBrand(id: string, data: Partial<Brand>) {
    await this.findBrandById(id);
    await this.brandRepo.update(id, data);
    return this.findBrandById(id);
  }

  // Models
  findAllModels(brandId?: string) {
    const where: any = { isActive: true };
    if (brandId) where.brandId = brandId;
    return this.modelRepo.find({ where, relations: ['brand'], order: { name: 'ASC' } });
  }

  async findModelById(id: string) {
    const model = await this.modelRepo.findOne({
      where: { id },
      relations: ['brand'],
    });
    if (!model) throw new NotFoundException(`Model ${id} not found`);
    return model;
  }

  async createModel(data: Partial<EquipmentModel>) {
    const model = this.modelRepo.create(data);
    return this.modelRepo.save(model);
  }

  async updateModel(id: string, data: Partial<EquipmentModel>) {
    await this.findModelById(id);
    await this.modelRepo.update(id, data);
    return this.findModelById(id);
  }
}
