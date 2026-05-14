import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Country } from './modules/geography/entities/country.entity';
import { Brand } from './modules/equipment-catalog/entities/brand.entity';
import { EquipmentModel } from './modules/equipment-catalog/entities/equipment-model.entity';
import { ClientCompany } from './modules/companies/entities/client-company.entity';
import { EndUserCompany } from './modules/companies/entities/end-user-company.entity';
import { User } from './modules/users/entities/user.entity';
import { Technician } from './modules/technicians/entities/technician.entity';
import { Robot } from './modules/robots/entities/robot.entity';
import { ServiceOrder } from './modules/service-orders/entities/service-order.entity';
import { ServiceOrderEvent } from './modules/service-orders/entities/service-order-event.entity';
import { MaintenanceSchedule } from './modules/maintenance/entities/maintenance-schedule.entity';
import { MaintenanceAlert } from './modules/maintenance/entities/maintenance-alert.entity';
import { ChecklistTemplate } from './modules/checklists/entities/checklist-template.entity';
import { ChecklistItem } from './modules/checklists/entities/checklist-item.entity';
import { ChecklistInstance } from './modules/checklists/entities/checklist-instance.entity';
import { ChecklistResponse } from './modules/checklists/entities/checklist-response.entity';
import { Notification } from './modules/notifications/entities/notification.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'pudu',
  password: process.env.POSTGRES_PASSWORD || 'pudu_secret',
  database: process.env.POSTGRES_DB || 'pudu_db',
  entities: [
    Country, Brand, EquipmentModel, ClientCompany, EndUserCompany,
    User, Technician, Robot, ServiceOrder, ServiceOrderEvent,
    MaintenanceSchedule, MaintenanceAlert,
    ChecklistTemplate, ChecklistItem, ChecklistInstance, ChecklistResponse,
    Notification,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
