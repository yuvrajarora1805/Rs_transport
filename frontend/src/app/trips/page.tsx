'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api';
import { Trip } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { PlusCircle, Fuel, Trash2, Image as ImageIcon } from 'lucide-react';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import Link from 'next/link';

export default function TripsPage() {
  const { activeCompany } = useCompany();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<Trip[]>(`/trips?companyCode=${activeCompany.code}`);
      setTrips(res || []);
    } catch (err) {
      console.warn('Notice while loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [activeCompany.code]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/trips/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadTrips();
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Trip>[] = [
    { key: 'tripNo', header: 'Trip / SR No', render: (row) => <span className="font-semibold text-blue-600">{row.tripNo || (row as any).trip_no}</span> },
    { key: 'unloadingDate', header: 'Unload Date', render: (row) => formatDate(row.unloadingDate || (row as any).unloading_date) },
    {
      key: 'truckNo', header: 'Truck No',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900">{row.truck?.truckNo || (row as any).truck_no}</span>
          <p className="text-[10px] text-slate-400">{row.truck?.ownerName || (row as any).owner_name || 'No Owner'}</p>
        </div>
      ),
    },
    { key: 'destination', header: 'Destination', render: (row) => row.destination?.name || (row as any).destination_name || '-' },
    {
      key: 'party', header: 'Party / Transporter',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.party?.name || (row as any).party_name || '-'}</span>
          <p className="text-[10px] text-blue-700 font-bold">{(row as any).transporter_name || row.transporter?.name || (row as any).company_code || 'RS Transport'}</p>
        </div>
      ),
    },
    { key: 'netWeight', header: 'Weight (MT)', render: (row) => `${Number(row.netWeight || (row as any).net_weight).toFixed(2)} MT` },
    { key: 'ratePerUnit', header: 'Rate (₹/MT)', render: (row) => `₹${Number(row.ratePerUnit || (row as any).rate_per_unit).toFixed(2)}` },
    { key: 'grossFreight', header: 'Gross Freight', render: (row) => <span className="font-semibold text-slate-900">{formatCurrency(Number(row.grossFreight || (row as any).gross_freight))}</span> },
    {
      key: 'diesel',
      header: 'Attached Diesel',
      render: (row) => {
        const dieselAmt = Number(row.total_diesel || (row as any).total_diesel || 0);
        const fuelCount = Number(row.fuel_count || (row as any).fuel_count || 0);
        const truckId = row.truckId || (row as any).truck_id || row.truck?.id;

        return (
          <div className="flex flex-col gap-1 items-start">
            {dieselAmt > 0 ? (
              <span className="font-semibold text-rose-600">
                {formatCurrency(dieselAmt)}
                {fuelCount > 1 && <span className="text-[10px] text-slate-500 font-normal ml-1">({fuelCount} slips)</span>}
              </span>
            ) : (
              <span className="text-xs text-slate-400">None</span>
            )}
            <Link
              href={`/fuel/new?tripId=${row.id}&truckId=${truckId || ''}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              <Fuel size={12} /> {dieselAmt > 0 ? '+ More Fuel' : '+ Add Fuel'}
            </Link>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Settlement',
      render: (row) => {
        const hasSettlement = (row as any).settlement_id || row.settlement?.id;
        const status = (row as any).settlement_status || row.settlement?.status;

        if (status === 'PAID') {
          return <Badge variant="success">PAID</Badge>;
        }
        if (status === 'PARTIALLY_PAID') {
          return <Badge variant="warning">PARTIAL</Badge>;
        }
        if (hasSettlement) {
          return <Badge variant="info">SETTLED</Badge>;
        }
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/settlements/new?tripId=${row.id}`}
              className="text-xs font-semibold text-amber-600 hover:text-amber-800 hover:underline"
            >
              Create Settlement →
            </Link>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <div className="flex items-center gap-2">
          {(row as any).slip_image && (
            <button
              type="button"
              onClick={() => setPreviewImage((row as any).slip_image)}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Weighbridge Slip"
            >
              <ImageIcon size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Trip"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Trip & Weighbridge Register"
        subtitle="Unloading Weights, Freight Calculation & Destination Records"
        actions={
          <Link
            href="/trips/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle size={14} /> New Trip Entry
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={trips}
          dateKey="unloadingDate"
          searchKey="tripNo"
          searchPlaceholder="Search trip number..."
          emptyMessage="No trips registered yet"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Trip Entry"
        message="Are you sure you want to delete this trip weighbridge record? Linked settlements and advances will also be cleared."
        itemName={deleteTarget ? `${deleteTarget.truck?.truckNo || (deleteTarget as any).truck_no || 'Truck'} • Trip #${deleteTarget.tripNo || (deleteTarget as any).trip_no}` : undefined}
      />

      {/* Weighbridge Slip Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon size={16} className="text-blue-600" /> Weighbridge Slip Preview
              </h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center">
              <img
                src={previewImage}
                alt="Weighbridge Slip"
                className="max-h-[70vh] rounded-xl object-contain border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

