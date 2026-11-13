'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Truck } from '../../types';
import { Truck as TruckIcon, Search, X } from 'lucide-react';

interface TruckSelectProps {
  trucks: Truck[];
  value: string;
  onChange: (truckId: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function TruckSelect({
  trucks,
  value,
  onChange,
  required = false,
  placeholder = 'Type truck number or select...',
  className = '',
}: TruckSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTruck = trucks.find(
    (t) => (t.id || (t as any).truck_id) === value,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTrucks = query.trim()
    ? trucks.filter((t) => {
        const no = (t.truckNo || (t as any).truck_no || '').toLowerCase();
        const owner = (t.ownerName || (t as any).owner_name || '').toLowerCase();
        const q = query.toLowerCase();
        return no.includes(q) || owner.includes(q);
      })
    : trucks;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {selectedTruck ? (
        <div className="flex items-center justify-between h-11 px-3 text-sm bg-blue-50/70 border border-blue-300 rounded-xl">
          <div className="flex items-center gap-2 truncate">
            <TruckIcon size={16} className="text-blue-600 shrink-0" />
            <span className="font-bold text-slate-900">
              {selectedTruck.truckNo || (selectedTruck as any).truck_no}
            </span>
            {(selectedTruck.ownerName || (selectedTruck as any).owner_name) && (
              <span className="text-xs text-slate-500 truncate">
                ({selectedTruck.ownerName || (selectedTruck as any).owner_name})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setQuery('');
              setIsOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md ml-2"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            required={required && !value}
            placeholder={placeholder}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full h-11 pl-9 pr-4 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <Search size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
        </div>
      )}

      {isOpen && !selectedTruck && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl py-1 text-sm">
          {filteredTrucks.length === 0 ? (
            <div className="p-3 text-xs text-slate-400 text-center">
              No matching truck found for &quot;{query}&quot;
            </div>
          ) : (
            filteredTrucks.map((t, idx) => {
              const truckId = t.id || (t as any).truck_id || `truck-${idx}`;
              const truckNo = t.truckNo || (t as any).truck_no || 'Unknown';
              const owner = t.ownerName || (t as any).owner_name;
              return (
                <button
                  type="button"
                  key={truckId}
                  onClick={() => {
                    onChange(truckId);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50/70 flex items-center justify-between transition-colors border-b border-slate-50 last:border-0"
                >
                  <span className="font-bold text-slate-900">{truckNo}</span>
                  {owner && <span className="text-xs text-slate-500">{owner}</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

