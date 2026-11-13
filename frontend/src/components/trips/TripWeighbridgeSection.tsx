'use client';

import React from 'react';
import { Scale, History, Upload, X } from 'lucide-react';

interface TripWeighbridgeSectionProps {
  grossWeight: string;
  tareWeight: string;
  netWeight: string;
  ratePerUnit: string;
  slipImage: string;
  tareHistory: any[];
  onGrossChange: (val: string) => void;
  onTareChange: (val: string) => void;
  onNetChange: (val: string) => void;
  onRateChange: (val: string) => void;
  onSelectTareHistory: (tare: number) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export function TripWeighbridgeSection({
  grossWeight,
  tareWeight,
  netWeight,
  ratePerUnit,
  slipImage,
  tareHistory,
  onGrossChange,
  onTareChange,
  onNetChange,
  onRateChange,
  onSelectTareHistory,
  onImageUpload,
  onRemoveImage,
}: TripWeighbridgeSectionProps) {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scale size={18} className="text-blue-600" /> Weighbridge Weights (Dharamkanta Slip)
        </h3>
        <span className="text-xs text-slate-500 font-medium">Weights in Metric Tonnes (MT)</span>
      </div>

      {tareHistory.length > 0 && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <History size={14} className="text-amber-600" />
            <span>Previous Tare Weight History for this Truck:</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {tareHistory.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectTareHistory(item.tare_weight)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 hover:border-amber-400 hover:bg-amber-100 rounded-lg text-xs font-bold text-amber-900 shadow-2xs transition-colors"
                title={`Click to auto-populate ${Number(item.tare_weight).toFixed(3)} MT tare`}
              >
                <span>{Number(item.tare_weight).toFixed(3)} MT</span>
                <span className="text-[10px] text-amber-700 font-normal">
                  ({new Date(item.unloading_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Loaded Weight / Gross (MT)</label>
          <input
            type="number"
            step="0.001"
            placeholder="e.g. 25.450 (भरी गाड़ी)"
            value={grossWeight}
            onChange={(e) => onGrossChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Empty Weight / Tare (MT)</label>
          <input
            type="number"
            step="0.001"
            placeholder="e.g. 8.560 (खाली गाड़ी)"
            value={tareWeight}
            onChange={(e) => onTareChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Billable Net Weight (MT) *</label>
          <input
            type="number"
            step="0.001"
            required
            placeholder="e.g. 16.890"
            value={netWeight}
            onChange={(e) => onNetChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Rate per Unit (₹/MT) *</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="e.g. 1600"
            value={ratePerUnit}
            onChange={(e) => onRateChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Attach Dharamkanta Weighbridge Slip (Photo)
          </label>
          {slipImage ? (
            <div className="relative inline-block border border-blue-200 rounded-xl p-1 bg-white">
              <img src={slipImage} alt="Weighbridge Slip" className="h-28 w-auto rounded-lg object-contain" />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xs"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer bg-white transition-colors text-xs font-bold text-slate-700">
              <Upload size={16} className="text-slate-400" />
              <span>Click to upload slip photo (PNG, JPG &lt; 5MB)</span>
              <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

