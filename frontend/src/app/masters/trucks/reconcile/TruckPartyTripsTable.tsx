'use client';

import React from 'react';
import { formatDate, formatCurrency } from '../../../../lib/api';
import { Badge } from '../../../../components/ui/Badge';
import { Receipt } from 'lucide-react';

interface Props {
  trips: any[];
  truckNo: string;
  partyName: string;
  onOpenTripModal: (trip: any, truckNo: string, partyName: string) => void;
}

export const TruckPartyTripsTable: React.FC<Props> = ({
  trips,
  truckNo,
  partyName,
  onOpenTripModal,
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
          <tr>
            <th className="py-2 px-3">Trip No</th>
            <th className="py-2 px-3">Unload Date</th>
            <th className="py-2 px-3">Weight (MT)</th>
            <th className="py-2 px-3">Rate (₹)</th>
            <th className="py-2 px-3">Gross Freight</th>
            <th className="py-2 px-3">Diesel Deductions</th>
            <th className="py-2 px-3">Paid Amount</th>
            <th className="py-2 px-3">Pending</th>
            <th className="py-2 px-3">Settlement</th>
            <th className="py-2 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {trips.map((t: any, tIdx: number) => (
            <tr key={`${t.trip_id || 'trip'}-${tIdx}`} className="hover:bg-slate-50">
              <td className="py-2 px-3 font-semibold text-blue-600">{t.trip_no}</td>
              <td className="py-2 px-3">{formatDate(t.unloading_date)}</td>
              <td className="py-2 px-3">{Number(t.net_weight || 0).toFixed(2)} MT</td>
              <td className="py-2 px-3">₹{Number(t.rate_per_unit || 0).toFixed(2)}</td>
              <td className="py-2 px-3 font-semibold">{formatCurrency(Number(t.gross_freight))}</td>
              <td className="py-2 px-3 text-amber-700 font-medium">{formatCurrency(Number(t.diesel_amount))}</td>
              <td className="py-2 px-3 text-emerald-600 font-medium">{formatCurrency(Number(t.total_paid))}</td>
              <td className="py-2 px-3 font-bold text-rose-600">{formatCurrency(Number(t.outstanding))}</td>
              <td className="py-2 px-3">
                <Badge variant={t.settlement_status === 'PAID' ? 'success' : t.settlement_id ? 'info' : 'neutral'}>
                  {t.settlement_status || (t.settlement_id ? 'SETTLED' : 'PENDING')}
                </Badge>
              </td>
              <td className="py-2 px-3 text-right">
                <button
                  onClick={() => onOpenTripModal(t, truckNo, partyName)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors shadow-2xs"
                >
                  <Receipt size={12} /> Settle / Pay →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
