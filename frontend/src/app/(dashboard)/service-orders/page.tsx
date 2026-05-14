'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { serviceOrdersApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Search, Plus, Filter } from 'lucide-react';
import { cn, formatDate, SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '@/lib/utils';
import Link from 'next/link';
import type { ServiceOrder } from '@/types';

const SERVICE_TYPES = Object.entries(SERVICE_TYPE_LABELS);
const STATUSES = Object.entries(SERVICE_STATUS_LABELS);

export default function ServiceOrdersPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: orders = [], isLoading } = useQuery<ServiceOrder[]>({
    queryKey: ['service-orders', filters],
    queryFn: () => serviceOrdersApi.list(filters) as any,
  });

  const filtered = (orders as ServiceOrder[]).filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.robot?.serialNumber?.toLowerCase().includes(q) ||
      o.endUserCompany?.name?.toLowerCase().includes(q) ||
      o.assignedTechnician?.user?.fullName?.toLowerCase().includes(q)
    );
  });

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  return (
    <div>
      <Header title="Órdenes de Servicio" />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, robot, empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors',
              showFilters
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400 text-gray-700',
            )}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {Object.keys(filters).length > 0 && (
              <span className="bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
          <Link
            href="/dashboard/service-orders/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva OT
          </Link>
        </div>

        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              onChange={(e) => handleFilter('serviceType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              defaultValue=""
            >
              <option value="">Tipo de servicio</option>
              {SERVICE_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select
              onChange={(e) => handleFilter('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              defaultValue=""
            >
              <option value="">Estado</option>
              {STATUSES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input
              type="date"
              placeholder="Desde"
              onChange={(e) => handleFilter('dateFrom', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            />
            <input
              type="date"
              placeholder="Hasta"
              onChange={(e) => handleFilter('dateTo', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">{filtered.length} órdenes</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Orden
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Robot
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Empresa
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Técnico
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Programado
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Estado
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-mono font-medium text-gray-900">{order.orderNumber}</p>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded font-medium',
                          PRIORITY_COLORS[order.priority] || 'bg-gray-100 text-gray-600',
                        )}>
                          {order.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {SERVICE_TYPE_LABELS[order.serviceType] || order.serviceType}
                    </td>
                    <td className="px-4 py-3">
                      {order.robot ? (
                        <div>
                          <p className="text-sm text-gray-900">{order.robot.model?.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{order.robot.serialNumber}</p>
                        </div>
                      ) : <span className="text-gray-400 text-sm">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.endUserCompany?.name || order.clientCompany?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.assignedTechnician?.user?.fullName || (
                        <span className="text-orange-500 text-xs">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.scheduledDate ? formatDate(order.scheduledDate) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600',
                      )}>
                        {SERVICE_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/service-orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No se encontraron órdenes de servicio
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
