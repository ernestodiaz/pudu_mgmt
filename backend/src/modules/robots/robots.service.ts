import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Robot } from './entities/robot.entity';
import { RobotStatus } from '../../common/enums';

export interface RobotFilter {
  countryId?: string;
  clientCompanyId?: string;
  endUserCompanyId?: string;
  modelId?: string;
  status?: RobotStatus;
}

@Injectable()
export class RobotsService {
  constructor(@InjectRepository(Robot) private robotRepo: Repository<Robot>) {}

  findAll(filter: RobotFilter = {}) {
    const where: any = {};
    if (filter.countryId) where.countryId = filter.countryId;
    if (filter.clientCompanyId) where.clientCompanyId = filter.clientCompanyId;
    if (filter.endUserCompanyId) where.endUserCompanyId = filter.endUserCompanyId;
    if (filter.modelId) where.modelId = filter.modelId;
    if (filter.status) where.status = filter.status;

    return this.robotRepo.find({
      where,
      relations: ['model', 'model.brand', 'endUserCompany', 'clientCompany', 'country'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const robot = await this.robotRepo.findOne({
      where: { id },
      relations: [
        'model', 'model.brand',
        'endUserCompany', 'endUserCompany.country',
        'clientCompany',
        'country',
      ],
    });
    if (!robot) throw new NotFoundException(`Robot ${id} not found`);
    return robot;
  }

  async findBySerial(serialNumber: string) {
    return this.robotRepo.findOne({
      where: { serialNumber },
      relations: ['model', 'endUserCompany', 'clientCompany', 'country'],
    });
  }

  async create(data: Partial<Robot>) {
    const robot = this.robotRepo.create(data);
    return this.robotRepo.save(robot);
  }

  async update(id: string, data: Partial<Robot>) {
    await this.findOne(id);
    await this.robotRepo.update(id, data);
    return this.findOne(id);
  }

  async getServiceHistory(id: string) {
    const robot = await this.robotRepo.findOne({
      where: { id },
      relations: [
        'serviceOrders',
        'serviceOrders.assignedTechnician',
        'serviceOrders.assignedTechnician.user',
        'serviceOrders.events',
        'maintenanceSchedules',
        'maintenanceSchedules.alerts',
      ],
    });
    if (!robot) throw new NotFoundException(`Robot ${id} not found`);
    return robot;
  }
}
