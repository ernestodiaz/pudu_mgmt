import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technician } from './entities/technician.entity';
import { UsersService, CreateUserDto } from '../users/users.service';
import { UserRole } from '../../common/enums';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(Technician) private technicianRepo: Repository<Technician>,
    private usersService: UsersService,
  ) {}

  findAll(countryId?: string, available?: boolean) {
    const where: any = {};
    if (countryId) where.countryId = countryId;
    if (available !== undefined) where.isAvailable = available;
    return this.technicianRepo.find({
      where,
      relations: ['user', 'country'],
      order: { country: { name: 'ASC' } },
    });
  }

  async findOne(id: string) {
    const technician = await this.technicianRepo.findOne({
      where: { id },
      relations: ['user', 'country', 'serviceOrders'],
    });
    if (!technician) throw new NotFoundException(`Technician ${id} not found`);
    return technician;
  }

  async findByUserId(userId: string) {
    return this.technicianRepo.findOne({
      where: { userId },
      relations: ['user', 'country'],
    });
  }

  async create(userDto: CreateUserDto, techData: { countryId: string; specializations?: string[] }) {
    const user = await this.usersService.create({
      ...userDto,
      role: UserRole.BRAND_TECHNICIAN,
    });

    const technician = this.technicianRepo.create({
      userId: user.id,
      countryId: techData.countryId,
      specializations: techData.specializations || [],
    });
    return this.technicianRepo.save(technician);
  }

  async update(id: string, data: Partial<Technician>) {
    await this.findOne(id);
    await this.technicianRepo.update(id, data);
    return this.findOne(id);
  }

  async setAvailability(id: string, isAvailable: boolean) {
    await this.findOne(id);
    await this.technicianRepo.update(id, { isAvailable });
    return this.findOne(id);
  }

  async getSchedule(id: string) {
    const technician = await this.technicianRepo.findOne({
      where: { id },
      relations: [
        'serviceOrders',
        'serviceOrders.robot',
        'serviceOrders.endUserCompany',
      ],
    });
    if (!technician) throw new NotFoundException();
    return {
      technician,
      upcomingOrders: technician.serviceOrders
        .filter((o) => ['assigned', 'in_progress', 'scheduled'].includes(o.status))
        .sort((a, b) => (a.scheduledDate > b.scheduledDate ? 1 : -1)),
    };
  }
}
