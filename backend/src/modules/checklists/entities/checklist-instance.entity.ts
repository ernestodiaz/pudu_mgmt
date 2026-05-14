import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { ChecklistInstanceStatus } from '../../../common/enums';
import { ChecklistTemplate } from './checklist-template.entity';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';
import { User } from '../../users/entities/user.entity';
import { ChecklistResponse } from './checklist-response.entity';

@Entity('checklist_instances')
export class ChecklistInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ChecklistInstanceStatus, default: ChecklistInstanceStatus.PENDING })
  status: ChecklistInstanceStatus;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ChecklistTemplate, (t) => t.instances)
  @JoinColumn({ name: 'template_id' })
  template: ChecklistTemplate;

  @Column()
  templateId: string;

  @ManyToOne(() => ServiceOrder, (o) => o.checklistInstances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_order_id' })
  serviceOrder: ServiceOrder;

  @Column()
  serviceOrderId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completed_by_id' })
  completedBy: User;

  @Column({ nullable: true })
  completedById: string;

  @OneToMany(() => ChecklistResponse, (r) => r.instance, { cascade: true })
  responses: ChecklistResponse[];
}
