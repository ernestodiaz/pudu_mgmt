import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { ChecklistScope, ServiceType } from '../../../common/enums';
import { EquipmentModel } from '../../equipment-catalog/entities/equipment-model.entity';
import { ChecklistItem } from './checklist-item.entity';
import { ChecklistInstance } from './checklist-instance.entity';

@Entity('checklist_templates')
export class ChecklistTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  @Column({ type: 'enum', enum: ChecklistScope })
  scope: ChecklistScope;

  @Column({ default: 1 })
  version: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => EquipmentModel, (m) => m.checklistTemplates, { nullable: true })
  @JoinColumn({ name: 'model_id' })
  model: EquipmentModel;

  @Column({ nullable: true })
  modelId: string;

  @OneToMany(() => ChecklistItem, (i) => i.template, { cascade: true, eager: true })
  items: ChecklistItem[];

  @OneToMany(() => ChecklistInstance, (i) => i.template)
  instances: ChecklistInstance[];
}
