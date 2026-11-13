'use client';

import React from 'react';
import { Source, Destination } from '../../types';
import { Plus } from 'lucide-react';

interface DispatchHeaderFieldsProps {
  date: string;
  srNo: string;
  sourceId: string;
  destination: string;
  sources: Source[];
  destinations: Destination[];
  onDateChange: (val: string) => void;
  onSrNoChange: (val: string) => void;
  onSourceChange: (val: string) => void;
  onDestChange: (val: string) => void;
  onOpenAddSource: () => void;
  onOpenAddDest: () => void;
}

export function DispatchHeaderFields({
  date,
  srNo,
  sourceId,
  destination,
  sources,
  destinations,
  onDateChange,
  onSrNoChange,
  onSourceChange,
  onDestChange,
  onOpenAddSource,
  onOpenAddDest,
}: DispatchHeaderFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Dispatch Date *</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">SR / Reference Number</label>
          <input
            type="text"
            placeholder="e.g. 1001"
            value={srNo}
            onChange={(e) => onSrNoChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-800">Booking Source *</label>
            <button
              type="button"
              onClick={onOpenAddSource}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <Plus size={14} /> Add Source
            </button>
          </div>
          <select
            required
            value={sourceId}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Choose Source --</option>
            {sources.map((s, idx) => (
              <option key={s.id || idx} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-800">Destination Place</label>
            <button
              type="button"
              onClick={onOpenAddDest}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <Plus size={14} /> Add Destination
            </button>
          </div>
          <select
            value={destination}
            onChange={(e) => onDestChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Choose Destination --</option>
            {destinations.map((d, idx) => (
              <option key={d.id || idx} value={d.name}>
                {d.name} {d.state ? `(${d.state})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

