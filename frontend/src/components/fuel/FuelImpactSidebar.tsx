'use client';

import React from 'react';
import { Building2, Fuel } from 'lucide-react';
import { formatCurrency } from '../../lib/api';
import { Pump, Truck } from '../../types';

interface FuelImpactSidebarProps {
  selectedPump?: Pump;
  selectedTruck?: Truck;
  amount: string;
}

export function FuelImpactSidebar({
  selectedPump,
  selectedTruck,
  amount,
}: FuelImpactSidebarProps) {
  return (
    <div className="space-y-6 lg:sticky lg:top-24 self-start">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building2 size={18} className="text-blue-600" /> Pump Statement Impact
        </h3>
        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Selected Pump:</span>
            <span className="font-bold text-slate-900">{selectedPump?.name || 'None selected'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Truck:</span>
            <span className="font-bold text-slate-900">{selectedTruck?.truckNo || '-'}</span>
          </div>
          <div className="flex justify-between py-2 bg-amber-50/60 px-3 rounded-xl">
            <span className="text-amber-900 font-semibold">Fuel Slip Amount:</span>
            <span className="text-lg font-black text-amber-700">
              {formatCurrency(amount ? Number(amount) : 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-6 text-xs text-blue-900 space-y-2">
        <p className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
          <Fuel size={16} className="text-blue-600" /> Accounting Rule
        </p>
        <p className="leading-relaxed">
          Saving this slip immediately creates a <strong>Debit</strong> in the pump's ledger, and makes this diesel deduction available when settling freight for this truck.
        </p>
      </div>
    </div>
  );
}

