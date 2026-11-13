'use client';

import React from 'react';
import { Truck } from '../../types';
import { TruckSelect } from '../ui/TruckSelect';
import { Plus } from 'lucide-react';

interface SingleTruckState {
  truckId: string;
  bales: string;
  driverMobile: string;
}

interface SingleTruckSectionProps {
  form: SingleTruckState;
  trucks: Truck[];
  onChange: (field: keyof SingleTruckState, val: string) => void;
  onOpenAddTruck: () => void;
}

export function SingleTruckSection({
  form,
  trucks,
  onChange,
  onOpenAddTruck,
}: SingleTruckSectionProps) {
  return (
    <div className="space-y-5 pt-2 border-t border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-800">Select Truck *</label>
            <button
              type="button"
              onClick={onOpenAddTruck}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
            >
              <Plus size={14} /> Add New Truck
            </button>
          </div>
          <TruckSelect
            trucks={trucks}
            value={form.truckId}
            onChange={(id) => onChange('truckId', id)}
            required
            placeholder="Search or type truck no (e.g. RJ04...)"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Number of Bales</label>
          <input
            type="number"
            placeholder="e.g. 35"
            value={form.bales}
            onChange={(e) => onChange('bales', e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Driver Contact Number (For this trip)</label>
        <input
          type="tel"
          placeholder="e.g. 9829012345 (Driver's current mobile number)"
          value={form.driverMobile}
          onChange={(e) => onChange('driverMobile', e.target.value)}
          className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>
    </div>
  );
}
