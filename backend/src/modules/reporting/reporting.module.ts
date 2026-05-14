import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { Robot } from '../robots/entities/robot.entity';
import { MaintenanceSchedule } from '../maintenance/entities/maintenance-schedule.entity';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrder, Robot, MaintenanceSchedule])],
  providers: [ReportingService],
  controllers: [ReportingController],
})
export class ReportingModule {}
