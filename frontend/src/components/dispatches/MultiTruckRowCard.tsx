'use client';

import React from 'react';
import { Truck } from '../../types';
import { TruckSelect } from '../ui/TruckSelect';
import { Trash2 } from 'lucide-react';

export interface MultiTruckRow {
  id: string;
  truckId: string;
  bales: string;
  driverMobile: string;
}

interface MultiTruckRowCardProps {
  row: MultiTruckRow;
  index: number;
  trucks: Truck[];
  canRemove: boolean;
  onChange: (field: keyof MultiTruckRow, value: string) => void;
  onRemove: () => void;
}

export function MultiTruckRowCard({
  row,
  index,
  trucks,
  canRemove,
  onChange,
  onRemove,
}: MultiTruckRowCardProps) {
  return (
    <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
          Truck #{index + 1}
        </span>
        <button
          type="button"
          disabled={!canRemove}
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-30"
        >
          <Trash2 size={14} /> Remove Truck
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        <div className="md:col-span-5">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Truck *</label>
          <TruckSelect
            trucks={trucks}
            value={row.truckId}
            onChange={(id) => onChange('truckId', id)}
            placeholder="Type truck no..."
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Bales</label>
          <input
            type="number"
            placeholder="e.g. 35"
            value={row.bales}
            onChange={(e) => onChange('bales', e.target.value)}
            className="w-full h-11 px-3 text-sm border border-slate-300 rounded-xl bg-white"
          />
        </div>
        <div className="md:col-span-4">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Driver Mobile</label>
          <input
            type="tel"
            placeholder="Driver Phone"
            value={row.driverMobile}
            onChange={(e) => onChange('driverMobile', e.target.value)}
            className="w-full h-11 px-3 text-sm border border-slate-300 rounded-xl bg-white"
          />
        </div>
      </div>
    </div>
  );
}
