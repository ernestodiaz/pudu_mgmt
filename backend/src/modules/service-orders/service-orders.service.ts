import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrder } from './entities/service-order.entity';
import { ServiceOrderEvent } from './entities/service-order-event.entity';
import { ChecklistsService } from '../checklists/checklists.service';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ServiceType, ServiceStatus, ServiceMode, ServicePriority,
  NotificationEventType,
} from '../../common/enums';
import { transition, allowedActions } from './state-machine/order-state-machine';
import { User } from '../users/entities/user.entity';

export interface CreateServiceOrderDto {
  serviceType: ServiceType;
  serviceMode?: ServiceMode;
  priority?: ServicePriority;
  robotId?: string;
  endUserCompanyId?: string;
  clientCompanyId?: string;
  scheduledDate?: Date;
  description?: string;
  includesTraining?: boolean;
  metadata?: Record<string, any>;
}

export interface ServiceOrderFilter {
  serviceType?: ServiceType;
  status?: ServiceStatus;
  countryId?: string;
  clientCompanyId?: string;
  endUserCompanyId?: string;
  robotId?: string;
  assignedTechnicianId?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class ServiceOrdersService {
  constructor(
    @InjectRepository(ServiceOrder) private orderRepo: Repository<ServiceOrder>,
    @InjectRepository(ServiceOrderEvent) private eventRepo: Repository<ServiceOrderEvent>,
    private checklistsService: ChecklistsService,
    private maintenanceService: MaintenanceService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(filter: ServiceOrderFilter = {}) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.robot', 'robot')
      .leftJoinAndSelect('robot.model', 'model')
      .leftJoinAndSelect('model.brand', 'brand')
      .leftJoinAndSelect('order.endUserCompany', 'endUser')
      .leftJoinAndSelect('order.clientCompany', 'client')
      .leftJoinAndSelect('order.assignedTechnician', 'tech')
      .leftJoinAndSelect('tech.user', 'techUser')
      .leftJoinAndSelect('order.requestedBy', 'requester')
      .orderBy('order.createdAt', 'DESC');

    if (filter.serviceType) qb.andWhere('order.serviceType = :serviceType', { serviceType: filter.serviceType });
    if (filter.status) qb.andWhere('order.status = :status', { status: filter.status });
    if (filter.clientCompanyId) qb.andWhere('order.clientCompanyId = :clientCompanyId', { clientCompanyId: filter.clientCompanyId });
    if (filter.endUserCompanyId) qb.andWhere('order.endUserCompanyId = :endUserCompanyId', { endUserCompanyId: filter.endUserCompanyId });
    if (filter.robotId) qb.andWhere('order.robotId = :robotId', { robotId: filter.robotId });
    if (filter.assignedTechnicianId) qb.andWhere('order.assignedTechnicianId = :tid', { tid: filter.assignedTechnicianId });
    if (filter.dateFrom) qb.andWhere('order.scheduledDate >= :dateFrom', { dateFrom: filter.dateFrom });
    if (filter.dateTo) qb.andWhere('order.scheduledDate <= :dateTo', { dateTo: filter.dateTo });

    return qb.getMany();
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'robot', 'robot.model', 'robot.model.brand',
        'endUserCompany', 'clientCompany',
        'assignedTechnician', 'assignedTechnician.user',
        'requestedBy',
        'events', 'events.actor',
        'checklistInstances', 'checklistInstances.template',
        'checklistInstances.responses',
      ],
    });
    if (!order) throw new NotFoundException(`Service order ${id} not found`);
    return {
      ...order,
      allowedActions: allowedActions(order.status),
    };
  }

  async create(dto: CreateServiceOrderDto, requestedBy: User) {
    const order = this.orderRepo.create({
      ...dto,
      requestedById: requestedBy.id,
      clientCompanyId: dto.clientCompanyId || requestedBy.clientCompanyId,
      endUserCompanyId: dto.endUserCompanyId || requestedBy.endUserCompanyId,
    });

    const saved = await this.orderRepo.save(order);

    await this.recordEvent(saved.id, requestedBy.id, 'created', null, ServiceStatus.DRAFT, 'Order created');

    await this.notificationsService.dispatch(NotificationEventType.SERVICE_ORDER_CREATED, {
      serviceOrderId: saved.id,
      orderNumber: saved.orderNumber,
      serviceType: saved.serviceType,
    });

    return this.findOne(saved.id);
  }

  async update(id: string, data: Partial<ServiceOrder>, actor: User) {
    const order = await this.findOne(id);
    if ([ServiceStatus.COMPLETED, ServiceStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException('Cannot update a completed or cancelled order');
    }
    await this.orderRepo.update(id, data);
    return this.findOne(id);
  }

  async assign(id: string, technicianId: string, scheduledDate: Date | undefined, actor: User) {
    const order = await this.findOne(id);
    const newStatus = transition(order.status, 'assign');

    await this.orderRepo.update(id, {
      assignedTechnicianId: technicianId,
      scheduledDate,
      status: newStatus,
    });

    await this.recordEvent(id, actor.id, 'assigned', order.status, newStatus,
      `Assigned to technician ${technicianId}`);

    await this.notificationsService.dispatch(NotificationEventType.SERVICE_ORDER_ASSIGNED, {
      serviceOrderId: id,
      technicianId,
    });

    return this.findOne(id);
  }

  async start(id: string, actor: User) {
    const order = await this.findOne(id);
    const newStatus = transition(order.status, 'start');

    await this.orderRepo.update(id, { status: newStatus, startedAt: new Date() });
    await this.recordEvent(id, actor.id, 'started', order.status, newStatus);

    if (order.robotId) {
      await this.checklistsService.createInstancesForOrder(id, order.robotId, order.serviceType);
    }

    await this.notificationsService.dispatch(NotificationEventType.SERVICE_ORDER_STARTED, {
      serviceOrderId: id,
    });

    return this.findOne(id);
  }

  async complete(id: string, resolutionNotes: string, actor: User) {
    const order = await this.findOne(id);
    const newStatus = transition(order.status, 'complete');

    const hasBlockers = await this.checklistsService.hasBlockingItems(id);
    if (hasBlockers) {
      throw new BadRequestException('Cannot complete: checklist has critical unresolved items');
    }

    await this.orderRepo.update(id, {
      status: newStatus,
      completedAt: new Date(),
      resolutionNotes,
    });

    await this.recordEvent(id, actor.id, 'completed', order.status, newStatus, resolutionNotes);

    if (order.serviceType === ServiceType.PREVENTIVE_MAINTENANCE && order.robotId) {
      await this.maintenanceService.recordCompleted(order.robotId, id);
    }

    await this.notificationsService.dispatch(NotificationEventType.SERVICE_ORDER_COMPLETED, {
      serviceOrderId: id,
    });

    return this.findOne(id);
  }

  async cancel(id: string, reason: string, actor: User) {
    const order = await this.findOne(id);
    const newStatus = transition(order.status, 'cancel');

    await this.orderRepo.update(id, { status: newStatus, internalNotes: reason });
    await this.recordEvent(id, actor.id, 'cancelled', order.status, newStatus, reason);

    await this.notificationsService.dispatch(NotificationEventType.SERVICE_ORDER_CANCELLED, {
      serviceOrderId: id,
    });

    return this.findOne(id);
  }

  private async recordEvent(
    orderId: string,
    actorId: string,
    eventType: string,
    oldStatus: ServiceStatus | null,
    newStatus: ServiceStatus,
    notes?: string,
  ) {
    const event = this.eventRepo.create({ orderId, actorId, eventType, oldStatus, newStatus, notes });
    return this.eventRepo.save(event);
  }
}
