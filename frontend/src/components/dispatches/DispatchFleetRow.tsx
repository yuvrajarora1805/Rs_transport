'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '../ui/Badge';
import { ImageIcon } from 'lucide-react';
import { DispatchTruckItem, GroupedDispatchOrder } from './dispatchGrouping';

interface DispatchFleetRowProps {
  truck: DispatchTruckItem;
  order: GroupedDispatchOrder;
  index: number;
  isMulti: boolean;
  onPreviewSlip: (url: string) => void;
}

export function DispatchFleetRow({
  truck,
  order,
  index,
  isMulti,
  onPreviewSlip,
}: DispatchFleetRowProps) {
  const unitLabel = order.material?.toLowerCase().includes('rice') ? 'Bags' : 'Bales';
  const letter = String.fromCharCode(65 + index);

  return (
    <div className="flex flex-wrap items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-xs gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {isMulti && (
          <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center border border-blue-200">
            {letter}
          </span>
        )}
        {truck.truckId ? (
          <Link href={`/masters/trucks/${truck.truckId}`} className="font-bold text-blue-600 hover:underline">
            {truck.truckNo}
          </Link>
        ) : (
          <span className="font-bold text-slate-800">{truck.truckNo}</span>
        )}
        <span className="text-slate-600 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
          {truck.bales || 0} {unitLabel}
        </span>
        {truck.mobileNo && (
          <span className="text-[11px] text-slate-500 font-medium">
            📱 {truck.mobileNo}
          </span>
        )}
        {truck.slipImage && (
          <button
            type="button"
            onClick={() => onPreviewSlip(truck.slipImage!)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
            title="View Dispatch Slip"
          >
            <ImageIcon size={12} /> Slip
          </button>
        )}
      </div>

      <div>
        {truck.tripId ? (
          <div className="flex items-center gap-1.5">
            <Badge variant="success">✓ Loaded</Badge>
            <Link href="/trips" className="text-[11px] font-bold text-blue-600 hover:underline">
              Trip #{truck.tripNo} {truck.loadedWeight ? `(${Number(truck.loadedWeight).toFixed(2)} MT)` : ''}
            </Link>
          </div>
        ) : (
          <Link
            href={`/trips/new?dispatchId=${truck.id}&truckId=${truck.truckId}&srNo=${encodeURIComponent(truck.subTripNo)}&destination=${encodeURIComponent(order.destination)}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
            title={`Record Weighbridge Loading for ${truck.truckNo} (${truck.subTripNo})`}
          >
            + Record Loading ({truck.subTripNo}) →
          </Link>
        )}
      </div>
    </div>
  );
}

