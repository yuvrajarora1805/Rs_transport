'use client';

import React from 'react';
import { Truck } from '../../types';
import { TruckSelect } from '../ui/TruckSelect';
import { Trash2, History, Upload, X } from 'lucide-react';

export interface MultiTruckRow {
  id: string;
  truckId: string;
  bales: string;
  driverMobile: string;
  tareWeight?: string;
  grossWeight?: string;
  netWeight?: string;
  slipImage?: string;
}

interface MultiTruckRowCardProps {
  row: MultiTruckRow;
  index: number;
  trucks: Truck[];
  tareHistory: any[];
  canRemove: boolean;
  onChange: (field: keyof MultiTruckRow, value: string) => void;
  onRemove: () => void;
  onImageUpload: (file?: File) => void;
}

export function MultiTruckRowCard({
  row,
  index,
  trucks,
  tareHistory,
  canRemove,
  onChange,
  onRemove,
  onImageUpload,
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

      {/* Tare history & weights */}
      <div className="pt-2 border-t border-slate-200/60">
        {tareHistory.length > 0 && (
          <div className="mb-2 p-2 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex flex-wrap items-center gap-1.5">
            <History size={12} className="text-amber-600 shrink-0" />
            <span className="font-bold text-amber-900 text-[11px]">Previous Tare:</span>
            {tareHistory.map((h, hIdx) => (
              <button
                key={hIdx}
                type="button"
                onClick={() => onChange('tareWeight', Number(h.tare_weight).toFixed(3))}
                className="px-2 py-0.5 bg-white border border-amber-300 rounded text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                title="Click to auto-fill Tare MT"
              >
                {Number(h.tare_weight).toFixed(3)} MT
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Tare / Empty (MT)</label>
            <input
              type="number"
              step="0.001"
              placeholder="e.g. 8.500"
              value={row.tareWeight || ''}
              onChange={(e) => onChange('tareWeight', e.target.value)}
              className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Gross / Loaded (MT)</label>
            <input
              type="number"
              step="0.001"
              placeholder="e.g. 25.400"
              value={row.grossWeight || ''}
              onChange={(e) => onChange('grossWeight', e.target.value)}
              className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Net Weight (MT)</label>
            <input
              type="number"
              step="0.001"
              placeholder="Auto or enter"
              value={row.netWeight || ''}
              onChange={(e) => onChange('netWeight', e.target.value)}
              className="w-full h-10 px-3 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white"
            />
          </div>
        </div>
      </div>

      {/* Slip Image Attachment */}
      <div className="pt-2">
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          Weight Slip / Receipt Photo (For this truck)
        </label>
        {row.slipImage ? (
          <div className="relative inline-block border border-blue-200 rounded-lg p-1.5 bg-white">
            <img src={row.slipImage} alt="Truck Weight Slip" className="h-24 w-auto rounded object-contain" />
            <button
              type="button"
              onClick={() => onChange('slipImage', '')}
              className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg hover:border-blue-400 bg-white cursor-pointer w-fit text-xs text-slate-600">
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
  );
}

