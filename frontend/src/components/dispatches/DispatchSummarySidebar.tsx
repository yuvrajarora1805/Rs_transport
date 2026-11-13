'use client';

import React from 'react';
import { Truck, Source } from '../../types';
import { Truck as TruckIcon, MapPin, Send } from 'lucide-react';
import { MultiTruckRow } from './MultiTruckRowCard';

interface DispatchSummarySidebarProps {
  isMultiMode: boolean;
  selectedTruck?: Truck;
  singleBales?: string;
  multiTrucks?: MultiTruckRow[];
  trucks?: Truck[];
  multiTruckCount: number;
  totalMultiBales: number;
  selectedSource?: Source;
  destination?: string;
  loading?: boolean;
  onSubmit?: () => void;
}

export function DispatchSummarySidebar({
  isMultiMode,
  selectedTruck,
  singleBales,
  multiTrucks = [],
  trucks = [],
  multiTruckCount,
  totalMultiBales,
  selectedSource,
  destination,
  loading = false,
  onSubmit,
}: DispatchSummarySidebarProps) {
  return (
    <div className="space-y-5 lg:sticky lg:top-24 self-start">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TruckIcon size={18} className="text-blue-600" /> Dispatch Summary
          </span>
          <span className={`px-2 py-0.5 text-[11px] font-black rounded-md ${isMultiMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {isMultiMode ? `${multiTruckCount} Trucks` : '1 Truck'}
          </span>
        </h3>
        <div className="space-y-3 text-sm">
          {!isMultiMode ? (
            <>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Selected Truck:</span>
                <span className="font-bold text-slate-900">{selectedTruck?.truckNo || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Truck Owner:</span>
                <span className="font-semibold text-slate-700">{selectedTruck?.ownerName || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Bales:</span>
                <span className="font-bold text-blue-600">{singleBales || '0'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Bales:</span>
                <span className="font-bold text-blue-600">{totalMultiBales}</span>
              </div>
              {multiTrucks.filter((r) => r.truckId).length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Assigned Vehicles:</span>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {multiTrucks.filter((r) => r.truckId).map((r, i) => {
                      const tObj = trucks.find((t) => t.id === r.truckId);
                      return (
                        <div key={i} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                          <span className="font-bold text-slate-800">{tObj?.truckNo || 'Truck'}</span>
                          <span className="text-slate-500 font-medium">{r.bales ? `${r.bales} bales` : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Source:</span>
            <span className="font-semibold text-slate-700">{selectedSource?.name || 'None'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Destination:</span>
            <span className="font-bold text-slate-900">{destination || '-'}</span>
          </div>
        </div>

        {onSubmit && (
          <div className="pt-4 mt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              {loading ? 'Saving...' : isMultiMode ? `Save Dispatch (${multiTruckCount} Trucks)` : 'Save Dispatch'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-5 text-xs text-blue-900 space-y-2">
        <p className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
          <MapPin size={16} className="text-blue-600" /> Operational Rule
        </p>
        <p className="leading-relaxed">
          Recording a dispatch books truck departure. Once loaded and weighed at the Dharamkanta/weighbridge, record weights in <strong>Step 2: Trips & Freight</strong>.
        </p>
      </div>
    </div>
  );
}
