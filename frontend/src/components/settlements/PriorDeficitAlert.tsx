'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowDownRight, CheckCircle2, CheckSquare, Square, Filter } from 'lucide-react';
import { formatCurrency } from '../../lib/api';

export interface PriorDeficitItem {
  id: string;
  trip_id: string;
  trip_no: string;
  truck_no?: string;
  transporter_name?: string;
  settlement_date: string;
  gross_freight: number;
  diesel_amount: number;
  net_payable: number;
  outstanding: number;
}

interface PriorDeficitAlertProps {
  deficits: PriorDeficitItem[];
  priorRecovery: string;
  onPriorRecoveryChange: (val: string) => void;
  currentAvailableNet: number;
  currentTruckNo?: string;
}

export function PriorDeficitAlert({
  deficits,
  priorRecovery,
  onPriorRecoveryChange,
  currentAvailableNet,
  currentTruckNo,
}: PriorDeficitAlertProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'ALL' | 'TRUCK'>('ALL');

  // Filter deficits based on user filter (Same Truck vs All Fleet)
  const filteredDeficits = deficits.filter((d) => {
    if (filterMode === 'TRUCK' && currentTruckNo && d.truck_no) {
      return d.truck_no.toUpperCase() === currentTruckNo.toUpperCase();
    }
    return true;
  });

  const toggleSelectEntry = (id: string, deficitAmount: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);

    // Sum up selected deficit amounts
    let total = 0;
    deficits.forEach((d) => {
      if (next.has(d.id)) {
        total += Math.abs(Number(d.outstanding || d.net_payable || 0));
      }
    });

    const capped = Math.min(total, Math.max(0, currentAvailableNet));
    onPriorRecoveryChange(capped > 0 ? capped.toFixed(2) : total > 0 ? total.toFixed(2) : '0');
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredDeficits.length) {
      setSelectedIds(new Set());
      onPriorRecoveryChange('0');
    } else {
      const allIds = new Set(filteredDeficits.map((d) => d.id));
      setSelectedIds(allIds);
      const total = filteredDeficits.reduce((sum, d) => sum + Math.abs(Number(d.outstanding || d.net_payable || 0)), 0);
      const capped = Math.min(total, Math.max(0, currentAvailableNet));
      onPriorRecoveryChange(capped > 0 ? capped.toFixed(2) : total.toFixed(2));
    }
  };

  if (!deficits || deficits.length === 0) return null;

  const totalFilteredDeficit = filteredDeficits.reduce((sum, d) => sum + Math.abs(Number(d.outstanding || d.net_payable || 0)), 0);
  const currentOffset = Number(priorRecovery) || 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/90 shadow-sm space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-200">
        <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <span>Recoverable Excess Diesel Deficits</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold">
            {filteredDeficits.length} Pending
          </span>
        </div>

        {/* Filter toggle */}
        {currentTruckNo && (
          <div className="flex items-center gap-1 bg-amber-200/70 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterMode === 'ALL' ? 'bg-white text-amber-950 shadow-xs' : 'text-amber-800 hover:text-amber-950'}`}
            >
              All Fleet ({deficits.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('TRUCK')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterMode === 'TRUCK' ? 'bg-white text-amber-950 shadow-xs' : 'text-amber-800 hover:text-amber-950'}`}
            >
              This Truck ({currentTruckNo})
            </button>
          </div>
        )}
      </div>

      <div className="text-xs space-y-1.5 max-h-56 overflow-y-auto pr-1 [scrollbar-width:thin]">
        <div className="flex justify-between items-center text-slate-500 font-bold px-1 mb-1">
          <span>Click to select entry to settle:</span>
          <button type="button" onClick={handleSelectAll} className="text-amber-800 hover:text-amber-950 underline font-semibold">
            {selectedIds.size === filteredDeficits.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {filteredDeficits.map((d) => {
          const amt = Math.abs(Number(d.outstanding || d.net_payable || 0));
          const isSelected = selectedIds.has(d.id);
          const isSameTruck = currentTruckNo && d.truck_no && d.truck_no.toUpperCase() === currentTruckNo.toUpperCase();

          return (
            <div
              key={d.id}
              onClick={() => toggleSelectEntry(d.id, amt)}
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-amber-100/90 border-amber-500 shadow-xs text-amber-950'
                  : 'bg-white/80 border-amber-200/80 hover:bg-amber-100/50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="text-amber-700 shrink-0">
                  {isSelected ? <CheckSquare size={17} className="text-amber-700" /> : <Square size={17} className="text-slate-400" />}
                </div>
                <div className="truncate">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Trip #{d.trip_no}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${isSameTruck ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      {d.truck_no || 'Truck'}
                    </span>
                    {d.transporter_name && <span className="text-[11px] text-slate-500 font-normal">({d.transporter_name})</span>}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Gross: {formatCurrency(Number(d.gross_freight))} • Diesel: {formatCurrency(Number(d.diesel_amount))}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-black text-rose-700 text-sm">
                - {formatCurrency(amt)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs font-bold text-amber-950 mb-1">
            Deficit Amount to Deduct from This Trip (₹):
          </label>
          <input
            type="number"
            min="0"
            max={totalFilteredDeficit}
            step="any"
            value={priorRecovery}
            onChange={(e) => onPriorRecoveryChange(e.target.value)}
            className="w-full h-10 px-3 text-sm font-bold border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white text-slate-900"
            placeholder="0.00"
          />
        </div>
        <div className="flex items-center gap-2">
          {currentOffset > 0 && (
            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Will Offset: {formatCurrency(currentOffset)}
            </span>
          )}
          {currentOffset !== totalFilteredDeficit && totalFilteredDeficit > 0 && (
            <button
              type="button"
              onClick={() => onPriorRecoveryChange(Math.min(totalFilteredDeficit, Math.max(0, currentAvailableNet)).toFixed(2))}
              className="h-10 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-xs ml-auto"
            >
              <ArrowDownRight size={14} /> Offset All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
