'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { equipmentApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Package, Plus } from 'lucide-react';
import type { Brand, EquipmentModel } from '@/types';

export default function EquipmentPage() {
  const [selectedBrand, setSelectedBrand] = useState('');

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => equipmentApi.brands() as any,
  });

  const { data: models = [] } = useQuery<EquipmentModel[]>({
    queryKey: ['models', selectedBrand],
    queryFn: () => equipmentApi.models(selectedBrand || undefined) as any,
  });

  return (
    <div>
      <Header title="Catálogo de Equipos" />
      <div className="p-6 space-y-6">

        {/* Brands */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Marcas</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedBrand('')}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                !selectedBrand ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Todas
            </button>
            {(brands as Brand[]).map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedBrand === brand.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Models */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">
            Modelos {selectedBrand ? `— ${(brands as Brand[]).find((b) => b.id === selectedBrand)?.name}` : ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(models as EquipmentModel[]).map((model) => (
              <div key={model.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{model.name}</p>
                    <p className="text-xs text-gray-500">{model.brand?.name}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Categoría: <span className="text-gray-900">{model.category || '-'}</span></p>
                  <p>Mantenimiento cada: <span className="text-gray-900">{model.preventiveIntervalDays} días</span></p>
                  <p>Alertas: <span className="text-gray-900">{model.alertDaysBefore?.join(', ')} días antes</span></p>
                </div>
              </div>
            ))}
            {(models as EquipmentModel[]).length === 0 && (
              <p className="col-span-3 text-center text-gray-400 py-12">No hay modelos registrados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
