import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistInstance } from './entities/checklist-instance.entity';
import { ChecklistResponse } from './entities/checklist-response.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ServiceType, ChecklistScope, ChecklistInstanceStatus,
  ChecklistInputType, NotificationEventType,
} from '../../common/enums';
import { User } from '../users/entities/user.entity';

export interface ChecklistResponseDto {
  itemId: string;
  value: string;
  notes?: string;
  photoUrls?: string[];
}

@Injectable()
export class ChecklistsService {
  constructor(
    @InjectRepository(ChecklistTemplate) private templateRepo: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistInstance) private instanceRepo: Repository<ChecklistInstance>,
    @InjectRepository(ChecklistResponse) private responseRepo: Repository<ChecklistResponse>,
    @InjectRepository(ChecklistItem) private itemRepo: Repository<ChecklistItem>,
    private notificationsService: NotificationsService,
  ) {}

  findAllTemplates(serviceType?: ServiceType, modelId?: string) {
    const where: any = { isActive: true };
    if (serviceType) where.serviceType = serviceType;
    if (modelId) where.modelId = modelId;
    return this.templateRepo.find({ where, relations: ['model', 'model.brand', 'items'] });
  }

  async findTemplate(id: string) {
    const template = await this.templateRepo.findOne({
      where: { id },
      relations: ['items', 'model'],
    });
    if (!template) throw new NotFoundException(`Checklist template ${id} not found`);
    return template;
  }

  async createTemplate(data: Partial<ChecklistTemplate>) {
    const template = this.templateRepo.create(data);
    return this.templateRepo.save(template);
  }

  async createInstancesForOrder(orderId: string, robotId: string, serviceType: ServiceType) {
    const robot = await this.templateRepo.manager
      .getRepository('robots')
      .findOne({ where: { id: robotId }, relations: ['model'] });

    if (!robot) return [];

    const templates = await this.templateRepo.find({
      where: [
        { serviceType, scope: ChecklistScope.COMMON, isActive: true },
        { serviceType, scope: ChecklistScope.MODEL_SPECIFIC, modelId: robot.modelId, isActive: true },
      ],
      relations: ['items'],
    });

    const instances = [];
    for (const template of templates) {
      const instance = this.instanceRepo.create({
        templateId: template.id,
        serviceOrderId: orderId,
        status: ChecklistInstanceStatus.PENDING,
      });
      instances.push(await this.instanceRepo.save(instance));
    }

    return instances;
  }

  async getInstancesForOrder(orderId: string) {
    return this.instanceRepo.find({
      where: { serviceOrderId: orderId },
      relations: ['template', 'template.items', 'responses', 'completedBy'],
    });
  }

  async submitResponses(instanceId: string, responses: ChecklistResponseDto[], actor: User) {
    const instance = await this.instanceRepo.findOne({
      where: { id: instanceId },
      relations: ['template', 'template.items'],
    });
    if (!instance) throw new NotFoundException(`Checklist instance ${instanceId} not found`);
    if (instance.status === ChecklistInstanceStatus.COMPLETED) {
      throw new BadRequestException('Checklist already completed');
    }

    await this.instanceRepo.update(instanceId, { status: ChecklistInstanceStatus.IN_PROGRESS });

    const savedResponses = [];
    let hasCriticalFailure = false;

    for (const r of responses) {
      const item = instance.template.items.find((i) => i.id === r.itemId);
      if (!item) continue;

      const passed = this.evaluatePassed(item, r.value);
      if (item.critical && !passed) hasCriticalFailure = true;

      const existing = await this.responseRepo.findOne({
        where: { instanceId, itemId: r.itemId },
      });

      if (existing) {
        await this.responseRepo.update(existing.id, { value: r.value, notes: r.notes, photoUrls: r.photoUrls, passed });
        savedResponses.push({ ...existing, value: r.value, passed });
      } else {
        const resp = this.responseRepo.create({
          instanceId,
          itemId: r.itemId,
          value: r.value,
          notes: r.notes,
          photoUrls: r.photoUrls || [],
          passed,
        });
        savedResponses.push(await this.responseRepo.save(resp));
      }
    }

    const allItems = instance.template.items;
    const allResponded = await this.checkAllResponded(instanceId, allItems.length);

    if (allResponded) {
      const newStatus = hasCriticalFailure
        ? ChecklistInstanceStatus.BLOCKED
        : ChecklistInstanceStatus.COMPLETED;

      await this.instanceRepo.update(instanceId, {
        status: newStatus,
        completedAt: new Date(),
        completedById: actor.id,
      });

      if (hasCriticalFailure) {
        await this.notificationsService.dispatch(NotificationEventType.CHECKLIST_BLOCKER, {
          instanceId,
          serviceOrderId: instance.serviceOrderId,
        });
      }
    }

    return { responses: savedResponses, hasCriticalFailure, allResponded };
  }

  async hasBlockingItems(orderId: string): Promise<boolean> {
    const blocked = await this.instanceRepo.count({
      where: { serviceOrderId: orderId, status: ChecklistInstanceStatus.BLOCKED },
    });
    return blocked > 0;
  }

  private evaluatePassed(item: ChecklistItem, value: string): boolean {
    if (item.inputType === ChecklistInputType.BOOLEAN) {
      return value === 'true' || value === '1' || value?.toLowerCase() === 'yes';
    }
    return value !== null && value !== undefined && value !== '';
  }

  private async checkAllResponded(instanceId: string, totalItems: number): Promise<boolean> {
    const count = await this.responseRepo.count({ where: { instanceId } });
    return count >= totalItems;
  }
}
