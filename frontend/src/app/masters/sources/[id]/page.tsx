'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '../../../../components/layout/Header';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { StatCard } from '../../../../components/ui/StatCard';
import { apiFetch, formatDate } from '../../../../lib/api';
import { useCompany } from '../../../../context/CompanyContext';
import Link from 'next/link';
import { ArrowLeft, Truck } from 'lucide-react';

function SourceContent() {
  const params = useParams();
  const sourceId = params.id as string;
  const { activeCompany } = useCompany();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSource() {
      try {
        setLoading(true);
        const res = await apiFetch<any>(`/masters/sources/${sourceId}?companyCode=${activeCompany.code}`);
        setData(res);
      } catch (err) {
        console.warn('Notice while loading source profile:', err);
      } finally {
        setLoading(false);
      }
    }
    if (sourceId) loadSource();
  }, [sourceId, activeCompany.code]);

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading source details...</div>;
  }

  if (!data) {
    return <div className="p-8 text-sm text-rose-500">Source not found</div>;
  }

  const dispatches: any[] = data.dispatches || [];
  const totalBales = dispatches.reduce((sum, d) => sum + Number(d.bales || 0), 0);

  const dispatchColumns: Column<any>[] = [
    {
      key: 'date',
      header: 'Dispatch Date',
      render: (row) => formatDate(row.date),
    },
    {
      key: 'sr_no',
      header: 'SR / Ref No',
      render: (row) => <span className="font-bold text-blue-600">{row.sr_no || '-'}</span>,
    },
    {
      key: 'truck_no',
      header: 'Truck Dispatched',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Truck size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-900">{row.truck_no}</span>
          {row.owner_name && <span className="text-[10px] text-slate-400">({row.owner_name})</span>}
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination Place',
      render: (row) => row.destination || '-',
    },
    {
      key: 'bales',
      header: 'Bales Loaded',
      render: (row) => <span className="font-semibold">{row.bales || '0'}</span>,
    },
    {
      key: 'remarks',
      header: 'Notes',
      render: (row) => row.remarks || '-',
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title={data.name}
        subtitle={`Booking Agent / Source | Contact: ${data.contact_no || 'None'}`}
        actions={
          <Link
            href="/masters/sources"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sources
          </Link>
        }
      />

      <div className="p-8 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Trucks Dispatched" value={dispatches.length} color="blue" />
          <StatCard title="Total Bales Shipped" value={totalBales} color="purple" />
          <StatCard title="Booking Source" value={data.name} color="slate" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Truck Dispatches Under {data.name}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing which vehicles loaded orders for this booking source
            </span>
          </div>

          <DataTable
            columns={dispatchColumns}
            data={dispatches}
            searchKey="truck_no"
            searchPlaceholder="Search truck dispatched..."
            emptyMessage="No dispatches recorded under this source yet"
          />
        </div>
      </div>
    </div>
  );
}

export default function SourceProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading source profile...</div>}>
      <SourceContent />
    </Suspense>
  );
}

