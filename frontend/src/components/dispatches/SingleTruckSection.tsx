'use client';

import React from 'react';
import { Truck } from '../../types';
import { TruckSelect } from '../ui/TruckSelect';
import { Plus, Upload, X, FileText } from 'lucide-react';

interface SingleTruckState {
  truckId: string;
  bales: string;
  driverMobile: string;
  slipImage?: string;
}

interface SingleTruckSectionProps {
  form: SingleTruckState;
  trucks: Truck[];
  onChange: (field: keyof SingleTruckState, val: string) => void;
  onOpenAddTruck: () => void;
  onImageUpload: (file?: File) => void;
}

export function SingleTruckSection({
  form,
  trucks,
  onChange,
  onOpenAddTruck,
  onImageUpload,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Driver Contact Number (For this trip)</label>
          <input
            type="tel"
            placeholder="e.g. 9829012345 (Driver's mobile)"
            value={form.driverMobile}
            onChange={(e) => onChange('driverMobile', e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Dispatch Slip Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <FileText size={16} className="text-blue-600" /> Dispatch Slip / Bilty Photo
          </label>
          {form.slipImage ? (
            <div className="relative inline-block border border-blue-200 rounded-xl p-1.5 bg-slate-50">
              <img src={form.slipImage} alt="Dispatch Slip" className="h-20 w-auto rounded-lg object-contain" />
              <button
                type="button"
                onClick={() => onChange('slipImage', '')}
                className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xs"
                title="Remove slip"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 bg-white cursor-pointer w-fit text-xs font-semibold text-slate-600 transition-colors">
              <Upload size={15} className="text-slate-400" />
              <span>Attach Dispatch Slip</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageUpload(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
