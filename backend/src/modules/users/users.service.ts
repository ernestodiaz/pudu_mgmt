import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums';

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  countryId?: string;
  clientCompanyId?: string;
  endUserCompanyId?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(filter?: Partial<{ role: UserRole; clientCompanyId: string; endUserCompanyId: string; countryId: string }>) {
    const where: any = { isActive: true };
    if (filter?.role) where.role = filter.role;
    if (filter?.clientCompanyId) where.clientCompanyId = filter.clientCompanyId;
    if (filter?.endUserCompanyId) where.endUserCompanyId = filter.endUserCompanyId;
    if (filter?.countryId) where.countryId = filter.countryId;

    return this.userRepo.find({
      where,
      relations: ['country', 'clientCompany', 'endUserCompany'],
      order: { fullName: 'ASC' },
    });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['country', 'clientCompany', 'endUserCompany'],
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const user = this.userRepo.create({
      ...dto,
      passwordHash: dto.password,
    });
    return this.userRepo.save(user);
  }

  async update(id: string, data: Partial<CreateUserDto>) {
    await this.findOne(id);
    if (data.password) {
      (data as any).passwordHash = data.password;
      delete data.password;
    }
    await this.userRepo.update(id, data as any);
    return this.findOne(id);
  }

  async deactivate(id: string) {
    await this.findOne(id);
    await this.userRepo.update(id, { isActive: false });
  }
}
