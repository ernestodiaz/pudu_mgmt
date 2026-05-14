'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { AlertTriangle, CheckCircle2, Calendar, Bell, BellOff } from 'lucide-react';
import { cn, formatDate, daysUntil, MAINTENANCE_STATUS_COLORS } from '@/lib/utils';
import Link from 'next/link';
import type { MaintenanceSchedule } from '@/types';

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'upcoming' | 'overdue' | 'all'>('upcoming');

  const { data: upcoming = [] } = useQuery<MaintenanceSchedule[]>({
    queryKey: ['maintenance-upcoming'],
    queryFn: () => maintenanceApi.upcoming(90) as any,
    enabled: tab === 'upcoming',
  });

  const { data: overdue = [] } = useQuery<MaintenanceSchedule[]>({
    queryKey: ['maintenance-overdue'],
    queryFn: () => maintenanceApi.overdue() as any,
    enabled: tab === 'overdue',
  });

  const { data: all = [] } = useQuery<MaintenanceSchedule[]>({
    queryKey: ['maintenance-all'],
    queryFn: () => maintenanceApi.list() as any,
    enabled: tab === 'all',
  });

  const acknowledgeAlert = useMutation({
    mutationFn: (alertId: string) => maintenanceApi.acknowledgeAlert(alertId) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-all'] });
    },
  });

  const schedules = tab === 'upcoming' ? upcoming : tab === 'overdue' ? overdue : all;

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      MAINTENANCE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-600',
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  );

  return (
    <div>
      <Header title="Mantenimiento Preventivo" />
      <div className="p-6">
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {([
            { key: 'upcoming', label: 'Próximos', count: (upcoming as MaintenanceSchedule[]).length },
            { key: 'overdue', label: 'Vencidos', count: (overdue as MaintenanceSchedule[]).length },
            { key: 'all', label: 'Todos' },
          ] as { key: string; label: string; count?: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                tab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className={cn(
                  'w-5 h-5 rounded-full text-xs flex items-center justify-center',
                  key === 'overdue' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white',
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {(schedules as MaintenanceSchedule[]).map((schedule) => {
            const days = daysUntil(schedule.nextDueDate);
            const unacknowledgedAlerts = schedule.alerts?.filter((a) => !a.acknowledgedAt) || [];

            return (
              <div
                key={schedule.id}
                className={cn(
                  'bg-white rounded-xl border p-5',
                  days < 0 ? 'border-red-200' : days <= 30 ? 'border-orange-200' : 'border-gray-200',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      days < 0 ? 'bg-red-100' : days <= 30 ? 'bg-orange-100' : 'bg-green-100',
                    )}>
                      {days < 0 ? (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      ) : days <= 30 ? (
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      ) : (
                        <Calendar className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/robots/${schedule.robot?.id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {schedule.robot?.model?.brand?.name} {schedule.robot?.model?.name}
                        </Link>
                        <span className="text-gray-400 text-sm font-mono">
                          {schedule.robot?.serialNumber}
                        </span>
                        <StatusBadge status={schedule.status} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {schedule.robot?.endUserCompany?.name} — {schedule.robot?.clientCompany?.name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-500">
                          Último servicio: <strong>{schedule.lastServiceDate ? formatDate(schedule.lastServiceDate) : 'N/A'}</strong>
                        </span>
                        <span className={cn(
                          'font-semibold',
                          days < 0 ? 'text-red-600' : days <= 30 ? 'text-orange-600' : 'text-gray-700',
                        )}>
                          Vence: {formatDate(schedule.nextDueDate)}
                          {' '}({days < 0 ? `${Math.abs(days)} días vencido` : `en ${days} días`})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {days < 0 || days <= 30 ? (
                      <Link
                        href={`/dashboard/service-orders/new?type=preventive_maintenance&robotId=${schedule.robot?.id}`}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Crear OT
                      </Link>
                    ) : null}

                    {unacknowledgedAlerts.map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => acknowledgeAlert.mutate(alert.id)}
                        className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 bg-orange-50 px-2 py-1 rounded-lg"
                      >
                        <BellOff className="w-3 h-3" />
                        Confirmar alerta {alert.alertType}
                      </button>
                    ))}
                    {unacknowledgedAlerts.length === 0 && schedule.alerts?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Bell className="w-3 h-3" />
                        Alertas confirmadas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {(schedules as MaintenanceSchedule[]).length === 0 && (
            <div className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {tab === 'overdue'
                  ? 'No hay mantenimientos vencidos'
                  : 'No hay mantenimientos próximos en los próximos 90 días'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
