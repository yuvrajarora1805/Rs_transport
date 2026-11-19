'use client';

import React from 'react';
import { Truck, CheckCircle2, AlertTriangle, Layers, Wallet, Scale } from 'lucide-react';
import { formatCurrency } from '../../../../lib/api';

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
  const totalOutstanding = trucksList.reduce((acc, t) => acc + (Number(t.erpOutstanding ?? t.dbOutstanding) || 0), 0);
  const totalFreight = trucksList.reduce((acc, t) => acc + (Number(t.erpGrossFreight ?? t.dbGrossFreight) || 0), 0);
  const totalPaid = trucksList.reduce((acc, t) => acc + (Number(t.erpPaid ?? t.dbPaid) || 0), 0);
  const totalExcelWt = trucksList.reduce((acc, t) => acc + (Number(t.excelWeight) || 0), 0);
  const matchedCount = trucksList.filter((t) => t.isRegisteredInSystem).length;
  const missingCount = totalFilteredRows - matchedCount;

  return (
    <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 p-3.5 rounded-xl border border-blue-200/60 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-medium text-slate-700">
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
            <span>Intake Summary:</span>
          )}
        </span>

        <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-semibold text-slate-900">
          {totalFilteredRows} Rows
        </span>

        <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs text-slate-700 flex items-center gap-1">
          <Truck size={13} className="text-purple-600" />
          <b>{uniqueTrucks}</b> Trucks
        </span>

        {totalExcelWt > 0 && (
          <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs text-slate-700 flex items-center gap-1">
            <Scale size={13} className="text-blue-500" />
            <b>{totalExcelWt.toFixed(1)}</b> Qtl (Excel)
          </span>
        )}

        {totalFreight > 0 && (
          <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs text-slate-800 font-medium">
            ERP Freight: <b>{formatCurrency(totalFreight)}</b>
          </span>
        )}

        {totalPaid > 0 && (
          <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs text-emerald-700 font-medium">
            Paid: <b>{formatCurrency(totalPaid)}</b>
          </span>
        )}

        {totalOutstanding > 0 ? (
          <span className="bg-rose-50 px-2.5 py-1 rounded-md border border-rose-300 shadow-2xs text-rose-700 font-bold flex items-center gap-1">
            <Wallet size={13} className="text-rose-600" />
            Outstanding: {formatCurrency(totalOutstanding)}
          </span>
        ) : (
          <span className="bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-emerald-700 font-semibold">
            All Settled (₹0.00)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
          <CheckCircle2 size={12} /> {matchedCount} Registered
        </span>

        {missingCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
            <AlertTriangle size={12} /> {missingCount} Missing
          </span>
        )}
      </div>
    </div>
  );
};
