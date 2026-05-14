import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceSchedule } from './entities/maintenance-schedule.entity';
import { MaintenanceAlert } from './entities/maintenance-alert.entity';
import { Robot } from '../robots/entities/robot.entity';
import { MaintenanceService, MAINTENANCE_QUEUE } from './maintenance.service';
import { MaintenanceProcessor } from './maintenance.processor';
import { MaintenanceController } from './maintenance.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceSchedule, MaintenanceAlert, Robot]),
    BullModule.registerQueue({ name: MAINTENANCE_QUEUE }),
    ScheduleModule.forRoot(),
    forwardRef(() => NotificationsModule),
  ],
  providers: [MaintenanceService, MaintenanceProcessor],
  controllers: [MaintenanceController],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
