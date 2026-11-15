'use client';

import React from 'react';
import { AlertTriangle, ArrowDownRight, CheckCircle2 } from 'lucide-react';
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
}

export function PriorDeficitAlert({
  deficits,
  priorRecovery,
  onPriorRecoveryChange,
  currentAvailableNet,
}: PriorDeficitAlertProps) {
  if (!deficits || deficits.length === 0) return null;

  const totalDeficit = deficits.reduce((sum, d) => sum + Math.abs(Number(d.outstanding || 0)), 0);
  const maxCanOffset = Math.max(0, Math.min(currentAvailableNet, totalDeficit));
  const currentOffset = Number(priorRecovery) || 0;
  const remainingDeficit = Math.max(0, totalDeficit - currentOffset);

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-amber-300 bg-amber-50/90 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <span>Recoverable Excess Diesel / Overdrawn Trips Detected</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900">
          Total Deficit: {formatCurrency(totalDeficit)}
        </span>
      </div>

      <div className="text-xs text-amber-800 space-y-1.5 bg-white/70 p-2.5 rounded-lg border border-amber-200/60">
        <div className="font-semibold text-slate-700 mb-1">Unsettled Deficit Trips from Fleet / Transporter:</div>
        {deficits.map((d) => (
          <div key={d.id} className="flex justify-between items-center text-slate-600 py-0.5">
            <span>
              Trip #{d.trip_no} {d.truck_no ? `• Truck: ${d.truck_no}` : ''} {d.transporter_name ? `(${d.transporter_name})` : ''}:
            </span>
            <span className="font-bold text-rose-700">- {formatCurrency(Math.abs(Number(d.outstanding)))}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
        <div>
          <label className="block text-xs font-bold text-amber-950 mb-1">
            Deduct Prior Deficit from This Trip (₹):
          </label>
          <input
            type="number"
            min="0"
            max={totalDeficit}
            step="any"
            value={priorRecovery}
            onChange={(e) => onPriorRecoveryChange(e.target.value)}
            className="w-full h-10 px-3 text-sm font-bold border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white text-slate-900"
            placeholder="0.00"
          />
        </div>
        <div className="flex items-center gap-2">
          {maxCanOffset > 0 && currentOffset !== maxCanOffset && (
            <button
              type="button"
              onClick={() => onPriorRecoveryChange(maxCanOffset.toFixed(2))}
              className="h-10 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowDownRight size={14} /> Auto-Offset Max ({formatCurrency(maxCanOffset)})
            </button>
          )}
          {currentOffset > 0 && (
            <span className="text-[11px] text-amber-900 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Remaining: {formatCurrency(remainingDeficit)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

