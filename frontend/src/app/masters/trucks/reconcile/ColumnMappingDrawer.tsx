'use client';

import React from 'react';
import { X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  truckCol: number;
  setTruckCol: (n: number) => void;
  dateCol: number;
  setDateCol: (n: number) => void;
  balesCol: number;
  setBalesCol: (n: number) => void;
  destCol: number;
  setDestCol: (n: number) => void;
  contactCol: number;
  setContactCol: (n: number) => void;
}

export const ColumnMappingDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  truckCol,
  setTruckCol,
  dateCol,
  setDateCol,
  balesCol,
  setBalesCol,
  destCol,
  setDestCol,
  contactCol,
  setContactCol,
}) => {
  if (!isOpen) return null;

  const colOptions = [
    { label: 'Auto Detect (Default)', value: -1 },
    ...Array.from({ length: 15 }, (_, i) => ({
      label: `Column ${i + 1} (${String.fromCharCode(65 + i)})`,
      value: i + 1,
    })),
  ];

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Manual Column Selection (Check-Mark Roles)</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            If your uploaded Excel sheet has unusual headers or timestamps, explicitly select which column holds each field:
          </p>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-bold text-blue-700 mb-1">Truck Number Column</label>
          <select
            value={truckCol}
            onChange={(e) => setTruckCol(Number(e.target.value))}
            className="w-full text-xs font-semibold bg-blue-50/50 border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            {colOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Date Column</label>
          <select
            value={dateCol}
            onChange={(e) => setDateCol(Number(e.target.value))}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            {colOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Bales / Qty Column</label>
          <select
            value={balesCol}
            onChange={(e) => setBalesCol(Number(e.target.value))}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            {colOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Destination (Place)</label>
          <select
            value={destCol}
            onChange={(e) => setDestCol(Number(e.target.value))}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            {colOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Owner Column</label>
          <select
            value={contactCol}
            onChange={(e) => setContactCol(Number(e.target.value))}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            {colOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
