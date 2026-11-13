'use client';

import React from 'react';
import { Calculator, Scale, Truck as TruckIcon } from 'lucide-react';
import { formatCurrency } from '../../lib/api';
import { Truck } from '../../types';

interface TripFreightSidebarProps {
  netWeight: string;
  ratePerUnit: string;
  grossFreight: number;
  isMultiMode?: boolean;
  truckCount?: number;
  multiRows?: { truckId: string; netWeight: string; ratePerUnit: string }[];
  trucks?: Truck[];
}

export function TripFreightSidebar({
  netWeight,
  ratePerUnit,
  grossFreight,
  isMultiMode = false,
  truckCount = 1,
  multiRows = [],
  trucks = [],
}: TripFreightSidebarProps) {
  return (
    <div className="space-y-6 lg:sticky lg:top-24 self-start">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calculator size={18} className="text-blue-600" /> Gross Freight
          </span>
          <span className={`px-2 py-0.5 text-[11px] font-black rounded-md ${isMultiMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {isMultiMode ? `${truckCount} Trucks` : '1 Truck'}
          </span>
        </h3>
        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">{isMultiMode ? 'Total Weight:' : 'Weight:'}</span>
            <span className="font-semibold text-slate-700">{netWeight ? `${netWeight} MT` : '-'}</span>
          </div>
          {!isMultiMode && (
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Rate:</span>
              <span className="font-semibold text-slate-700">{ratePerUnit ? `₹${ratePerUnit}/MT` : '-'}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-blue-50/60 px-3 rounded-xl">
            <span className="text-blue-900 font-semibold">{isMultiMode ? 'Total Freight:' : 'Gross Freight:'}</span>
            <span className="text-lg font-black text-blue-700">{formatCurrency(grossFreight)}</span>
          </div>

          {isMultiMode && multiRows.filter((r) => r.truckId).length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Unloaded Vehicles:</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {multiRows.filter((r) => r.truckId).map((r, i) => {
                  const tObj = trucks.find((t) => t.id === r.truckId);
                  const rowFreight = Number(r.netWeight || 0) * Number(r.ratePerUnit || ratePerUnit || 0);
                  return (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs border border-slate-100">
                      <span className="font-bold text-slate-800">{tObj?.truckNo || 'Truck'}</span>
                      <span className="text-slate-600 font-medium">
                        {r.netWeight ? `${r.netWeight} MT` : ''} {rowFreight > 0 ? `• ${formatCurrency(rowFreight)}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-xs text-slate-400 space-y-2">
        <p className="font-bold text-sm text-white flex items-center gap-1.5">
          <Scale size={16} className="text-blue-400" /> Settlement Formula
        </p>
        <div className="space-y-1 font-mono text-[11px] text-slate-300">
          <p>Gross = Weight × Rate</p>
          <p>Net = Gross - Advance - Diesel - Com</p>
        </div>
      </div>
    </div>
  );
}

