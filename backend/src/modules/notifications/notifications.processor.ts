import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Notification } from './entities/notification.entity';
import { NotificationChannel, NotificationStatus } from '../../common/enums';
import { NOTIFICATION_QUEUE } from './notifications.service';

@Processor(NOTIFICATION_QUEUE)
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: this.configService.get<string>('sendgrid.apiKey'),
      },
    });
  }

  @Process('send')
  async handleSend(job: Job<{ notificationId: string; context: Record<string, any>; user: any }>) {
    const { notificationId, context, user } = job.data;

    const notification = await this.notifRepo.findOne({ where: { id: notificationId } });
    if (!notification) return;

    try {
      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmail(notification, user, context);
          break;
        case NotificationChannel.SMS:
          await this.sendSms(notification, user, context);
          break;
        case NotificationChannel.PUSH:
          await this.sendPush(notification, user, context);
          break;
        case NotificationChannel.IN_APP:
          break;
      }

      await this.notifRepo.update(notificationId, {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });
    } catch (err) {
      this.logger.error(`Failed to send notification ${notificationId}:`, err);
      await this.notifRepo.update(notificationId, {
        status: NotificationStatus.FAILED,
        errorMessage: err.message,
      });
      throw err;
    }
  }

  private async sendEmail(notification: Notification, user: any, context: Record<string, any>) {
    if (!user.email) return;

    const fromName = this.configService.get<string>('sendgrid.fromName');
    const fromEmail = this.configService.get<string>('sendgrid.fromEmail');

    const { title, body } = this.buildContent(notification.type, context);

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: user.email,
      subject: title,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">${title}</h2>
        <p>${body}</p>
        <hr/>
        <p style="color: #6b7280; font-size: 12px;">PUDU Robotics Service Management System</p>
      </div>`,
    });
  }

  private async sendSms(_notification: Notification, user: any, context: Record<string, any>) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    if (!accountSid || !user.phone) return;

    const twilio = require('twilio')(accountSid, authToken);
    const { body } = this.buildContent(_notification.type, context);
    await twilio.messages.create({
      body: `PUDU Service: ${body}`,
      from: this.configService.get<string>('twilio.fromNumber'),
      to: user.phone,
    });
  }

  private async sendPush(_notification: Notification, user: any, context: Record<string, any>) {
    if (!user.fcmToken) return;

    const projectId = this.configService.get<string>('firebase.projectId');
    if (!projectId) return;

    const { title, body } = this.buildContent(_notification.type, context);

    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail: this.configService.get<string>('firebase.clientEmail'),
          privateKey: this.configService.get<string>('firebase.privateKey'),
        }),
      });
    }

    await admin.messaging().send({
      token: user.fcmToken,
      notification: { title, body },
      data: { referenceId: _notification.referenceId || '', type: _notification.type },
    });
  }

  private buildContent(type: string, context: Record<string, any>): { title: string; body: string } {
    const templates: Record<string, { title: string; body: string }> = {
      'maintenance.due.90d': {
        title: 'Preventive Maintenance Due in 90 Days',
        body: `Robot maintenance is due in 90 days. Please schedule a service order.`,
      },
      'maintenance.due.60d': {
        title: 'Preventive Maintenance Due in 60 Days',
        body: `Robot maintenance is due in 60 days. Please schedule a service order soon.`,
      },
      'maintenance.due.30d': {
        title: '⚠️ Preventive Maintenance Due in 30 Days',
        body: `Urgent: Robot maintenance is due in 30 days. Create a service order immediately.`,
      },
      'maintenance.overdue': {
        title: '🚨 Preventive Maintenance OVERDUE',
        body: `A robot's preventive maintenance is overdue. Immediate attention required.`,
      },
      'service_order.created': {
        title: 'New Service Order Created',
        body: `Service order ${context.orderNumber || ''} (${context.serviceType || ''}) has been created.`,
      },
      'service_order.assigned': {
        title: 'Service Order Assigned to You',
        body: `A service order has been assigned to you. Check your schedule.`,
      },
      'service_order.started': {
        title: 'Service Order Started',
        body: `A technician has started work on your service order.`,
      },
      'service_order.completed': {
        title: '✅ Service Order Completed',
        body: `Your service order has been completed successfully.`,
      },
      'service_order.cancelled': {
        title: 'Service Order Cancelled',
        body: `A service order has been cancelled.`,
      },
      'checklist.critical_item_failed': {
        title: '🚨 Critical Checklist Item Failed',
        body: `A critical checklist item has failed during service. Immediate review required.`,
      },
    };

    return templates[type] || { title: 'PUDU Service Notification', body: 'You have a new notification.' };
  }
}
