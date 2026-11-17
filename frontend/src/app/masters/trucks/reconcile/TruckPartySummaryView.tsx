'use client';

import React, { useState } from 'react';
import { formatCurrency } from '../../../../lib/api';
import { ChevronDown, ChevronRight, Truck, User, MapPin } from 'lucide-react';
import { TruckPartyTripsTable } from './TruckPartyTripsTable';
import { TripPaymentDrawer } from './TripPaymentDrawer';

interface Props {
  data: any[];
  loading: boolean;
  partiesList?: string[];
  selectedParty?: string;
  onSelectParty?: (party: string) => void;
}

export const TruckPartySummaryView: React.FC<Props> = ({
  data,
  loading,
  partiesList = [],
  selectedParty = 'ALL',
  onSelectParty,
}) => {
  const [expandedTrucks, setExpandedTrucks] = useState<Record<string, boolean>>({});
  const [activeModalTrip, setActiveModalTrip] = useState<{ trip: any; truckNo: string; partyName: string } | null>(null);

  const toggleTruck = (truckNo: string) => {
    setExpandedTrucks((prev) => ({ ...prev, [truckNo]: !prev[truckNo] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    data.forEach((item) => {
      all[item.truckNo] = true;
    });
    setExpandedTrucks(all);
  };

  const collapseAll = () => {
    setExpandedTrucks({});
  };


  return (
    <div className="space-y-4">
      {/* Party Filter & Control Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Filter by Party:</span>
          <select
            value={selectedParty}
            onChange={(e) => onSelectParty && onSelectParty(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Parties ({partiesList.length})</option>
            {partiesList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          Loading truck-to-party summary...
        </div>
      )}

      {!loading && (!data || data.length === 0) && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No trips or party activity recorded for this selection.
        </div>
      )}

      {!loading &&
        data &&
        data.map((item) => {

        const isExpanded = !!expandedTrucks[item.truckNo];
        return (
          <div
            key={item.truckNo}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
          >
            {/* Truck Header Card */}
            <div
              onClick={() => toggleTruck(item.truckNo)}
              className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 select-none transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Truck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900 tracking-wide">
                      {item.truckNo}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                      {item.parties.length} {item.parties.length === 1 ? 'Party' : 'Parties'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Total {item.totalTrips} delivery trips recorded
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Gross Freight</div>
                  <div className="text-sm font-bold text-slate-900">
                    {formatCurrency(item.totalGrossFreight)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Paid Amount</div>
                  <div className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(item.totalPaid)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Pending Balance</div>
                  <div
                    className={`text-sm font-bold ${
                      item.totalOutstanding > 0 ? 'text-rose-600' : 'text-slate-600'
                    }`}
                  >
                    {formatCurrency(item.totalOutstanding)}
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </div>
            </div>

            {/* Party Breakdown List (Sorted Party-Wise) */}
            {isExpanded && (
              <div className="divide-y divide-slate-100 bg-slate-50/50">
                {item.parties.map((p: any, idx: number) => (
                  <div key={`${item.truckNo}-${p.partyName}-${idx}`} className="p-4 sm:p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-blue-600" />
                        <span className="font-bold text-sm text-slate-900">{p.partyName}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium ml-2">
                          <MapPin size={12} className="text-slate-400" />
                          {p.destinationName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="text-slate-600">{p.tripsCount} trips ({p.totalWeight.toFixed(2)} MT)</span>
                        <span className="text-slate-900">Freight: {formatCurrency(p.grossFreight)}</span>
                        <span className="text-amber-700">Diesel: {formatCurrency(p.dieselAmount)}</span>
                        <span
                          className={`font-bold ${
                            p.outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          Bal: {formatCurrency(p.outstanding)}
                        </span>
                      </div>
                    </div>

                    {/* Nested Trips Table with Settlement & Payment action */}
                    <TruckPartyTripsTable
                      trips={p.trips}
                      truckNo={item.truckNo}
                      partyName={p.partyName}
                      onOpenTripModal={(trip, truckNo, partyName) =>
                        setActiveModalTrip({ trip, truckNo, partyName })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Settlement & Payment Summary Modal Drawer */}
      {activeModalTrip && (
        <TripPaymentDrawer
          trip={activeModalTrip.trip}
          truckNo={activeModalTrip.truckNo}
          partyName={activeModalTrip.partyName}
          onClose={() => setActiveModalTrip(null)}
        />
      )}
    </div>
  );
};
