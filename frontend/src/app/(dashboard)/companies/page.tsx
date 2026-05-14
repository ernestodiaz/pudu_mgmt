'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Building2, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import type { ClientCompany, EndUserCompany } from '@/types';

export default function CompaniesPage() {
  const [tab, setTab] = useState<'clients' | 'endusers'>('clients');

  const { data: clients = [] } = useQuery<ClientCompany[]>({
    queryKey: ['client-companies'],
    queryFn: () => companiesApi.clients.list() as any,
    enabled: tab === 'clients',
  });

  const { data: endUsers = [] } = useQuery<EndUserCompany[]>({
    queryKey: ['end-user-companies'],
    queryFn: () => companiesApi.endUsers.list() as any,
    enabled: tab === 'endusers',
  });

  return (
    <div>
      <Header title="Empresas" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setTab('clients')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'clients' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
            >
              Distribuidores / Revendedores
            </button>
            <button
              onClick={() => setTab('endusers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'endusers' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
            >
              Empresas Usuarias
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tab === 'clients' && (clients as ClientCompany[]).map((company) => (
            <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.country?.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{company.contactEmail || '-'}</p>
            </div>
          ))}

          {tab === 'endusers' && (endUsers as EndUserCompany[]).map((company) => (
            <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.country?.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{company.clientCompany?.name}</p>
              <p className="text-sm text-gray-600 mt-1">{company.contactEmail || '-'}</p>
            </div>
          ))}

          {tab === 'clients' && (clients as ClientCompany[]).length === 0 && (
            <p className="col-span-3 text-center text-gray-400 py-12">No hay distribuidores registrados</p>
          )}
          {tab === 'endusers' && (endUsers as EndUserCompany[]).length === 0 && (
            <p className="col-span-3 text-center text-gray-400 py-12">No hay empresas usuarias registradas</p>
          )}
        </div>
      </div>
    </div>
  );
}
