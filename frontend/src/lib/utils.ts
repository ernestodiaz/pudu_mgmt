import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy') {
  if (!date) return '-';
  return format(new Date(date), fmt, { locale: es });
}

export function formatDateTime(date: string | Date) {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function daysUntil(date: string | Date): number {
  return differenceInDays(new Date(date), new Date());
}

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  preventive_maintenance: 'Mantenimiento Preventivo',
  corrective_maintenance: 'Servicio Correctivo',
  installation: 'Instalación',
  operator_training: 'Entrenamiento de Operadores',
  mapping: 'Mapeado',
  remote_inspection: 'Inspección Remota',
  map_modification: 'Modificación de Mapa',
  remote_technical_assistance: 'Asistencia Técnica Remota',
};

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  scheduled: 'Programado',
  assigned: 'Asignado',
  in_progress: 'En Progreso',
  pending_approval: 'Pendiente Aprobación',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  pending_approval: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-green-100 text-green-700',
  alerted_90: 'bg-blue-100 text-blue-700',
  alerted_60: 'bg-yellow-100 text-yellow-700',
  alerted_30: 'bg-orange-100 text-orange-700',
  overdue: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
};
