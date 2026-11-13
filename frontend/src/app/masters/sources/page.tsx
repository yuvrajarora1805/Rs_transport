'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { apiFetch } from '../../../lib/api';
import { Source } from '../../../types';
import { useCompany } from '../../../context/CompanyContext';
import Link from 'next/link';

export default function SourcesPage() {
  const { activeCompany } = useCompany();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSources() {
      try {
        setLoading(true);
        const res = await apiFetch<Source[]>(`/masters/sources?companyCode=${activeCompany.code}`);
        setSources(res || []);
      } catch (err) {
        console.warn('Notice while loading sources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSources();
  }, [activeCompany.code]);

  const columns: Column<Source>[] = [
    {
      key: 'name',
      header: 'Booking Source Name',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
    },
    { key: 'contactNo', header: 'Contact No', render: (row) => row.contactNo || (row as any).contact_no || '-' },
    {
      key: 'dispatch_count',
      header: 'Total Dispatches',
      render: (row) => (
        <span className="font-semibold text-blue-600">{Number((row as any).dispatch_count || 0)} dispatches</span>
      ),
    },
    {
      key: 'actions',
      header: 'History',
      render: (row) => (
        <Link
          href={`/masters/sources/${row.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Dispatched Trucks →
        </Link>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Booking Sources Master"
        subtitle="6 Reference Sources (Bittu Brar, Happy Sarpanch, DSBC, etc.)"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={sources}
          searchKey="name"
          searchPlaceholder="Search booking source..."
          emptyMessage="No sources found"
        />
      </div>
    </div>
  );
}

