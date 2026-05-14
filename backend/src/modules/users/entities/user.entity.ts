import {
  BeforeInsert, BeforeUpdate, Column, CreateDateColumn,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../../common/enums';
import { Country } from '../../geography/entities/country.entity';
import { ClientCompany } from '../../companies/entities/client-company.entity';
import { EndUserCompany } from '../../companies/entities/end-user-company.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ length: 200 })
  fullName: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'jsonb', default: { notifications: { email: true, sms: false, push: true } } })
  preferences: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  refreshTokenHash: string;

  @Column({ nullable: true })
  fcmToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Country, (c) => c.users, { nullable: true })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ nullable: true })
  countryId: string;

  @ManyToOne(() => ClientCompany, (c) => c.users, { nullable: true })
  @JoinColumn({ name: 'client_company_id' })
  clientCompany: ClientCompany;

  @Column({ nullable: true })
  clientCompanyId: string;

  @ManyToOne(() => EndUserCompany, (e) => e.users, { nullable: true })
  @JoinColumn({ name: 'end_user_company_id' })
  endUserCompany: EndUserCompany;

  @Column({ nullable: true })
  endUserCompanyId: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    }
  }

  async validatePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.passwordHash);
  }
}
