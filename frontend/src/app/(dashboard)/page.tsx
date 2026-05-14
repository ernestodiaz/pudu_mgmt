'use client';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, maintenanceApi, serviceOrdersApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Bot, ClipboardList, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { cn, SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS, formatDate, daysUntil } from '@/lib/utils';
import type { DashboardKpis, MaintenanceSchedule, ServiceOrder } from '@/types';
import Link from 'next/link';

function KpiCard({
  title, value, subtitle, icon: Icon, color,
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: kpis } = useQuery<DashboardKpis>({
    queryKey: ['dashboard-kpis'],
    queryFn: () => reportsApi.dashboard() as any,
  });

  const { data: overdue = [] } = useQuery<MaintenanceSchedule[]>({
    queryKey: ['maintenance-overdue'],
    queryFn: () => maintenanceApi.overdue() as any,
  });

  const { data: recentOrders = [] } = useQuery<ServiceOrder[]>({
    queryKey: ['recent-orders'],
    queryFn: () => serviceOrdersApi.list({ status: 'in_progress' }) as any,
  });

  const { data: upcoming = [] } = useQuery<MaintenanceSchedule[]>({
    queryKey: ['maintenance-upcoming-30'],
    queryFn: () => maintenanceApi.upcoming(30) as any,
  });

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Robots Activos"
            value={kpis?.activeRobots ?? '-'}
            icon={Bot}
            color="bg-blue-50 text-blue-600"
          />
          <KpiCard
            title="Órdenes Este Mes"
            value={kpis?.serviceSummary?.total ?? '-'}
            subtitle={`${kpis?.serviceSummary?.completionRate ?? 0}% completadas`}
            icon={ClipboardList}
            color="bg-indigo-50 text-indigo-600"
          />
          <KpiCard
            title="Mantenimientos Vencidos"
            value={kpis?.maintenanceCompliance?.overdue ?? '-'}
            icon={AlertTriangle}
            color={kpis?.maintenanceCompliance?.overdue ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
          />
          <KpiCard
            title="Cumplimiento Preventivo"
            value={`${kpis?.maintenanceCompliance?.complianceRate ?? 0}%`}
            icon={CheckCircle2}
            color="bg-green-50 text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Órdenes en progreso */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Órdenes en Progreso</h2>
              <Link href="/dashboard/service-orders?status=in_progress" className="text-blue-600 text-sm hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(recentOrders as ServiceOrder[]).slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/service-orders/${order.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {SERVICE_TYPE_LABELS[order.serviceType]} • {order.robot?.model?.name}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {order.assignedTechnician?.user?.fullName || 'Sin asignar'}
                  </span>
                </Link>
              ))}
              {(recentOrders as ServiceOrder[]).length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">Sin órdenes en progreso</p>
              )}
            </div>
          </div>

          {/* Mantenimientos próximos */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Mantenimientos Próximos (30 días)</h2>
              <Link href="/dashboard/maintenance" className="text-blue-600 text-sm hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(upcoming as MaintenanceSchedule[]).slice(0, 5).map((schedule) => {
                const days = daysUntil(schedule.nextDueDate);
                return (
                  <Link
                    key={schedule.id}
                    href={`/dashboard/robots/${schedule.robot?.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      days <= 7 ? 'bg-red-100' : days <= 14 ? 'bg-orange-100' : 'bg-yellow-100',
                    )}>
                      <AlertTriangle className={cn(
                        'w-4 h-4',
                        days <= 7 ? 'text-red-600' : days <= 14 ? 'text-orange-600' : 'text-yellow-600',
                      )} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {schedule.robot?.model?.name} — {schedule.robot?.serialNumber}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {schedule.robot?.endUserCompany?.name}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0',
                      days <= 0 ? 'bg-red-100 text-red-700'
                        : days <= 7 ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700',
                    )}>
                      {days <= 0 ? 'VENCIDO' : `${days}d`}
                    </span>
                  </Link>
                );
              })}
              {(upcoming as MaintenanceSchedule[]).length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">Sin mantenimientos próximos</p>
              )}
            </div>
          </div>
        </div>

        {/* Órdenes vencidas */}
        {(overdue as MaintenanceSchedule[]).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold text-red-800">
                {(overdue as MaintenanceSchedule[]).length} robot(s) con mantenimiento VENCIDO
              </h2>
            </div>
            <div className="space-y-2">
              {(overdue as MaintenanceSchedule[]).slice(0, 3).map((schedule) => (
                <div key={schedule.id} className="bg-white rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {schedule.robot?.model?.name} — S/N {schedule.robot?.serialNumber}
                    </p>
                    <p className="text-xs text-gray-500">{schedule.robot?.endUserCompany?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-700">
                      Venció: {formatDate(schedule.nextDueDate)}
                    </p>
                    <Link
                      href="/dashboard/service-orders?type=create"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Crear OT
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Type chart (simple bars) */}
        {kpis?.serviceSummary?.byType && Object.keys(kpis.serviceSummary.byType).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Órdenes por Tipo</h2>
            <div className="space-y-3">
              {Object.entries(kpis.serviceSummary.byType).map(([type, count]) => {
                const total = kpis.serviceSummary.total;
                const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{SERVICE_TYPE_LABELS[type] || type}</span>
                      <span className="font-medium">{count as number} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
