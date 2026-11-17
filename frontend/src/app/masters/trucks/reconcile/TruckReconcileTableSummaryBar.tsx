'use client';

import React from 'react';
import { Truck, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface Props {
  trucksList: any[];
  filterParty: string;
  filterSource: string;
}

export const TruckReconcileTableSummaryBar: React.FC<Props> = ({
  trucksList,
  filterParty,
  filterSource,
}) => {
  if (!trucksList || trucksList.length === 0) return null;

  const totalFilteredRows = trucksList.length;
  const uniqueTrucks = new Set(trucksList.map((t) => t.truckNo)).size;
  const totalBales = trucksList.reduce((acc, t) => acc + (Number(t.bales) || 0), 0);
  const matchedCount = trucksList.filter((t) => t.isRegisteredInSystem).length;
  const missingCount = totalFilteredRows - matchedCount;

  return (
    <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 p-3.5 rounded-xl border border-blue-200/60 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-medium text-slate-700">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <Layers size={14} className="text-blue-600" />
          {filterParty !== 'ALL' ? (
            <span>
              Summary for <span className="text-blue-700 underline underline-offset-2">{filterParty}</span>:
            </span>
          ) : filterSource !== 'ALL' ? (
            <span>
              Summary for <span className="text-blue-700 underline underline-offset-2">{filterSource}</span>:
            </span>
          ) : (
            <span>Filtered List Summary:</span>
          )}
        </span>

        <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-semibold text-slate-900">
          {totalFilteredRows} {totalFilteredRows === 1 ? 'Row' : 'Rows'}
        </span>

        <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs text-slate-700 flex items-center gap-1">
          <Truck size={13} className="text-purple-600" />
          <b>{uniqueTrucks}</b> Trucks
        </span>

        {totalBales > 0 && (
          <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs text-slate-700">
            <b>{totalBales}</b> Total Bales
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
          <CheckCircle2 size={12} /> {matchedCount} Registered in ERP
        </span>

        {missingCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
            <AlertTriangle size={12} /> {missingCount} Missing in ERP
          </span>
        )}
      </div>
    </div>
  );
};
