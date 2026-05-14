import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '../../geography/entities/country.entity';
import { EndUserCompany } from './end-user-company.entity';
import { User } from '../../users/entities/user.entity';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';

@Entity('client_companies')
export class ClientCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, nullable: true })
  taxId: string;

  @Column({ length: 200, nullable: true })
  contactEmail: string;

  @Column({ length: 30, nullable: true })
  contactPhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Country, (c) => c.clientCompanies)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  countryId: string;

  @OneToMany(() => EndUserCompany, (e) => e.clientCompany)
  endUserCompanies: EndUserCompany[];

  @OneToMany(() => User, (u) => u.clientCompany)
  users: User[];

  @OneToMany(() => ServiceOrder, (o) => o.clientCompany)
  serviceOrders: ServiceOrder[];
}
