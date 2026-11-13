'use client';

import React, { useState } from 'react';
import { Calculator, FileCheck, Eye, X, Scale } from 'lucide-react';
import { formatCurrency } from '../../lib/api';
import { Trip } from '../../types';

interface SettlementSummarySidebarProps {
  selectedTrip: Trip | null;
  gross: number;
  diesel: number;
  advance: number;
  comm: number;
  other: number;
  netPayable: number;
}

export function SettlementSummarySidebar({
  selectedTrip,
  gross,
  diesel,
  advance,
  comm,
  other,
  netPayable,
}: SettlementSummarySidebarProps) {
  const [showSlipModal, setShowSlipModal] = useState(false);

  const transp = selectedTrip
    ? (selectedTrip as any).transporter_name || selectedTrip.transporter?.name || (selectedTrip as any).company_code || 'RS Transport'
    : '';

  return (
    <div className="space-y-6 lg:sticky lg:top-24 self-start">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Calculator size={18} className="text-blue-600" /> Settlement Summary
        </h3>

        <div className="space-y-3 text-sm">
          {selectedTrip && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span className="text-slate-500">Unloaded Transporter:</span>
                <span className="text-blue-700 font-extrabold">{transp}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-500">Truck:</span>
                <span className="font-semibold text-slate-800">{selectedTrip.truck?.truckNo || (selectedTrip as any).truck_no}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-500">Party / Dest:</span>
                <span className="font-medium text-slate-700">
                  {selectedTrip.party?.name || (selectedTrip as any).party_name || '-'} • {selectedTrip.destination?.name || (selectedTrip as any).destination_name || '-'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-500">Weight & Rate:</span>
                <span className="font-bold text-slate-900">
                  {Number(selectedTrip.netWeight || (selectedTrip as any).net_weight).toFixed(2)} MT @ ₹{Number(selectedTrip.ratePerUnit || (selectedTrip as any).rate_per_unit).toFixed(2)}
                </span>
              </div>

              {/* Linked Trip Slip Photo Thumbnail */}
              {(selectedTrip as any).slip_image && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Scale size={12} className="text-blue-600" /> Weighbridge Slip:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSlipModal(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200"
                  >
                    <Eye size={11} /> View Trip Slip
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Gross Freight:</span>
            <span className="font-bold text-slate-900">{formatCurrency(gross)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50 text-rose-600">
            <span>Diesel Slip:</span>
            <span className="font-semibold">- {formatCurrency(diesel)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50 text-rose-600">
            <span>Cash Advance:</span>
            <span className="font-semibold">- {formatCurrency(advance)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50 text-rose-600">
            <span>Commission:</span>
            <span className="font-semibold">- {formatCurrency(comm)}</span>
          </div>
          {other > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-50 text-rose-600">
              <span>Other Deductions:</span>
              <span className="font-semibold">- {formatCurrency(other)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-emerald-50/70 px-3 rounded-xl">
            <span className="text-emerald-900 font-bold">Net Payable:</span>
            <span className="text-lg font-black text-emerald-700">{formatCurrency(netPayable)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-6 text-xs text-blue-900 space-y-2">
        <p className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
          <FileCheck size={16} className="text-blue-600" /> Payment Link
        </p>
        <p className="leading-relaxed">
          Once finalized, this amount appears under <strong>Outstanding Ledger</strong> until payment vouchers are issued under <strong>Payments</strong>.
        </p>
      </div>

      {/* Slip Modal */}
      {showSlipModal && (selectedTrip as any)?.slip_image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="font-bold text-sm text-slate-900">Trip Dharamkanta Weighbridge Slip</h4>
              <button onClick={() => setShowSlipModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex justify-center bg-slate-100 rounded-xl p-2">
              <img src={(selectedTrip as any).slip_image} alt="Trip Dharamkanta Slip" className="max-w-full h-auto rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

