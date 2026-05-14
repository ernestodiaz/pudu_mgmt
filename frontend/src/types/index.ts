export interface Country {
  id: string;
  code: string;
  name: string;
  timezone: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface EquipmentModel {
  id: string;
  name: string;
  slug: string;
  category: string;
  preventiveIntervalDays: number;
  alertDaysBefore: number[];
  brand: Brand;
}

export interface ClientCompany {
  id: string;
  name: string;
  contactEmail: string;
  country: Country;
}

export interface EndUserCompany {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  country: Country;
  clientCompany: ClientCompany;
}

export interface Robot {
  id: string;
  serialNumber: string;
  status: string;
  purchaseDate: string;
  warrantyExpiry: string;
  firmwareVersion: string;
  location: string;
  model: EquipmentModel;
  endUserCompany: EndUserCompany;
  clientCompany: ClientCompany;
  country: Country;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
}

export interface Technician {
  id: string;
  isAvailable: boolean;
  specializations: string[];
  user: User;
  country: Country;
}

export interface ServiceOrderEvent {
  id: string;
  eventType: string;
  oldStatus: string;
  newStatus: string;
  notes: string;
  createdAt: string;
  actor: User;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  serviceType: string;
  serviceMode: string;
  status: string;
  priority: string;
  description: string;
  resolutionNotes: string;
  includesTraining: boolean;
  scheduledDate: string;
  startedAt: string;
  completedAt: string;
  robot: Robot;
  endUserCompany: EndUserCompany;
  clientCompany: ClientCompany;
  assignedTechnician: Technician;
  requestedBy: User;
  events: ServiceOrderEvent[];
  allowedActions: string[];
  createdAt: string;
}

export interface MaintenanceAlert {
  id: string;
  alertType: string;
  daysBefore: number;
  sentAt: string;
  acknowledgedAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  lastServiceDate: string;
  nextDueDate: string;
  status: string;
  robot: Robot;
  alerts: MaintenanceAlert[];
}

export interface Notification {
  id: string;
  channel: string;
  type: string;
  title: string;
  body: string;
  status: string;
  readAt: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  orderIndex: number;
  description: string;
  inputType: string;
  options: string[];
  isRequired: boolean;
  critical: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  serviceType: string;
  scope: string;
  items: ChecklistItem[];
}

export interface ChecklistResponse {
  id: string;
  value: string;
  notes: string;
  photoUrls: string[];
  passed: boolean;
  itemId: string;
}

export interface ChecklistInstance {
  id: string;
  status: string;
  completedAt: string;
  template: ChecklistTemplate;
  responses: ChecklistResponse[];
}

export interface DashboardKpis {
  activeRobots: number;
  serviceSummary: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    avgResolutionHours: number;
    completionRate: number;
  };
  maintenanceCompliance: {
    total: number;
    overdue: number;
    completed: number;
    upcoming: number;
    complianceRate: number;
  };
}
