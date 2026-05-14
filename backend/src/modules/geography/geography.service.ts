import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';

@Injectable()
export class GeographyService {
  constructor(
    @InjectRepository(Country) private countryRepo: Repository<Country>,
  ) {}

  findAll() {
    return this.countryRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const country = await this.countryRepo.findOne({ where: { id } });
    if (!country) throw new NotFoundException(`Country ${id} not found`);
    return country;
  }

  async create(data: Partial<Country>) {
    const country = this.countryRepo.create(data);
    return this.countryRepo.save(country);
  }

  async update(id: string, data: Partial<Country>) {
    await this.findOne(id);
    await this.countryRepo.update(id, data);
    return this.findOne(id);
  }
}
