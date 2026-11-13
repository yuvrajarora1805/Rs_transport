'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { apiFetch } from '../../../lib/api';
import { Party } from '../../../types';
import Link from 'next/link';

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParties() {
      try {
        const res = await apiFetch<Party[]>('/masters/parties');
        setParties(res || []);
      } catch (err) {
        console.warn('Notice while loading parties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadParties();
  }, []);

  const columns: Column<Party>[] = [
    {
      key: 'name',
      header: 'Party / Client Name',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
    },
    {
      key: 'destination',
      header: 'Linked Destination',
      render: (row) => (row as any).destination_name || row.destination?.name || <span className="text-slate-400">All Locations</span>,
    },
    { key: 'contactNo', header: 'Contact No', render: (row) => row.contactNo || (row as any).contact_no || '-' },
    {
      key: 'trip_count',
      header: 'Trips Received',
      render: (row) => (
        <span className="font-semibold text-blue-600">{Number((row as any).trip_count || 0)} trips</span>
      ),
    },
    {
      key: 'actions',
      header: 'History',
      render: (row) => (
        <Link
          href={`/masters/parties/${row.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Trips & Trucks →
        </Link>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Parties Master"
        subtitle="Business Parties, Consignees & Clients Directory"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={parties}
          searchKey="name"
          searchPlaceholder="Search party..."
          emptyMessage="No parties registered"
        />
      </div>
    </div>
  );
}

