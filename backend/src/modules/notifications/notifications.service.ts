import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import {
  NotificationChannel, NotificationStatus, NotificationEventType, UserRole,
} from '../../common/enums';

export const NOTIFICATION_QUEUE = 'notifications';

const EVENT_RECIPIENTS: Record<
  string,
  { role: UserRole; channels: NotificationChannel[] }[]
> = {
  [NotificationEventType.MAINTENANCE_DUE_90_DAYS]: [
    { role: UserRole.BRAND_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
    { role: UserRole.CLIENT_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
  ],
  [NotificationEventType.MAINTENANCE_DUE_60_DAYS]: [
    { role: UserRole.BRAND_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
    { role: UserRole.CLIENT_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
  ],
  [NotificationEventType.MAINTENANCE_DUE_30_DAYS]: [
    { role: UserRole.BRAND_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
    { role: UserRole.CLIENT_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
    { role: UserRole.END_USER_ADMIN, channels: [NotificationChannel.EMAIL] },
  ],
  [NotificationEventType.MAINTENANCE_OVERDUE]: [
    { role: UserRole.BRAND_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.SMS] },
    { role: UserRole.CLIENT_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
  ],
  [NotificationEventType.SERVICE_ORDER_CREATED]: [
    { role: UserRole.BRAND_ADMIN, channels: [NotificationChannel.IN_APP] },
  ],
  [NotificationEventType.SERVICE_ORDER_ASSIGNED]: [
    { role: UserRole.BRAND_TECHNICIAN, channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL] },
    { role: UserRole.END_USER_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
  ],
  [NotificationEventType.SERVICE_ORDER_STARTED]: [
    { role: UserRole.END_USER_ADMIN, channels: [NotificationChannel.IN_APP] },
  ],
  [NotificationEventType.SERVICE_ORDER_COMPLETED]: [
    { role: UserRole.CLIENT_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
    { role: UserRole.END_USER_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] },
  ],
  [NotificationEventType.CHECKLIST_BLOCKER]: [
    { role: UserRole.BRAND_ADMIN, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.SMS] },
  ],
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectQueue(NOTIFICATION_QUEUE) private notifQueue: Queue,
  ) {}

  async dispatch(eventType: NotificationEventType, context: Record<string, any>) {
    const recipientSpecs = EVENT_RECIPIENTS[eventType];
    if (!recipientSpecs) return;

    for (const spec of recipientSpecs) {
      const users = await this.findRecipientsForEvent(spec.role, context);
      for (const user of users) {
        for (const channel of spec.channels) {
          await this.enqueue(user, channel, eventType, context);
        }
      }
    }
  }

  private async findRecipientsForEvent(role: UserRole, context: Record<string, any>): Promise<User[]> {
    const where: any = { role, isActive: true };
    if (context.clientCompanyId && role !== UserRole.BRAND_ADMIN) {
      where.clientCompanyId = context.clientCompanyId;
    }
    if (context.endUserCompanyId && role === UserRole.END_USER_ADMIN) {
      where.endUserCompanyId = context.endUserCompanyId;
    }
    if (context.technicianUserId && role === UserRole.BRAND_TECHNICIAN) {
      where.id = context.technicianUserId;
    }
    return this.userRepo.find({ where });
  }

  private async enqueue(
    user: User,
    channel: NotificationChannel,
    type: string,
    context: Record<string, any>,
  ) {
    const notif = this.notifRepo.create({
      recipientId: user.id,
      channel,
      type,
      status: NotificationStatus.PENDING,
      referenceId: context.serviceOrderId || context.instanceId,
      referenceType: context.serviceOrderId ? 'service_order' : 'checklist_instance',
    });

    const saved = await this.notifRepo.save(notif);
    await this.notifQueue.add('send', { notificationId: saved.id, context, user: { id: user.id, email: user.email, phone: user.phone, fcmToken: user.fcmToken } }, { attempts: 3, backoff: 5000 });

    return saved;
  }

  async findForUser(userId: string) {
    return this.notifRepo.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    await this.notifRepo.update(
      { id, recipientId: userId },
      { readAt: new Date(), status: NotificationStatus.READ },
    );
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update(
      { recipientId: userId, status: NotificationStatus.SENT },
      { readAt: new Date(), status: NotificationStatus.READ },
    );
  }
}
