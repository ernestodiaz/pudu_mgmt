import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClientCompany } from '../../companies/entities/client-company.entity';
import { User } from '../../users/entities/user.entity';
import { Technician } from '../../technicians/entities/technician.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 2, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  timezone: string;

  @Column({ length: 10, default: 'es' })
  defaultLanguage: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ClientCompany, (c) => c.country)
  clientCompanies: ClientCompany[];

  @OneToMany(() => User, (u) => u.country)
  users: User[];

  @OneToMany(() => Technician, (t) => t.country)
  technicians: Technician[];
}
