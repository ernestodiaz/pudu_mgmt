import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Robot } from '../../robots/entities/robot.entity';
import { ChecklistTemplate } from '../../checklists/entities/checklist-template.entity';

@Entity('equipment_models')
export class EquipmentModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  slug: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ default: 365 })
  preventiveIntervalDays: number;

  @Column('int', { array: true, default: [30, 60, 90] })
  alertDaysBefore: number[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Brand, (b) => b.models, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column()
  brandId: string;

  @OneToMany(() => Robot, (r) => r.model)
  robots: Robot[];

  @OneToMany(() => ChecklistTemplate, (c) => c.model)
  checklistTemplates: ChecklistTemplate[];
}
