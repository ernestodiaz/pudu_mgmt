import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceStatus } from '../../../common/enums';
import { ServiceOrder } from './service-order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('service_order_events')
export class ServiceOrderEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  eventType: string;

  @Column({ type: 'enum', enum: ServiceStatus, nullable: true })
  oldStatus: ServiceStatus;

  @Column({ type: 'enum', enum: ServiceStatus, nullable: true })
  newStatus: ServiceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ServiceOrder, (o) => o.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: ServiceOrder;

  @Column()
  orderId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ nullable: true })
  actorId: string;
}
