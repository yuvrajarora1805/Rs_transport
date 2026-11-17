'use client';

import React from 'react';
import { X, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../lib/api';
import { Badge } from '../../../../components/ui/Badge';
import Link from 'next/link';

interface Props {
  trip: any | null;
  truckNo: string;
  partyName: string;
  onClose: () => void;
}

export const TripPaymentDrawer: React.FC<Props> = ({ trip, truckNo, partyName, onClose }) => {
  if (!trip) return null;

  const gross = Number(trip.gross_freight || 0);
  const diesel = Number(trip.diesel_amount || 0);
  const advance = Number(trip.advance_amount || 0);
  const commission = Number(trip.commission || 0);
  const netPayable = Number(trip.net_payable || (gross - diesel - advance - commission));
  const paid = Number(trip.total_paid || 0);
  const outstanding = Number(trip.outstanding || Math.max(0, netPayable - paid));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <CreditCard size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Settlement & Payment Details</h3>
              <p className="text-xs text-slate-300">
                Trip <span className="font-semibold text-white">{trip.trip_no}</span> • {truckNo}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-medium">Party / Consignee:</span>
              <div className="font-bold text-slate-900 mt-0.5">{partyName}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Unload Date:</span>
              <div className="font-bold text-slate-900 mt-0.5">{formatDate(trip.unloading_date)}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Weight / Rate:</span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {Number(trip.net_weight || 0).toFixed(2)} MT @ ₹{Number(trip.rate_per_unit || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Settlement Status:</span>
              <div className="mt-0.5">
                <Badge variant={trip.settlement_status === 'PAID' ? 'success' : trip.settlement_id ? 'info' : 'neutral'}>
                  {trip.settlement_status || (trip.settlement_id ? 'SETTLED' : 'NOT SETTLED')}
                </Badge>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            <div className="flex justify-between p-2.5 bg-slate-50 font-semibold text-slate-700">
              <span>Financial Breakdown</span>
              <span>Amount (₹)</span>
            </div>
            <div className="flex justify-between p-2.5">
              <span className="text-slate-600">Gross Freight</span>
              <span className="font-bold text-slate-900">{formatCurrency(gross)}</span>
            </div>
            <div className="flex justify-between p-2.5">
              <span className="text-slate-600">Diesel Deductions (Fuel)</span>
              <span className="font-semibold text-amber-700">- {formatCurrency(diesel)}</span>
            </div>
            {advance > 0 && (
              <div className="flex justify-between p-2.5">
                <span className="text-slate-600">Advance Cash</span>
                <span className="font-semibold text-amber-700">- {formatCurrency(advance)}</span>
              </div>
            )}
            {commission > 0 && (
              <div className="flex justify-between p-2.5">
                <span className="text-slate-600">Commission / Deductions</span>
                <span className="font-semibold text-amber-700">- {formatCurrency(commission)}</span>
              </div>
            )}
            <div className="flex justify-between p-2.5 bg-blue-50/50 font-bold text-blue-900">
              <span>Net Freight Payable</span>
              <span>{formatCurrency(netPayable)}</span>
            </div>
            <div className="flex justify-between p-2.5 font-semibold text-emerald-700">
              <span>Total Paid to Date</span>
              <span>{formatCurrency(paid)}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-rose-50/60 font-bold text-rose-700">
              <span>Pending Outstanding Balance</span>
              <span className="text-sm">{formatCurrency(outstanding)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            {trip.settlement_id ? (
              <Link
                href={`/payments/new?settlementId=${trip.settlement_id}&outstanding=${outstanding}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                <CreditCard size={14} /> Record Payment <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                href={`/settlements/new?tripId=${trip.trip_id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                <FileText size={14} /> Generate Settlement <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
