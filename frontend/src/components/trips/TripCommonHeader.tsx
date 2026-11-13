'use client';

import React from 'react';
import { Destination, Party, Transporter } from '../../types';
import { Plus } from 'lucide-react';

interface TripCommonHeaderProps {
  tripNo: string;
  unloadingDate: string;
  destinationId: string;
  partyId: string;
  transporterId: string;
  destinations: Destination[];
  parties: Party[];
  transporters: Transporter[];
  onTripNoChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onDestChange: (val: string) => void;
  onPartyChange: (val: string) => void;
  onTransporterChange: (val: string) => void;
  onOpenAddParty: () => void;
  onOpenAddTransporter?: () => void;
}

export function TripCommonHeader({
  tripNo,
  unloadingDate,
  destinationId,
  partyId,
  transporterId,
  destinations,
  parties,
  transporters,
  onTripNoChange,
  onDateChange,
  onDestChange,
  onPartyChange,
  onTransporterChange,
  onOpenAddParty,
  onOpenAddTransporter,
}: TripCommonHeaderProps) {
  const filteredParties = parties.filter(
    (p) => !destinationId || !p.destinationId || p.destinationId === destinationId,
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Trip / SR Number *</label>
          <input
            type="text"
            placeholder="e.g. 1001"
            value={tripNo}
            onChange={(e) => onTripNoChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Unloading Date *</label>
          <input
            type="date"
            required
            value={unloadingDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Destination Mandi *</label>
          <select
            required
            value={destinationId}
            onChange={(e) => onDestChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Choose Destination --</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.state ? `(${d.state})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-800">Party / Mill Name *</label>
            <button
              type="button"
              onClick={onOpenAddParty}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <Plus size={14} /> Add Party
            </button>
          </div>
          <select
            required
            value={partyId}
            onChange={(e) => onPartyChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Choose Party --</option>
            {filteredParties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-800">
              Unloaded on Transporter *
            </label>
            {onOpenAddTransporter && (
              <button
                type="button"
                onClick={onOpenAddTransporter}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <Plus size={14} /> Add Transporter
              </button>
            )}
          </div>
          <select
            required
            value={transporterId}
            onChange={(e) => onTransporterChange(e.target.value)}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Choose Transporter --</option>
            {transporters.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

