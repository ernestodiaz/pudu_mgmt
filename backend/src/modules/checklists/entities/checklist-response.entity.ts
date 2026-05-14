import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { ChecklistInstance } from './checklist-instance.entity';
import { ChecklistItem } from './checklist-item.entity';

@Entity('checklist_responses')
export class ChecklistResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', array: true, default: [] })
  photoUrls: string[];

  @Column({ default: false })
  passed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ChecklistInstance, (i) => i.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instance_id' })
  instance: ChecklistInstance;

  @Column()
  instanceId: string;

  @ManyToOne(() => ChecklistItem)
  @JoinColumn({ name: 'item_id' })
  item: ChecklistItem;

  @Column()
  itemId: string;
}
