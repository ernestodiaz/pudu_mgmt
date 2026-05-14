'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { robotsApi, geographyApi, equipmentApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Search, Plus, Bot, AlertTriangle } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Robot } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  under_maintenance: 'bg-yellow-100 text-yellow-700',
  decommissioned: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  under_maintenance: 'En Mantenimiento',
  decommissioned: 'Dado de baja',
};

export default function RobotsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: robots = [], isLoading } = useQuery<Robot[]>({
    queryKey: ['robots', filters],
    queryFn: () => robotsApi.list(filters) as any,
  });

  const filtered = (robots as Robot[]).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.serialNumber?.toLowerCase().includes(q) ||
      r.model?.name?.toLowerCase().includes(q) ||
      r.endUserCompany?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Header title="Robots" />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por serial, modelo o empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <Link
            href="/dashboard/robots/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Robot
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Robot
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Empresa Usuaria
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    País
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Garantía
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Estado
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((robot) => (
                  <tr key={robot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {robot.model?.brand?.name} {robot.model?.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            S/N: {robot.serialNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{robot.endUserCompany?.name || '-'}</p>
                      <p className="text-xs text-gray-500">{robot.clientCompany?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {robot.country?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {robot.warrantyExpiry ? formatDate(robot.warrantyExpiry) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        STATUS_COLORS[robot.status] || 'bg-gray-100 text-gray-600',
                      )}>
                        {STATUS_LABELS[robot.status] || robot.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/robots/${robot.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No se encontraron robots
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
