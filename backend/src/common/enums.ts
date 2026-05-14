export enum UserRole {
  BRAND_ADMIN = 'brand_admin',
  BRAND_TECHNICIAN = 'brand_technician',
  CLIENT_ADMIN = 'client_admin',
  END_USER_ADMIN = 'end_user_admin',
  END_USER_OPERATOR = 'end_user_operator',
}

export enum ServiceType {
  PREVENTIVE_MAINTENANCE = 'preventive_maintenance',
  CORRECTIVE_MAINTENANCE = 'corrective_maintenance',
  INSTALLATION = 'installation',
  OPERATOR_TRAINING = 'operator_training',
  MAPPING = 'mapping',
  REMOTE_INSPECTION = 'remote_inspection',
  MAP_MODIFICATION = 'map_modification',
  REMOTE_TECHNICAL_ASSISTANCE = 'remote_technical_assistance',
}

export enum ServiceStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  PENDING_APPROVAL = 'pending_approval',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ServiceMode {
  ON_SITE = 'on_site',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
}

export enum RobotStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_MAINTENANCE = 'under_maintenance',
  DECOMMISSIONED = 'decommissioned',
}

export enum ChecklistScope {
  COMMON = 'common',
  MODEL_SPECIFIC = 'model_specific',
}

export enum ChecklistInputType {
  BOOLEAN = 'boolean',
  TEXT = 'text',
  NUMBER = 'number',
  PHOTO = 'photo',
  SELECT = 'select',
}

export enum ChecklistInstanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum MaintenanceScheduleStatus {
  UPCOMING = 'upcoming',
  ALERTED_90 = 'alerted_90',
  ALERTED_60 = 'alerted_60',
  ALERTED_30 = 'alerted_30',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationEventType {
  MAINTENANCE_DUE_90_DAYS = 'maintenance.due.90d',
  MAINTENANCE_DUE_60_DAYS = 'maintenance.due.60d',
  MAINTENANCE_DUE_30_DAYS = 'maintenance.due.30d',
  MAINTENANCE_OVERDUE = 'maintenance.overdue',
  SERVICE_ORDER_CREATED = 'service_order.created',
  SERVICE_ORDER_ASSIGNED = 'service_order.assigned',
  SERVICE_ORDER_STARTED = 'service_order.started',
  SERVICE_ORDER_COMPLETED = 'service_order.completed',
  SERVICE_ORDER_CANCELLED = 'service_order.cancelled',
  SERVICE_ORDER_CRITICAL = 'service_order.critical_alert',
  CHECKLIST_BLOCKER = 'checklist.critical_item_failed',
}

export enum ServicePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}
