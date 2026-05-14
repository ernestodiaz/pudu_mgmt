import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '../../geography/entities/country.entity';
import { ClientCompany } from './client-company.entity';
import { Robot } from '../../robots/entities/robot.entity';
import { User } from '../../users/entities/user.entity';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';

@Entity('end_user_companies')
export class EndUserCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 200, nullable: true })
  contactEmail: string;

  @Column({ length: 30, nullable: true })
  contactPhone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ClientCompany, (c) => c.endUserCompanies, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_company_id' })
  clientCompany: ClientCompany;

  @Column()
  clientCompanyId: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  countryId: string;

  @OneToMany(() => Robot, (r) => r.endUserCompany)
  robots: Robot[];

  @OneToMany(() => User, (u) => u.endUserCompany)
  users: User[];

  @OneToMany(() => ServiceOrder, (o) => o.endUserCompany)
  serviceOrders: ServiceOrder[];
}
