import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { ChecklistInputType } from '../../../common/enums';
import { ChecklistTemplate } from './checklist-template.entity';

@Entity('checklist_items')
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderIndex: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ChecklistInputType, default: ChecklistInputType.BOOLEAN })
  inputType: ChecklistInputType;

  @Column({ type: 'jsonb', nullable: true })
  options: string[];

  @Column({ default: true })
  isRequired: boolean;

  @Column({ default: false })
  critical: boolean;

  @Column({ type: 'text', nullable: true })
  helpText: string;

  @ManyToOne(() => ChecklistTemplate, (t) => t.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: ChecklistTemplate;

  @Column()
  templateId: string;
}
