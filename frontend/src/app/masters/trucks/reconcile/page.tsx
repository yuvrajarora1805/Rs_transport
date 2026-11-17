'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Header } from '../../../../components/layout/Header';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { StatCard } from '../../../../components/ui/StatCard';
import { Badge } from '../../../../components/ui/Badge';
import { TruckReconcileFilters } from './TruckReconcileFilters';
import { apiFetch, getApiBase } from '../../../../lib/api';
import Link from 'next/link';
import { Upload, ArrowLeft } from 'lucide-react';

export default function TruckReconcilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/masters/trucks/reconcile/summary');
      if (res) setData(res);
    } catch (err) {
      console.warn('Notice while loading reconciliation summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('rs_token') : null;
      const res = await fetch(`${getApiBase()}/masters/trucks/reconcile/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to parse uploaded Excel');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Could not parse Excel workbook'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const trucksList: any[] = (data?.trucks || []).filter((item: any) => {
    if (filterSource !== 'ALL' && item.source !== filterSource) return false;
    if (filterStatus === 'MATCHED' && !item.isRegisteredInSystem) return false;
    if (filterStatus === 'MISSING' && item.isRegisteredInSystem) return false;
    return true;
  });

  const columns: Column<any>[] = [
    {
      key: 'truckNo',
      header: 'Truck No',
      render: (row) => <span className="font-bold text-slate-900 tracking-wide">{row.truckNo}</span>,
    },
    { key: 'source', header: 'Source', render: (row) => row.source },
    { key: 'destination', header: 'Destination', render: (row) => row.destination || '-' },
    { key: 'bales', header: 'Bales', render: (row) => row.bales || '-' },
    { key: 'date', header: 'Date', render: (row) => row.date || '-' },
    { key: 'mobileNo', header: 'Contact', render: (row) => row.mobileNo || '-' },
    {
      key: 'status',
      header: 'Registry Status',
      render: (row) =>
        row.isRegisteredInSystem ? (
          <Badge variant="success">REGISTERED</Badge>
        ) : (
          <Badge variant="danger">MISSING IN DB</Badge>
        ),
    },
    {
      key: 'systemActivity',
      header: 'ERP Records',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.totalSystemDispatches} dispatches • {row.totalSystemTrips} trips
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) =>
        row.systemTruckId ? (
          <Link
            href={`/masters/trucks/${row.systemTruckId}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            View →
          </Link>
        ) : (
          <Link
            href="/masters/trucks/new"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
          >
            + Register
          </Link>
        ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Truck Data Match & Reconciliation"
        subtitle="Upload Excel workbooks (e.g. TRUCK DETAILS (2).xlsx) & compare fleet registers with ERP database"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/masters/trucks"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ArrowLeft size={14} /> Back to Trucks
            </Link>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? 'Analyzing Excel...' : 'Upload Excel File'}
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Excel Rows"
            value={data?.totalRows || 0}
            subtitle={`${data?.totalBales || 0} Cotton Bales`}
            color="blue"
          />
          <StatCard
            title="Distinct Trucks"
            value={data?.distinctTrucks || 0}
            subtitle="Unique vehicles in workbook"
            color="purple"
          />
          <StatCard
            title="Matched in ERP"
            value={data?.matchedInSystem || 0}
            subtitle="Registered in database"
            color="green"
          />
          <StatCard
            title="Missing in ERP"
            value={data?.missingInSystem || 0}
            subtitle="Can be migrated"
            color="red"
          />
        </div>

        <TruckReconcileFilters
          filterSource={filterSource}
          setFilterSource={setFilterSource}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sourcesBreakdown={data?.sourcesBreakdown || []}
          matchedCount={data?.matchedInSystem || 0}
          missingCount={data?.missingInSystem || 0}
          loading={loading}
          onReload={loadSummary}
        />

        <DataTable
          columns={columns}
          data={trucksList}
          searchKey="truckNo"
          searchPlaceholder="Search truck number, source or destination..."
          emptyMessage={loading ? 'Reconciling Excel truck entries...' : 'No matching trucks found'}
        />
      </div>
    </div>
  );
}
