'use client';

import React from 'react';
import { Truck, Scale, Camera, Hash, CheckCircle2, Info } from 'lucide-react';

interface MultiTruckGuideAlertProps {
  truckCount: number;
}

export function MultiTruckGuideAlert({ truckCount }: MultiTruckGuideAlertProps) {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/95 via-indigo-50/80 to-slate-50 border border-blue-200/90 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Truck size={18} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              Multi-Truck Dispatch Mode
              <span className="px-2.5 py-0.5 text-xs font-black bg-blue-600 text-white rounded-full shadow-2xs">
                {truckCount} {truckCount === 1 ? 'Truck Assigned' : 'Trucks Assigned'}
              </span>
            </h4>
            <p className="text-xs text-slate-600">
              Dispatches multiple independent vehicles together under the same date, source & destination.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white/95 rounded-xl border border-blue-100/90 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-blue-950">
            <Hash size={14} className="text-blue-600 shrink-0" />
            <span>Independent Truck Selection</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Every card (Truck #1, Truck #2...) holds its own unique vehicle with driver phone & bale count.
          </p>
        </div>

        <div className="p-3.5 bg-white/95 rounded-xl border border-blue-100/90 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-indigo-950">
            <Scale size={14} className="text-indigo-600 shrink-0" />
            <span>Individual Weighing</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Enter Tare and Gross weights separately for each truck with auto-calculated Net MT.
          </p>
        </div>

        <div className="p-3.5 bg-white/95 rounded-xl border border-blue-100/90 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
            <span>Tare Weight History</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Click previous tare weight badges to instantly auto-populate Tare MT from truck history.
          </p>
        </div>

        <div className="p-3.5 bg-white/95 rounded-xl border border-blue-100/90 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <Camera size={14} className="text-emerald-600 shrink-0" />
            <span>Independent Slip Photos</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Upload a separate Dharamkanta slip photo for each truck individually.
          </p>
        </div>
      </div>

      <div className="p-2.5 bg-blue-100/60 rounded-xl flex items-center gap-2 text-xs text-blue-900 font-medium">
        <Info size={15} className="text-blue-700 shrink-0" />
        <span>
          When you click <strong>Save Dispatch ({truckCount} Trucks)</strong> at the bottom, the system registers both/all trucks under the same order & dispatch date with their respective individual details!
        </span>
      </div>
    </div>
  );
}
