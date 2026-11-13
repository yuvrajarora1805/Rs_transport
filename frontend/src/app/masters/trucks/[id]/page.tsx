'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '../../../../components/layout/Header';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { StatCard } from '../../../../components/ui/StatCard';
import { apiFetch, formatCurrency, formatDate } from '../../../../lib/api';

function TruckContent() {
  const params = useParams();
  const truckId = params.id as string;
  const [truck, setTruck] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dispatches' | 'trips' | 'fuel'>('trips');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTruck() {
      try {
        const res = await apiFetch<any>(`/masters/trucks/${truckId}`);
        setTruck(res);
      } catch (err) {
        console.warn('Notice while loading truck profile:', err);
      } finally {
        setLoading(false);
      }
    }
    if (truckId) loadTruck();
  }, [truckId]);

  if (!truck) {
    return <div className="p-8 text-xs text-slate-500">Loading vehicle profile...</div>;
  }

  const tripColumns: Column<any>[] = [
    { key: 'trip_no', header: 'Trip No' },
    { key: 'unloading_date', header: 'Unload Date', render: (row) => formatDate(row.unloading_date) },
    { key: 'destination_name', header: 'Location / Destination', render: (row) => row.destination_name || '-' },
    { key: 'party_name', header: 'Party Sent To', render: (row) => row.party_name || '-' },
    { key: 'net_weight', header: 'Weight (MT)', render: (row) => `${Number(row.net_weight).toFixed(2)} MT` },
    { key: 'rate_per_unit', header: 'Rate (₹/MT)', render: (row) => `₹${Number(row.rate_per_unit).toFixed(2)}` },
    {
      key: 'gross_freight',
      header: 'Gross Freight',
      render: (row) => <span className="font-bold">{formatCurrency(Number(row.gross_freight))}</span>,
    },
  ];

  const dispatchColumns: Column<any>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'sr_no', header: 'SR No', render: (row) => row.sr_no || '-' },
    { key: 'source_name', header: 'Booking Source', render: (row) => row.source_name || '-' },
    { key: 'destination', header: 'Dispatched To' },
    { key: 'bales', header: 'Bales' },
  ];

  const fuelColumns: Column<any>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'litres', header: 'Litres', render: (row) => (row.litres ? `${Number(row.litres).toFixed(2)} L` : '-') },
    {
      key: 'amount',
      header: 'Diesel Amount',
      render: (row) => <span className="font-bold text-amber-700">{formatCurrency(Number(row.amount))}</span>,
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title={`Truck ${truck.truck_no}`}
        subtitle={`Owner: ${truck.owner_name || 'Independent'} | Transporter: ${truck.transporter_name || 'Direct'}`}
      />

      <div className="p-8 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Dispatches" value={truck.dispatches?.length || 0} color="slate" />
          <StatCard title="Recorded Trips" value={truck.trips?.length || 0} color="blue" />
          <StatCard title="Fuel Slips" value={truck.fuelRecords?.length || 0} color="amber" />
          <StatCard title="Capacity" value={truck.capacity ? `${truck.capacity} MT` : 'Standard'} color="purple" />
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('trips')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'trips'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trip History ({truck.trips?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('dispatches')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'dispatches'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dispatch History ({truck.dispatches?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'fuel'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Fuel Records ({truck.fuelRecords?.length || 0})
          </button>
        </div>

        {activeTab === 'trips' && (
          <DataTable columns={tripColumns} data={truck.trips || []} emptyMessage="No trips for this truck" />
        )}
        {activeTab === 'dispatches' && (
          <DataTable columns={dispatchColumns} data={truck.dispatches || []} emptyMessage="No dispatches for this truck" />
        )}
        {activeTab === 'fuel' && (
          <DataTable columns={fuelColumns} data={truck.fuelRecords || []} emptyMessage="No fuel transactions recorded" />
        )}
      </div>
    </div>
  );
}

export default function TruckProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading profile...</div>}>
      <TruckContent />
    </Suspense>
  );
}
