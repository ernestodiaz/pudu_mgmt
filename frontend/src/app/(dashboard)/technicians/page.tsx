'use client';
import { useQuery } from '@tanstack/react-query';
import { techniciansApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { User, MapPin, CheckCircle2, XCircle, Plus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Technician } from '@/types';

export default function TechniciansPage() {
  const { data: technicians = [], isLoading } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: () => techniciansApi.list() as any,
  });

  return (
    <div>
      <Header title="Técnicos" />
      <div className="p-6">
        <div className="flex justify-end mb-6">
          <Link
            href="/dashboard/technicians/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo Técnico
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(technicians as Technician[]).map((tech) => (
              <div key={tech.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-bold text-lg">
                      {tech.user?.fullName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{tech.user?.fullName}</p>
                    <p className="text-sm text-gray-500 truncate">{tech.user?.email}</p>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium',
                    tech.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                  )}>
                    {tech.isAvailable ? (
                      <><CheckCircle2 className="w-3 h-3" /> Disponible</>
                    ) : (
                      <><XCircle className="w-3 h-3" /> Ocupado</>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {tech.country?.name || '-'}
                  </div>
                  {tech.specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tech.specializations.map((s) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <Link
                    href={`/dashboard/technicians/${tech.id}/schedule`}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Ver Agenda
                  </Link>
                </div>
              </div>
            ))}

            {(technicians as Technician[]).length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-400">
                No hay técnicos registrados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
