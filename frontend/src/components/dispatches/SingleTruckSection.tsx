'use client';

import React from 'react';
import { Truck } from '../../types';
import { TruckSelect } from '../ui/TruckSelect';
import { Plus, History, Upload, X } from 'lucide-react';

interface SingleTruckState {
  truckId: string;
  bales: string;
  driverMobile: string;
  tareWeight: string;
  grossWeight: string;
  netWeight: string;
  slipImage: string;
}

interface SingleTruckSectionProps {
  form: SingleTruckState;
  trucks: Truck[];
  tareHistory: any[];
  onChange: (field: keyof SingleTruckState, val: string) => void;
  onOpenAddTruck: () => void;
  onImageUpload: (file?: File) => void;
}

export function SingleTruckSection({
  form,
  trucks,
  tareHistory,
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

      {/* Single Truck Weights & Tare History */}
      <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-700">Trip Weighing (Optional at Dispatch)</h4>

        {tareHistory.length > 0 && (
          <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex flex-wrap items-center gap-2">
            <History size={14} className="text-amber-600 shrink-0" />
            <span className="font-bold text-amber-900">Recent Tare:</span>
            {tareHistory.map((h, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange('tareWeight', Number(h.tare_weight).toFixed(3))}
                className="px-2 py-0.5 bg-white border border-amber-300 rounded text-xs font-bold text-amber-800 hover:bg-amber-100"
              >
                {Number(h.tare_weight).toFixed(3)} MT
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tare / Empty (MT)</label>
            <input
              type="number"
              step="0.001"
              placeholder="e.g. 8.500"
              value={form.tareWeight}
              onChange={(e) => onChange('tareWeight', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-xl bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Gross / Loaded (MT)</label>
            <input
              type="number"
              step="0.001"
              placeholder="e.g. 25.400"
              value={form.grossWeight}
              onChange={(e) => onChange('grossWeight', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-xl bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Net Weight (MT)</label>
            <input
              type="number"
              step="0.001"
              placeholder="Auto or enter"
              value={form.netWeight}
              onChange={(e) => onChange('netWeight', e.target.value)}
              className="w-full h-10 px-3 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Weight Slip / Receipt Photo</label>
          {form.slipImage ? (
            <div className="relative inline-block border border-blue-200 rounded-lg p-1.5 bg-white">
              <img src={form.slipImage} alt="Weight Slip" className="h-24 w-auto rounded object-contain" />
              <button
                type="button"
                onClick={() => onChange('slipImage', '')}
                className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-xl hover:border-blue-400 bg-white cursor-pointer w-fit text-xs text-slate-600">
              <Upload size={14} className="text-slate-400" />
              <span>Upload Weight Slip</span>
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

