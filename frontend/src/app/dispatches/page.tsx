'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../../components/layout/Header';
import { DataTable, Column } from '../../components/ui/DataTable';
import { apiFetch, formatDate } from '../../lib/api';
import { Dispatch, Source } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { PlusCircle, Filter, Send, Navigation, Truck, Building2, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { groupDispatchesByOrder, GroupedDispatchOrder } from '../../components/dispatches/dispatchGrouping';
import { DispatchFleetRow } from '../../components/dispatches/DispatchFleetRow';
import Link from 'next/link';

export default function DispatchesPage() {
  const { activeCompany } = useCompany();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Dispatch | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const groupedOrders = useMemo(() => groupDispatchesByOrder(dispatches), [dispatches]);

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

  const columns: Column<GroupedDispatchOrder>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'srNo', header: 'SR / Ref',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.srNo || '-'}</span>
          {row.trucks.length > 1 && (
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-black bg-blue-100 text-blue-700 rounded-md">
              {row.trucks.length} Trucks
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'material', header: 'Commodity',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
          {row.material || 'Cotton Bales'}
        </span>
      ),
    },
    {
      key: 'destination', header: 'Source & Destination',
      render: (row) => (
        <div className="text-xs">
          <div className="font-bold text-slate-900">{row.sourceName}</div>
          <div className="text-slate-500 font-medium">→ {row.destination || 'Unassigned'}</div>
        </div>
      ),
    },
    {
      key: 'trucks', header: 'Assigned Fleet & Dharamkanta Loading',
      render: (row) => (
        <div className="space-y-1.5 py-1 min-w-[320px]">
          {row.trucks.map((t, idx) => (
            <DispatchFleetRow
              key={t.id}
              truck={t}
              order={row}
              index={idx}
              isMulti={row.trucks.length > 1}
              onPreviewSlip={(url) => setPreviewImage(url)}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'totalBales', header: 'Total Qty',
      render: (row) => {
        const unit = row.material?.toLowerCase().includes('rice') ? 'Bags' : 'Bales';
        return <span className="font-bold text-slate-900 text-xs">{row.totalBales} {unit}</span>;
      },
    },
    {
      key: 'actions', header: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => setDeleteTarget(row.trucks[0]?.raw || null)}
          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          title="Delete Dispatch Entry"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Dispatch Management"
        subtitle="Source-wise Truck Bookings & Grouped Fleet Register"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Orders', val: groupedOrders.length, sub: `${totalBales.toLocaleString()} total units`, icon: <Send size={22} className="text-blue-600" /> },
            { label: 'Fleet Active', val: uniqueTrucks, sub: 'View Truck Master →', href: '/masters/trucks', icon: <Truck size={22} className="text-emerald-600" /> },
            { label: 'Booking Sources', val: uniqueSources || sources.length, sub: 'View Sources Master →', href: '/masters/sources', icon: <Building2 size={22} className="text-purple-600" /> },
            { label: 'Trips & Freight', val: 'Weighbridge', sub: 'Go to Trips Register →', href: '/trips', icon: <Navigation size={22} className="text-amber-600" /> },
          ].map((c, i) => {
            const inner = (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-blue-400 transition-all h-full">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{c.val}</h3>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">{c.sub}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {c.icon}
                </div>
              </div>
            );
            return c.href ? <Link key={i} href={c.href} className="group">{inner}</Link> : <div key={i}>{inner}</div>;
          })}
        </div>

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
              <option key={src.id} value={src.id}>{src.name}</option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={groupedOrders}
          dateKey="date"
          searchKey="destination"
          searchPlaceholder="Search destination or source..."
          emptyMessage="No dispatches found"
        />
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Dispatch Entry"
        message="Are you sure you want to delete this dispatch entry? This will permanently remove the record from dispatch registers."
        itemName={deleteTarget ? `${deleteTarget.truck?.truckNo || (deleteTarget as any).truck_no || 'Truck'} • SR #${deleteTarget.srNo || (deleteTarget as any).sr_no || 'N/A'}` : undefined}
      />

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70" onClick={() => setPreviewImage(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">Dispatch Slip Preview</span>
              <button onClick={() => setPreviewImage(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">✕</button>
            </div>
            <div className="p-3 flex justify-center">
              <img src={previewImage} alt="Dispatch Slip" className="max-h-[65vh] rounded-xl object-contain border border-slate-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
