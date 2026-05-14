import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { addDays, differenceInDays, parseISO } from 'date-fns';
import { MaintenanceSchedule } from './entities/maintenance-schedule.entity';
import { MaintenanceAlert } from './entities/maintenance-alert.entity';
import { Robot } from '../robots/entities/robot.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { MaintenanceScheduleStatus, NotificationEventType } from '../../common/enums';

export const MAINTENANCE_QUEUE = 'maintenance';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceSchedule) private scheduleRepo: Repository<MaintenanceSchedule>,
    @InjectRepository(MaintenanceAlert) private alertRepo: Repository<MaintenanceAlert>,
    @InjectRepository(Robot) private robotRepo: Repository<Robot>,
    private notificationsService: NotificationsService,
    @InjectQueue(MAINTENANCE_QUEUE) private maintenanceQueue: Queue,
  ) {}

  findAll(filter: { status?: MaintenanceScheduleStatus; countryId?: string; clientCompanyId?: string } = {}) {
    const qb = this.scheduleRepo
      .createQueryBuilder('ms')
      .leftJoinAndSelect('ms.robot', 'robot')
      .leftJoinAndSelect('robot.model', 'model')
      .leftJoinAndSelect('model.brand', 'brand')
      .leftJoinAndSelect('robot.endUserCompany', 'endUser')
      .leftJoinAndSelect('robot.clientCompany', 'client')
      .leftJoinAndSelect('ms.alerts', 'alerts')
      .orderBy('ms.nextDueDate', 'ASC');

    if (filter.status) qb.andWhere('ms.status = :status', { status: filter.status });

    return qb.getMany();
  }

  async getUpcoming(daysAhead = 90) {
    const cutoff = addDays(new Date(), daysAhead);
    return this.scheduleRepo.find({
      where: { nextDueDate: LessThanOrEqual(cutoff), status: MaintenanceScheduleStatus.UPCOMING },
      relations: ['robot', 'robot.model', 'robot.endUserCompany', 'robot.clientCompany'],
      order: { nextDueDate: 'ASC' },
    });
  }

  async getOverdue() {
    return this.scheduleRepo.find({
      where: { status: MaintenanceScheduleStatus.OVERDUE },
      relations: ['robot', 'robot.model', 'robot.endUserCompany', 'robot.clientCompany'],
      order: { nextDueDate: 'ASC' },
    });
  }

  async createForRobot(robotId: string, firstServiceDate?: Date): Promise<MaintenanceSchedule> {
    const robot = await this.robotRepo.findOne({
      where: { id: robotId },
      relations: ['model'],
    });
    if (!robot) throw new NotFoundException(`Robot ${robotId} not found`);

    const baseDate = firstServiceDate || robot.purchaseDate || new Date();
    const nextDueDate = addDays(baseDate, robot.model.preventiveIntervalDays);

    const schedule = this.scheduleRepo.create({
      robotId,
      lastServiceDate: firstServiceDate || null,
      nextDueDate,
      status: MaintenanceScheduleStatus.UPCOMING,
    });

    return this.scheduleRepo.save(schedule);
  }

  async recordCompleted(robotId: string, serviceOrderId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { robotId },
      relations: ['robot', 'robot.model'],
      order: { nextDueDate: 'DESC' },
    });
    if (!schedule) return;

    const today = new Date();
    const nextDue = addDays(today, schedule.robot.model.preventiveIntervalDays);

    await this.scheduleRepo.update(schedule.id, {
      lastServiceDate: today,
      nextDueDate: nextDue,
      status: MaintenanceScheduleStatus.COMPLETED,
      lastServiceOrderId: serviceOrderId,
    });

    const newSchedule = this.scheduleRepo.create({
      robotId,
      lastServiceDate: today,
      nextDueDate: nextDue,
      status: MaintenanceScheduleStatus.UPCOMING,
      lastServiceOrderId: serviceOrderId,
    });

    return this.scheduleRepo.save(newSchedule);
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });
    if (!alert) throw new NotFoundException(`Alert ${alertId} not found`);
    await this.alertRepo.update(alertId, { acknowledgedAt: new Date(), acknowledgedById: userId });
    return this.alertRepo.findOne({ where: { id: alertId } });
  }

  async runDailyCheck() {
    const today = new Date();
    const schedules = await this.scheduleRepo.find({
      where: { status: MaintenanceScheduleStatus.UPCOMING },
      relations: ['robot', 'robot.model', 'robot.endUserCompany', 'robot.clientCompany', 'alerts'],
    });

    for (const schedule of schedules) {
      const daysUntilDue = differenceInDays(schedule.nextDueDate, today);

      if (daysUntilDue < 0) {
        await this.scheduleRepo.update(schedule.id, { status: MaintenanceScheduleStatus.OVERDUE });
        await this.notificationsService.dispatch(NotificationEventType.MAINTENANCE_OVERDUE, {
          scheduleId: schedule.id,
          robotId: schedule.robotId,
          clientCompanyId: schedule.robot?.clientCompanyId,
          endUserCompanyId: schedule.robot?.endUserCompanyId,
        });
        continue;
      }

      const alertDays = schedule.robot?.model?.alertDaysBefore || [30, 60, 90];

      for (const days of alertDays) {
        if (daysUntilDue <= days) {
          const alertType = `${days}_days`;
          const alreadySent = schedule.alerts?.some((a) => a.alertType === alertType && a.sentAt);
          if (!alreadySent) {
            await this.sendAlert(schedule, days, alertType);
          }
        }
      }
    }
  }

  private async sendAlert(schedule: MaintenanceSchedule, daysBefore: number, alertType: string) {
    const alert = this.alertRepo.create({
      scheduleId: schedule.id,
      daysBefore,
      alertType,
      sentAt: new Date(),
    });
    await this.alertRepo.save(alert);

    const eventType =
      daysBefore >= 90
        ? NotificationEventType.MAINTENANCE_DUE_90_DAYS
        : daysBefore >= 60
        ? NotificationEventType.MAINTENANCE_DUE_60_DAYS
        : NotificationEventType.MAINTENANCE_DUE_30_DAYS;

    await this.notificationsService.dispatch(eventType, {
      scheduleId: schedule.id,
      robotId: schedule.robotId,
      clientCompanyId: schedule.robot?.clientCompanyId,
      endUserCompanyId: schedule.robot?.endUserCompanyId,
    });

    const statusMap: Record<number, MaintenanceScheduleStatus> = {
      90: MaintenanceScheduleStatus.ALERTED_90,
      60: MaintenanceScheduleStatus.ALERTED_60,
      30: MaintenanceScheduleStatus.ALERTED_30,
    };
    if (statusMap[daysBefore]) {
      await this.scheduleRepo.update(schedule.id, { status: statusMap[daysBefore] });
    }
  }
}
