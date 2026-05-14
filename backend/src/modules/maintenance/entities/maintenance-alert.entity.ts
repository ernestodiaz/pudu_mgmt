import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { MaintenanceSchedule } from './maintenance-schedule.entity';
import { User } from '../../users/entities/user.entity';

@Entity('maintenance_alerts')
export class MaintenanceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  alertType: string;

  @Column()
  daysBefore: number;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => MaintenanceSchedule, (s) => s.alerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: MaintenanceSchedule;

  @Column()
  scheduleId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acknowledged_by_id' })
  acknowledgedBy: User;

  @Column({ nullable: true })
  acknowledgedById: string;
}
