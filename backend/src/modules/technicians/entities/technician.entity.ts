import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Country } from '../../geography/entities/country.entity';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';

@Entity('technicians')
export class Technician {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', array: true, default: [] })
  specializations: string[];

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'jsonb', default: {} })
  schedule: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Country, (c) => c.technicians)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  countryId: string;

  @OneToMany(() => ServiceOrder, (o) => o.assignedTechnician)
  serviceOrders: ServiceOrder[];
}
