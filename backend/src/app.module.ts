import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GeographyModule } from './modules/geography/geography.module';
import { EquipmentCatalogModule } from './modules/equipment-catalog/equipment-catalog.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { RobotsModule } from './modules/robots/robots.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportingModule } from './modules/reporting/reporting.module';

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

const ALL_ENTITIES = [
  Country, Brand, EquipmentModel, ClientCompany, EndUserCompany,
  User, Technician, Robot, ServiceOrder, ServiceOrderEvent,
  MaintenanceSchedule, MaintenanceAlert,
  ChecklistTemplate, ChecklistItem, ChecklistInstance, ChecklistResponse,
  Notification,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities: ALL_ENTITIES,
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<boolean>('database.logging'),
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('redis.url'),
      }),
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    UsersModule,
    GeographyModule,
    EquipmentCatalogModule,
    CompaniesModule,
    RobotsModule,
    TechniciansModule,
    ServiceOrdersModule,
    MaintenanceModule,
    ChecklistsModule,
    NotificationsModule,
    ReportingModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
