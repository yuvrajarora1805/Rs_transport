'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { apiFetch, formatDate } from '../../lib/api';
import { Dispatch, Source } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { PlusCircle, Filter, Send, Navigation, Truck, Building2, ArrowUpRight, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import Link from 'next/link';

export default function DispatchesPage() {
  const { activeCompany } = useCompany();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Dispatch | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalBales = dispatches.reduce((acc, d) => acc + (Number(d.bales) || 0), 0);
  const uniqueTrucks = new Set(dispatches.map((d) => d.truckId || (d as any).truck_id).filter(Boolean)).size;
  const uniqueSources = new Set(dispatches.map((d) => d.sourceId || (d as any).source_id).filter(Boolean)).size;

  const loadData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedSource) queryParams.set('sourceId', selectedSource);
      if (activeCompany.code) queryParams.set('companyCode', activeCompany.code);

      const [dispRes, srcRes] = await Promise.all([
        apiFetch<Dispatch[]>(`/dispatches?${queryParams.toString()}`),
        apiFetch<Source[]>('/masters/sources'),
      ]);
      setDispatches(dispRes || []);
      setSources(srcRes || []);
    } catch (err) {
      console.warn('Notice while loading dispatches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSource, activeCompany.code]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/dispatches/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete dispatch');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Dispatch>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'srNo', header: 'SR No', render: (row) => row.srNo || (row as any).sr_no || '-' },
    {
      key: 'truckNo', header: 'Truck No',
      render: (row) => {
        const tId = row.truckId || (row as any).truck_id;
        const tNo = row.truck?.truckNo || (row as any).truck_no || '-';
        return tId ? <Link href={`/masters/trucks/${tId}`} className="font-bold text-blue-600 hover:underline">{tNo}</Link> : <span className="font-semibold text-slate-900">{tNo}</span>;
      },
    },
    {
      key: 'source', header: 'Source',
      render: (row) => {
        const sId = row.sourceId || (row as any).source_id;
        const sName = row.source?.name || (row as any).source_name || '-';
        return sId ? <Link href={`/masters/sources/${sId}`} className="font-medium text-slate-800 hover:text-blue-600 hover:underline">{sName}</Link> : sName;
      },
    },
    { key: 'destination', header: 'Destination' },
    { key: 'bales', header: 'Bales' },
    { key: 'mobileNo', header: 'Driver / Mobile', render: (row) => (row as any).mobile_no || row.truck?.mobileNo || '-' },
    {
      key: 'status', header: 'Loading & Weighing',
      render: (row) => {
        const tripId = (row as any).trip_id;
        const tripNo = (row as any).trip_no;
        const netWeight = (row as any).loaded_weight;
        if (tripId) {
          return (
            <div className="flex flex-col items-start gap-0.5">
              <Badge variant="success">✓ Loaded</Badge>
              <Link href="/trips" className="text-[11px] font-bold text-blue-600 hover:underline">
                Trip #{tripNo} {netWeight ? `(${Number(netWeight).toFixed(2)} MT)` : ''}
              </Link>
            </div>
          );
        }
        return (
          <Link
            href={`/trips/new?dispatchId=${row.id}&truckId=${row.truckId || (row as any).truck_id || ''}&srNo=${encodeURIComponent(row.srNo || (row as any).sr_no || '')}&destination=${encodeURIComponent(row.destination || '')}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
          >
            + Record Loading →
          </Link>
        );
      },
    },
    {
      key: 'actions', header: 'Action',
      render: (row) => (
        <button type="button" onClick={() => setDeleteTarget(row)} className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Dispatch">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Dispatch Management"
        subtitle="Source-wise Truck Bookings & Register"
        actions={
          <Link
            href="/dispatches/new"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle size={18} /> New Dispatch
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        {/* Navigation / Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Dispatches</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{dispatches.length}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{totalBales.toLocaleString()} total bales</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Send size={22} />
            </div>
          </div>

          <Link
            href="/masters/trucks"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Trucks Active
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{uniqueTrucks}</h3>
              <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                View Truck Master <ArrowUpRight size={13} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 flex items-center justify-center transition-colors">
              <Truck size={22} />
            </div>
          </Link>

          <Link
            href="/masters/sources"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Booking Sources
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{uniqueSources || sources.length}</h3>
              <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                View Sources Master <ArrowUpRight size={13} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 flex items-center justify-center transition-colors">
              <Building2 size={22} />
            </div>
          </Link>

          <Link
            href="/trips"
            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Trips & Freight
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Trips Register</h3>
              <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                Go to Weighbridge <ArrowUpRight size={13} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 flex items-center justify-center transition-colors">
              <Navigation size={22} />
            </div>
          </Link>
        </div>

        {/* Source Filter Bar */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <Filter size={18} className="text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Filter by Source:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Booking Sources (6 Agents)</option>
            {sources.map((src) => (
              <option key={src.id} value={src.id}>
                {src.name}
              </option>
            ))}
          </select>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={dispatches}
          dateKey="date"
          searchKey="destination"
          searchPlaceholder="Search destination..."
          emptyMessage="No dispatches found for this source"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Dispatch Entry"
        message="Are you sure you want to delete this dispatch entry? This will permanently remove the record from dispatch registers."
        itemName={deleteTarget ? `${deleteTarget.truck?.truckNo || (deleteTarget as any).truck_no || 'Truck'} • SR #${deleteTarget.srNo || (deleteTarget as any).sr_no || 'N/A'}` : undefined}
      />
    </div>
  );
}

