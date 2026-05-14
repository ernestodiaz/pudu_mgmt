import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientCompany } from './entities/client-company.entity';
import { EndUserCompany } from './entities/end-user-company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(ClientCompany) private clientRepo: Repository<ClientCompany>,
    @InjectRepository(EndUserCompany) private endUserRepo: Repository<EndUserCompany>,
  ) {}

  // Client Companies
  findAllClients(countryId?: string) {
    const where: any = { isActive: true };
    if (countryId) where.countryId = countryId;
    return this.clientRepo.find({ where, relations: ['country'], order: { name: 'ASC' } });
  }

  async findClientById(id: string) {
    const company = await this.clientRepo.findOne({
      where: { id },
      relations: ['country', 'endUserCompanies'],
    });
    if (!company) throw new NotFoundException(`Client company ${id} not found`);
    return company;
  }

  async createClient(data: Partial<ClientCompany>) {
    const company = this.clientRepo.create(data);
    return this.clientRepo.save(company);
  }

  async updateClient(id: string, data: Partial<ClientCompany>) {
    await this.findClientById(id);
    await this.clientRepo.update(id, data);
    return this.findClientById(id);
  }

  // End User Companies
  findAllEndUsers(clientCompanyId?: string, countryId?: string) {
    const where: any = { isActive: true };
    if (clientCompanyId) where.clientCompanyId = clientCompanyId;
    if (countryId) where.countryId = countryId;
    return this.endUserRepo.find({
      where,
      relations: ['country', 'clientCompany'],
      order: { name: 'ASC' },
    });
  }

  async findEndUserById(id: string) {
    const company = await this.endUserRepo.findOne({
      where: { id },
      relations: ['country', 'clientCompany', 'robots'],
    });
    if (!company) throw new NotFoundException(`End user company ${id} not found`);
    return company;
  }

  async createEndUser(data: Partial<EndUserCompany>) {
    const company = this.endUserRepo.create(data);
    return this.endUserRepo.save(company);
  }

  async updateEndUser(id: string, data: Partial<EndUserCompany>) {
    await this.findEndUserById(id);
    await this.endUserRepo.update(id, data);
    return this.findEndUserById(id);
  }
}
