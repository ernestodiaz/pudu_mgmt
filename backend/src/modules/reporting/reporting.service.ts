import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { Robot } from '../robots/entities/robot.entity';
import { MaintenanceSchedule } from '../maintenance/entities/maintenance-schedule.entity';
import { ServiceStatus, ServiceType, MaintenanceScheduleStatus } from '../../common/enums';

export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  countryId?: string;
  clientCompanyId?: string;
  endUserCompanyId?: string;
}

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(ServiceOrder) private orderRepo: Repository<ServiceOrder>,
    @InjectRepository(Robot) private robotRepo: Repository<Robot>,
    @InjectRepository(MaintenanceSchedule) private scheduleRepo: Repository<MaintenanceSchedule>,
  ) {}

  async getServiceSummary(filter: ReportFilter) {
    const where: any = {};
    if (filter.dateFrom && filter.dateTo) {
      where.createdAt = Between(new Date(filter.dateFrom), new Date(filter.dateTo));
    }
    if (filter.clientCompanyId) where.clientCompanyId = filter.clientCompanyId;
    if (filter.endUserCompanyId) where.endUserCompanyId = filter.endUserCompanyId;

    const orders = await this.orderRepo.find({ where });

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalResolutionMs = 0;
    let resolvedCount = 0;

    for (const order of orders) {
      byType[order.serviceType] = (byType[order.serviceType] || 0) + 1;
      byStatus[order.status] = (byStatus[order.status] || 0) + 1;
      if (order.status === ServiceStatus.COMPLETED && order.startedAt && order.completedAt) {
        totalResolutionMs += order.completedAt.getTime() - order.startedAt.getTime();
        resolvedCount++;
      }
    }

    const avgResolutionHours =
      resolvedCount > 0 ? (totalResolutionMs / resolvedCount) / (1000 * 60 * 60) : 0;

    return {
      total: orders.length,
      byType,
      byStatus,
      avgResolutionHours: Math.round(avgResolutionHours * 100) / 100,
      completionRate: orders.length > 0
        ? Math.round(((byStatus[ServiceStatus.COMPLETED] || 0) / orders.length) * 100)
        : 0,
    };
  }

  async getRobotReport(robotId: string) {
    const robot = await this.robotRepo.findOne({
      where: { id: robotId },
      relations: [
        'model', 'model.brand', 'endUserCompany', 'clientCompany', 'country',
        'serviceOrders', 'serviceOrders.assignedTechnician', 'serviceOrders.assignedTechnician.user',
        'maintenanceSchedules', 'maintenanceSchedules.alerts',
      ],
    });

    const orders = robot?.serviceOrders || [];
    const completedOrders = orders.filter((o) => o.status === ServiceStatus.COMPLETED);

    return {
      robot,
      stats: {
        totalServices: orders.length,
        completedServices: completedOrders.length,
        byType: orders.reduce((acc, o) => {
          acc[o.serviceType] = (acc[o.serviceType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }

  async getMaintenanceCompliance(filter: ReportFilter) {
    const schedules = await this.scheduleRepo.find({
      relations: ['robot', 'robot.model', 'robot.clientCompany', 'robot.endUserCompany'],
    });

    const total = schedules.length;
    const overdue = schedules.filter((s) => s.status === MaintenanceScheduleStatus.OVERDUE).length;
    const completed = schedules.filter((s) => s.status === MaintenanceScheduleStatus.COMPLETED).length;
    const upcoming = schedules.filter((s) =>
      [
        MaintenanceScheduleStatus.UPCOMING,
        MaintenanceScheduleStatus.ALERTED_30,
        MaintenanceScheduleStatus.ALERTED_60,
        MaintenanceScheduleStatus.ALERTED_90,
      ].includes(s.status),
    ).length;

    return {
      total,
      overdue,
      completed,
      upcoming,
      complianceRate: total > 0 ? Math.round(((completed + upcoming) / total) * 100) : 100,
    };
  }

  async getDashboardKpis(filter: ReportFilter) {
    const [serviceSummary, maintenanceCompliance] = await Promise.all([
      this.getServiceSummary(filter),
      this.getMaintenanceCompliance(filter),
    ]);

    const activeRobots = await this.robotRepo.count({ where: { status: 'active' as any } });

    return {
      activeRobots,
      serviceSummary,
      maintenanceCompliance,
    };
  }
}
