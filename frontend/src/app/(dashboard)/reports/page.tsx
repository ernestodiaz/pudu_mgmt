'use client';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { TrendingUp, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn, SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS } from '@/lib/utils';
import type { DashboardKpis } from '@/types';

export default function ReportsPage() {
  const { data: kpis } = useQuery<DashboardKpis>({
    queryKey: ['dashboard-kpis'],
    queryFn: () => reportsApi.dashboard() as any,
  });

  const { data: compliance } = useQuery({
    queryKey: ['maintenance-compliance'],
    queryFn: () => reportsApi.maintenanceCompliance() as any,
  });

  return (
    <div>
      <Header title="Reportes y Análisis" />
      <div className="p-6 space-y-6">

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Robots Activos',
              value: kpis?.activeRobots ?? '-',
              icon: TrendingUp,
              color: 'bg-blue-50 text-blue-600',
            },
            {
              label: 'Órdenes Completadas',
              value: `${kpis?.serviceSummary?.completionRate ?? 0}%`,
              icon: CheckCircle2,
              color: 'bg-green-50 text-green-600',
            },
            {
              label: 'Tiempo Promedio Resolución',
              value: `${kpis?.serviceSummary?.avgResolutionHours ?? 0}h`,
              icon: Clock,
              color: 'bg-yellow-50 text-yellow-600',
            },
            {
              label: 'Cumplimiento Preventivo',
              value: `${(compliance as any)?.complianceRate ?? 0}%`,
              icon: AlertTriangle,
              color: (compliance as any)?.overdue > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{label}</p>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders by Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Órdenes por Tipo de Servicio</h2>
            {kpis?.serviceSummary?.byType && Object.keys(kpis.serviceSummary.byType).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(kpis.serviceSummary.byType)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([type, count]) => {
                    const total = kpis.serviceSummary.total || 1;
                    const pct = Math.round(((count as number) / total) * 100);
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{SERVICE_TYPE_LABELS[type] || type}</span>
                          <span className="font-semibold text-gray-900">{count as number} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Sin datos disponibles</p>
            )}
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Órdenes por Estado</h2>
            {kpis?.serviceSummary?.byStatus && Object.keys(kpis.serviceSummary.byStatus).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(kpis.serviceSummary.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{SERVICE_STATUS_LABELS[status] || status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${Math.round(((count as number) / (kpis.serviceSummary.total || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Sin datos disponibles</p>
            )}
          </div>

          {/* Maintenance Compliance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Estado de Mantenimiento Preventivo</h2>
            {compliance ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Programados', value: (compliance as any).total, color: 'text-gray-900' },
                  { label: 'Próximos', value: (compliance as any).upcoming, color: 'text-green-700' },
                  { label: 'Completados', value: (compliance as any).completed, color: 'text-blue-700' },
                  { label: 'Vencidos', value: (compliance as any).overdue, color: 'text-red-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className={cn('text-4xl font-bold', color)}>{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Cargando...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
