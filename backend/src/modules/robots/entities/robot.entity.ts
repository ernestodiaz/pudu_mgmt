import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { RobotStatus } from '../../../common/enums';
import { EquipmentModel } from '../../equipment-catalog/entities/equipment-model.entity';
import { EndUserCompany } from '../../companies/entities/end-user-company.entity';
import { ClientCompany } from '../../companies/entities/client-company.entity';
import { Country } from '../../geography/entities/country.entity';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';
import { MaintenanceSchedule } from '../../maintenance/entities/maintenance-schedule.entity';

@Entity('robots')
export class Robot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  serialNumber: string;

  @Column({ type: 'enum', enum: RobotStatus, default: RobotStatus.ACTIVE })
  status: RobotStatus;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  @Column({ length: 50, nullable: true })
  firmwareVersion: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => EquipmentModel, (m) => m.robots, { eager: true })
  @JoinColumn({ name: 'model_id' })
  model: EquipmentModel;

  @Column()
  modelId: string;

  @ManyToOne(() => EndUserCompany, (e) => e.robots, { nullable: true })
  @JoinColumn({ name: 'end_user_company_id' })
  endUserCompany: EndUserCompany;

  @Column({ nullable: true })
  endUserCompanyId: string;

  @ManyToOne(() => ClientCompany, { nullable: true })
  @JoinColumn({ name: 'client_company_id' })
  clientCompany: ClientCompany;

  @Column({ nullable: true })
  clientCompanyId: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  countryId: string;

  @OneToMany(() => ServiceOrder, (o) => o.robot)
  serviceOrders: ServiceOrder[];

  @OneToMany(() => MaintenanceSchedule, (m) => m.robot)
  maintenanceSchedules: MaintenanceSchedule[];
}
