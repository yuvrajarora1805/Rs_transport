'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '../../../../components/layout/Header';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { StatCard } from '../../../../components/ui/StatCard';
import { apiFetch, formatCurrency, formatDate } from '../../../../lib/api';
import Link from 'next/link';
import { ArrowLeft, MapPin, Truck, Users } from 'lucide-react';

function DestinationContent() {
  const params = useParams();
  const destId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'parties' | 'trips'>('parties');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDest() {
      try {
        const res = await apiFetch<any>(`/masters/destinations/${destId}`);
        setData(res);
      } catch (err) {
        console.warn('Notice while loading destination details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (destId) loadDest();
  }, [destId]);

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading destination details...</div>;
  }

  if (!data) {
    return <div className="p-8 text-sm text-rose-500">Destination not found</div>;
  }

  const parties: any[] = data.parties || [];
  const trips: any[] = data.trips || [];

  const partyColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'Party / Client Name',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
    },
    { key: 'contact_no', header: 'Contact No', render: (row) => row.contact_no || '-' },
    {
      key: 'actions',
      header: 'Profile',
      render: (row) => (
        <Link
          href={`/masters/parties/${row.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Party Register →
        </Link>
      ),
    },
  ];

  const tripColumns: Column<any>[] = [
    {
      key: 'trip_no',
      header: 'Trip / SR No',
      render: (row) => <span className="font-bold text-blue-600">{row.trip_no}</span>,
    },
    {
      key: 'unloading_date',
      header: 'Unload Date',
      render: (row) => formatDate(row.unloading_date),
    },
    {
      key: 'truck_no',
      header: 'Truck Arrived',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Truck size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-900">{row.truck_no}</span>
          {row.owner_name && <span className="text-[10px] text-slate-400">({row.owner_name})</span>}
        </div>
      ),
    },
    {
      key: 'party_name',
      header: 'Party Delivered To',
      render: (row) => row.party_name || '-',
    },
    {
      key: 'net_weight',
      header: 'Weight (MT)',
      render: (row) => `${Number(row.net_weight).toFixed(2)} MT`,
    },
    {
      key: 'gross_freight',
      header: 'Gross Freight',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(Number(row.gross_freight))}
        </span>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title={data.name}
        subtitle={`Destination Station | State: ${data.state || 'Rajasthan'}`}
        actions={
          <Link
            href="/masters/destinations"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Destinations
          </Link>
        }
      />

      <div className="p-8 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Linked Parties" value={parties.length} color="purple" />
          <StatCard title="Recorded Unload Trips" value={trips.length} color="blue" />
          <StatCard title="State / Zone" value={data.state || 'Rajasthan'} color="slate" />
        </div>

        {/* Tab Switch */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('parties')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'parties'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Parties Located Here ({parties.length})
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'trips'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trucks & Trips History ({trips.length})
          </button>
        </div>

        {activeTab === 'parties' && (
          <DataTable
            columns={partyColumns}
            data={parties}
            searchKey="name"
            searchPlaceholder="Search party at this location..."
            emptyMessage="No parties linked to this destination yet"
          />
        )}

        {activeTab === 'trips' && (
          <DataTable
            columns={tripColumns}
            data={trips}
            searchKey="truck_no"
            searchPlaceholder="Search truck arrived at this destination..."
            emptyMessage="No trips recorded for this destination yet"
          />
        )}
      </div>
    </div>
  );
}

export default function DestinationProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading destination...</div>}>
      <DestinationContent />
    </Suspense>
  );
}

