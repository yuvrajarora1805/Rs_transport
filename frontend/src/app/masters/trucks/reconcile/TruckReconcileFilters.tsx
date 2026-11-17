'use client';

import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';

interface Props {
  filterSource: string;
  setFilterSource: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  sourcesBreakdown: any[];
  matchedCount: number;
  missingCount: number;
  loading: boolean;
  onReload: () => void;
}

export const TruckReconcileFilters: React.FC<Props> = ({
  filterSource,
  setFilterSource,
  filterStatus,
  setFilterStatus,
  sourcesBreakdown,
  matchedCount,
  missingCount,
  loading,
  onReload,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Filter size={14} className="text-slate-400" />
          Source Sheet:
        </div>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
        >
          <option value="ALL">All Sources ({sourcesBreakdown.length})</option>
          {sourcesBreakdown.map((s: any) => (
            <option key={s.source} value={s.source}>
              {s.source} ({s.entries} rows, {s.bales} bales)
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 ml-2">
          Match Status:
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
        >
          <option value="ALL">All Statuses</option>
          <option value="MATCHED">Matched in ERP ({matchedCount})</option>
          <option value="MISSING">Missing in ERP ({missingCount})</option>
        </select>
      </div>

      <button
        onClick={onReload}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Reset View
      </button>
    </div>
  );
};
