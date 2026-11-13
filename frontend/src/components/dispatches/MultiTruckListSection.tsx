'use client';

import React from 'react';
import { Truck } from '../../types';
import { Plus } from 'lucide-react';
import { MultiTruckRowCard, MultiTruckRow } from './MultiTruckRowCard';

interface MultiTruckListSectionProps {
  multiTrucks: MultiTruckRow[];
  trucks: Truck[];
  onOpenAddTruck: () => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onRowChange: (id: string, field: keyof MultiTruckRow, value: string) => void;
  onImageFile: (file?: File, cb?: (img: string) => void) => void;
}

export function MultiTruckListSection({
  multiTrucks,
  trucks,
  onOpenAddTruck,
  onAddRow,
  onRemoveRow,
  onRowChange,
  onImageFile,
}: MultiTruckListSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Trucks in this Dispatch</h4>
          <p className="text-xs text-slate-500">Each truck has its own registration, bales and dispatch slip</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddTruck}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <Plus size={14} /> Quick Add Truck
          </button>
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
          >
            <Plus size={14} /> Add Another Truck
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {multiTrucks.map((row, idx) => (
          <MultiTruckRowCard
            key={row.id}
            row={row}
            index={idx}
            trucks={trucks}
            canRemove={multiTrucks.length > 1}
            onChange={(f, v) => onRowChange(row.id, f, v)}
            onRemove={() => onRemoveRow(row.id)}
            onImageUpload={(file) => onImageFile(file, (img) => onRowChange(row.id, 'slipImage', img))}
          />
        ))}
      </div>
    </div>
  );
}
