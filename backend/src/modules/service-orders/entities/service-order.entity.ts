import {
  BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { ServiceType, ServiceStatus, ServiceMode, ServicePriority } from '../../../common/enums';
import { Robot } from '../../robots/entities/robot.entity';
import { EndUserCompany } from '../../companies/entities/end-user-company.entity';
import { ClientCompany } from '../../companies/entities/client-company.entity';
import { Technician } from '../../technicians/entities/technician.entity';
import { User } from '../../users/entities/user.entity';
import { ServiceOrderEvent } from './service-order-event.entity';
import { ChecklistInstance } from '../../checklists/entities/checklist-instance.entity';

@Entity('service_orders')
export class ServiceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 30, unique: true })
  orderNumber: string;

  @Column({ type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  @Column({ type: 'enum', enum: ServiceMode, default: ServiceMode.ON_SITE })
  serviceMode: ServiceMode;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.DRAFT })
  status: ServiceStatus;

  @Column({ type: 'enum', enum: ServicePriority, default: ServicePriority.NORMAL })
  priority: ServicePriority;

  @Column({ default: false })
  includesTraining: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Robot, (r) => r.serviceOrders, { nullable: true })
  @JoinColumn({ name: 'robot_id' })
  robot: Robot;

  @Column({ nullable: true })
  robotId: string;

  @ManyToOne(() => EndUserCompany, (e) => e.serviceOrders, { nullable: true })
  @JoinColumn({ name: 'end_user_company_id' })
  endUserCompany: EndUserCompany;

  @Column({ nullable: true })
  endUserCompanyId: string;

  @ManyToOne(() => ClientCompany, (c) => c.serviceOrders, { nullable: true })
  @JoinColumn({ name: 'client_company_id' })
  clientCompany: ClientCompany;

  @Column({ nullable: true })
  clientCompanyId: string;

  @ManyToOne(() => Technician, (t) => t.serviceOrders, { nullable: true })
  @JoinColumn({ name: 'assigned_technician_id' })
  assignedTechnician: Technician;

  @Column({ nullable: true })
  assignedTechnicianId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy: User;

  @Column({ nullable: true })
  requestedById: string;

  @OneToMany(() => ServiceOrderEvent, (e) => e.order, { cascade: true })
  events: ServiceOrderEvent[];

  @OneToMany(() => ChecklistInstance, (c) => c.serviceOrder)
  checklistInstances: ChecklistInstance[];

  @BeforeInsert()
  generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 90000) + 10000;
    this.orderNumber = `SO-${year}-${random}`;
  }
}
