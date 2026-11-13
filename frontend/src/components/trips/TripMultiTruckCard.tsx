'use client';

import React from 'react';
import { Truck, Transporter } from '../../types';
import { TruckSelect } from '../ui/TruckSelect';
import { Trash2, History, Upload, X, Scale, Building2 } from 'lucide-react';
import { formatCurrency } from '../../lib/api';

export interface TripMultiTruckRow {
  id: string;
  truckId: string;
  transporterId: string;
  tareWeight: string;
  grossWeight: string;
  netWeight: string;
  ratePerUnit: string;
  slipImage?: string;
}

interface TripMultiTruckCardProps {
  row: TripMultiTruckRow;
  index: number;
  trucks: Truck[];
  transporters: Transporter[];
  tareHistory: any[];
  canRemove: boolean;
  defaultRate: string;
  onChange: (field: keyof TripMultiTruckRow, val: string) => void;
  onRemove: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TripMultiTruckCard({
  row,
  index,
  trucks,
  transporters,
  tareHistory,
  canRemove,
  defaultRate,
  onChange,
  onRemove,
  onImageUpload,
}: TripMultiTruckCardProps) {
  const grossFreight = row.netWeight && (row.ratePerUnit || defaultRate)
    ? Number(row.netWeight) * Number(row.ratePerUnit || defaultRate)
    : 0;

  return (
    <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            Truck #{index + 1}
          </span>
          {grossFreight > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Gross: {formatCurrency(grossFreight)}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={!canRemove}
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-30"
        >
          <Trash2 size={14} /> Remove Truck
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Truck *</label>
          <TruckSelect
            trucks={trucks}
            value={row.truckId}
            onChange={(id) => onChange('truckId', id)}
            placeholder="Search truck no..."
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Unloaded on Transporter *
          </label>
          <select
            value={row.transporterId}
            onChange={(e) => onChange('transporterId', e.target.value)}
            className="w-full h-11 px-3 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose Transporter --</option>
            {transporters.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tare History */}
      {tareHistory.length > 0 && (
        <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex flex-wrap items-center gap-2">
          <History size={13} className="text-amber-600 shrink-0" />
          <span className="font-bold text-amber-900 text-[11px]">Recent Tare:</span>
          {tareHistory.map((h, hIdx) => (
            <button
              key={hIdx}
              type="button"
              onClick={() => onChange('tareWeight', Number(h.tare_weight).toFixed(3))}
              className="px-2 py-0.5 bg-white border border-amber-300 rounded text-[11px] font-bold text-amber-800 hover:bg-amber-100"
              title="Click to auto-populate Tare MT"
            >
              {Number(h.tare_weight).toFixed(3)} MT
            </button>
          ))}
        </div>
      )}

      {/* Weights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Empty / Tare (MT)</label>
          <input
            type="number"
            step="0.001"
            placeholder="e.g. 8.560"
            value={row.tareWeight}
            onChange={(e) => onChange('tareWeight', e.target.value)}
            className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Loaded / Gross (MT)</label>
          <input
            type="number"
            step="0.001"
            placeholder="e.g. 25.450"
            value={row.grossWeight}
            onChange={(e) => onChange('grossWeight', e.target.value)}
            className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Billable Net (MT) *</label>
          <input
            type="number"
            step="0.001"
            required
            placeholder="Auto or enter"
            value={row.netWeight}
            onChange={(e) => onChange('netWeight', e.target.value)}
            className="w-full h-10 px-3 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 mb-1">Rate (₹/MT) *</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder={defaultRate || 'e.g. 1600'}
            value={row.ratePerUnit || defaultRate}
            onChange={(e) => onChange('ratePerUnit', e.target.value)}
            className="w-full h-10 px-3 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white"
          />
        </div>
      </div>

      {/* Individual Weighbridge Slip Photo Upload */}
      <div className="pt-2 border-t border-slate-200/60">
        <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Scale size={13} className="text-blue-600" />
          <span>Weighbridge Dharamkanta Slip (Photo for Truck #{index + 1})</span>
        </label>
        {row.slipImage ? (
          <div className="relative inline-block border border-blue-200 rounded-xl p-1.5 bg-white">
            <img src={row.slipImage} alt="Weighbridge Slip" className="h-28 w-auto rounded-lg object-contain" />
            <button
              type="button"
              onClick={() => onChange('slipImage', '')}
              className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xs"
              title="Remove slip photo"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 bg-white cursor-pointer w-fit text-xs font-semibold text-slate-700 transition-colors">
            <Upload size={14} className="text-slate-400" />
            <span>Upload Dharamkanta Slip (For this truck)</span>
            <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}

