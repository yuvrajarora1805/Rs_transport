'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { apiFetch } from '../../../lib/api';
import { Destination } from '../../../types';
import Link from 'next/link';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await apiFetch<Destination[]>('/masters/destinations');
        setDestinations(res || []);
      } catch (err) {
        console.warn('Notice while loading destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, []);

  const columns: Column<Destination>[] = [
    {
      key: 'name',
      header: 'Destination Place',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
    },
    { key: 'state', header: 'State / Zone', render: (row) => row.state || 'Rajasthan' },
    {
      key: 'parties',
      header: 'Linked Parties',
      render: (row) => (
        <span className="font-semibold text-slate-700">{Number((row as any).party_count || 0)} parties</span>
      ),
    },
    {
      key: 'trip_count',
      header: 'Trips Received',
      render: (row) => (
        <span className="font-semibold text-blue-600">{Number((row as any).trip_count || 0)} trips</span>
      ),
    },
    {
      key: 'actions',
      header: 'Directory',
      render: (row) => (
        <Link
          href={`/masters/destinations/${row.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Parties & Trucks →
        </Link>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Destinations Master"
        subtitle="6 Destination Stations (Bhadra, Jasrasar, Chattargarh, Sardarshahar, etc.)"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={destinations}
          searchKey="name"
          searchPlaceholder="Search destination..."
          emptyMessage="No destinations registered"
        />
      </div>
    </div>
  );
}

