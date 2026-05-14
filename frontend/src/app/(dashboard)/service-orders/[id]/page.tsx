'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceOrdersApi, checklistsApi, techniciansApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import {
  ArrowLeft, ClipboardCheck, Clock, User, Bot, CheckCircle2,
  XCircle, AlertTriangle, Play, Check, X,
} from 'lucide-react';
import {
  cn, formatDate, formatDateTime, SERVICE_TYPE_LABELS,
  SERVICE_STATUS_LABELS, STATUS_COLORS,
} from '@/lib/utils';
import Link from 'next/link';

export default function ServiceOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [assigningTech, setAssigningTech] = useState(false);
  const [selectedTech, setSelectedTech] = useState('');
  const [completing, setCompleting] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['service-order', id],
    queryFn: () => serviceOrdersApi.get(id) as any,
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => techniciansApi.list({ available: 'true' }) as any,
  });

  const { data: checklists = [] } = useQuery({
    queryKey: ['checklists', id],
    queryFn: () => checklistsApi.orderChecklists(id) as any,
    enabled: !!(order as any)?.startedAt,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['service-order', id] });
    queryClient.invalidateQueries({ queryKey: ['checklists', id] });
  };

  const assignMutation = useMutation({
    mutationFn: () => serviceOrdersApi.assign(id, { technicianId: selectedTech }) as any,
    onSuccess: () => { invalidate(); setAssigningTech(false); },
  });

  const startMutation = useMutation({
    mutationFn: () => serviceOrdersApi.start(id) as any,
    onSuccess: invalidate,
  });

  const completeMutation = useMutation({
    mutationFn: () => serviceOrdersApi.complete(id, resolutionNotes) as any,
    onSuccess: () => { invalidate(); setCompleting(false); },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => serviceOrdersApi.cancel(id, reason) as any,
    onSuccess: invalidate,
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Detalle OT" />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!order) return null;
  const o = order as any;
  const allowed: string[] = o.allowedActions || [];

  return (
    <div>
      <Header title={`OT: ${o.orderNumber}`} />
      <div className="p-6 space-y-6">
        <Link href="/dashboard/service-orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{o.orderNumber}</h2>
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600',
                )}>
                  {SERVICE_STATUS_LABELS[o.status]}
                </span>
              </div>
              <p className="text-gray-600">{SERVICE_TYPE_LABELS[o.serviceType]}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {allowed.includes('assign') && (
                <button
                  onClick={() => setAssigningTech(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  <User className="w-3.5 h-3.5" />
                  Asignar Técnico
                </button>
              )}
              {allowed.includes('start') && (
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
                >
                  <Play className="w-3.5 h-3.5" />
                  Iniciar
                </button>
              )}
              {allowed.includes('complete') && (
                <button
                  onClick={() => setCompleting(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  <Check className="w-3.5 h-3.5" />
                  Completar
                </button>
              )}
              {allowed.includes('cancel') && (
                <button
                  onClick={() => { if (confirm('¿Cancelar esta orden?')) cancelMutation.mutate('Cancelada por usuario'); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Robot</p>
              <p className="text-sm font-medium">{o.robot?.model?.name || '-'}</p>
              <p className="text-xs text-gray-500 font-mono">{o.robot?.serialNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Empresa Usuaria</p>
              <p className="text-sm font-medium">{o.endUserCompany?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Técnico Asignado</p>
              <p className="text-sm font-medium">{o.assignedTechnician?.user?.fullName || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Programado</p>
              <p className="text-sm font-medium">{o.scheduledDate ? formatDate(o.scheduledDate) : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Creado</p>
              <p className="text-sm">{formatDateTime(o.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Iniciado</p>
              <p className="text-sm">{o.startedAt ? formatDateTime(o.startedAt) : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Completado</p>
              <p className="text-sm">{o.completedAt ? formatDateTime(o.completedAt) : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Modalidad</p>
              <p className="text-sm">{o.serviceMode}</p>
            </div>
          </div>

          {o.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-gray-700">{o.description}</p>
            </div>
          )}
          {o.resolutionNotes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notas de resolución</p>
              <p className="text-sm text-gray-700">{o.resolutionNotes}</p>
            </div>
          )}
        </div>

        {/* Checklists */}
        {(checklists as any[]).length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Checklists</h3>
            {(checklists as any[]).map((instance: any) => (
              <div key={instance.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{instance.template?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{instance.template?.scope?.replace('_', ' ')}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    instance.status === 'completed' ? 'bg-green-100 text-green-700'
                      : instance.status === 'blocked' ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700',
                  )}>
                    {instance.status}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {instance.template?.items?.map((item: any) => {
                    const response = instance.responses?.find((r: any) => r.itemId === item.id);
                    return (
                      <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {response ? (
                            response.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className={cn('w-4 h-4', item.critical ? 'text-red-500' : 'text-orange-400')} />
                            )
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            {item.description}
                            {item.critical && (
                              <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                crítico
                              </span>
                            )}
                          </p>
                          {response?.notes && (
                            <p className="text-xs text-gray-500 mt-0.5">{response.notes}</p>
                          )}
                        </div>
                        {response && (
                          <p className="text-xs text-gray-600 font-medium flex-shrink-0">
                            {response.value}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Línea de tiempo</h3>
          <div className="space-y-4">
            {o.events?.map((event: any, i: number) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                  {i < o.events.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {event.eventType}
                    {event.newStatus && (
                      <span className={cn(
                        'ml-2 text-xs px-2 py-0.5 rounded-full',
                        STATUS_COLORS[event.newStatus] || 'bg-gray-100 text-gray-600',
                      )}>
                        {SERVICE_STATUS_LABELS[event.newStatus]}
                      </span>
                    )}
                  </p>
                  {event.notes && <p className="text-xs text-gray-500 mt-0.5">{event.notes}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDateTime(event.createdAt)}
                    {event.actor && ` • ${event.actor.fullName}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assign Technician Modal */}
        {assigningTech && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="font-semibold text-lg mb-4">Asignar Técnico</h3>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              >
                <option value="">Seleccionar técnico...</option>
                {(technicians as any[]).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.fullName} — {t.country?.name}
                    {!t.isAvailable ? ' (No disponible)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => assignMutation.mutate()}
                  disabled={!selectedTech || assignMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
                >
                  Asignar
                </button>
                <button
                  onClick={() => setAssigningTech(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Modal */}
        {completing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="font-semibold text-lg mb-4">Completar Orden de Servicio</h3>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Notas de resolución (obligatorio)..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 h-28 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => completeMutation.mutate()}
                  disabled={!resolutionNotes.trim() || completeMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setCompleting(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
