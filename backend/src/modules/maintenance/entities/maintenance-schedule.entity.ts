import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { MaintenanceScheduleStatus } from '../../../common/enums';
import { Robot } from '../../robots/entities/robot.entity';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';
import { MaintenanceAlert } from './maintenance-alert.entity';

@Entity('maintenance_schedules')
export class MaintenanceSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  lastServiceDate: Date;

  @Column({ type: 'date' })
  nextDueDate: Date;

  @Column({
    type: 'enum',
    enum: MaintenanceScheduleStatus,
    default: MaintenanceScheduleStatus.UPCOMING,
  })
  status: MaintenanceScheduleStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Robot, (r) => r.maintenanceSchedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'robot_id' })
  robot: Robot;

  @Column()
  robotId: string;

  @ManyToOne(() => ServiceOrder, { nullable: true })
  @JoinColumn({ name: 'last_service_order_id' })
  lastServiceOrder: ServiceOrder;

  @Column({ nullable: true })
  lastServiceOrderId: string;

  @OneToMany(() => MaintenanceAlert, (a) => a.schedule, { cascade: true })
  alerts: MaintenanceAlert[];
}
