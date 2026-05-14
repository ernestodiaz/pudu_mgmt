'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { robotsApi, reportsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Bot, Calendar, Wrench, ClipboardList, ArrowLeft } from 'lucide-react';
import { cn, formatDate, SERVICE_TYPE_LABELS, STATUS_COLORS, SERVICE_STATUS_LABELS } from '@/lib/utils';
import Link from 'next/link';
import type { ServiceOrder } from '@/types';

export default function RobotDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: robot, isLoading } = useQuery({
    queryKey: ['robot', id],
    queryFn: () => robotsApi.get(id) as any,
  });

  const { data: report } = useQuery({
    queryKey: ['robot-report', id],
    queryFn: () => reportsApi.robot(id) as any,
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Detalle Robot" />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!robot) return null;

  return (
    <div>
      <Header title={`Robot: ${(robot as any).serialNumber}`} />
      <div className="p-6 space-y-6">

        <Link
          href="/dashboard/robots"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Robots
        </Link>

        {/* Robot Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Marca / Modelo</p>
                <p className="font-semibold text-gray-900">
                  {(robot as any).model?.brand?.name} {(robot as any).model?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Número de Serie</p>
                <p className="font-mono font-semibold text-gray-900">{(robot as any).serialNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Estado</p>
                <span className={cn(
                  'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                  (robot as any).status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                )}>
                  {(robot as any).status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Empresa Usuaria</p>
                <p className="text-gray-900">{(robot as any).endUserCompany?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Distribuidor</p>
                <p className="text-gray-900">{(robot as any).clientCompany?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">País</p>
                <p className="text-gray-900">{(robot as any).country?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Compra</p>
                <p className="text-gray-900">
                  {(robot as any).purchaseDate ? formatDate((robot as any).purchaseDate) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Garantía hasta</p>
                <p className="text-gray-900">
                  {(robot as any).warrantyExpiry ? formatDate((robot as any).warrantyExpiry) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Firmware</p>
                <p className="text-gray-900 font-mono">{(robot as any).firmwareVersion || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {report && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Servicios', value: (report as any).stats?.totalServices ?? 0, icon: ClipboardList },
              { label: 'Servicios Completados', value: (report as any).stats?.completedServices ?? 0, icon: Wrench },
              { label: 'Mantenimientos Preventivos', value: (report as any).stats?.byType?.preventive_maintenance ?? 0, icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Orders */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Historial de Servicios</h2>
            <Link
              href={`/dashboard/service-orders?robotId=${id}`}
              className="text-blue-600 text-sm hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {((report as any)?.robot?.serviceOrders || []).slice(0, 10).map((order: ServiceOrder) => (
              <Link
                key={order.id}
                href={`/dashboard/service-orders/${order.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {SERVICE_TYPE_LABELS[order.serviceType]} • {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full flex-shrink-0',
                  STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600',
                )}>
                  {SERVICE_STATUS_LABELS[order.status] || order.status}
                </span>
              </Link>
            ))}
            {((report as any)?.robot?.serviceOrders?.length ?? 0) === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">Sin historial de servicios</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
