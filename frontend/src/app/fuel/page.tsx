'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api';
import { PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function FuelPage() {
  const [fuelRecords, setFuelRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadFuel = async () => {
    try {
      const res = await apiFetch<any[]>('/fuel');
      setFuelRecords(res || []);
    } catch (err) {
      console.warn('Notice while loading fuel records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFuel();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/fuel/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadFuel();
    } catch (err: any) {
      alert(err.message || 'Failed to delete fuel record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<any>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'truckNo',
      header: 'Truck No',
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.truck_no || row.truck?.truckNo}</span>
      ),
    },
    { key: 'pumpName', header: 'Petrol Pump', render: (row) => row.pump_name || row.pump?.name },
    { key: 'tripNo', header: 'Trip Ref', render: (row) => row.trip_no || row.trip?.tripNo || 'Unallocated' },
    { key: 'litres', header: 'Litres', render: (row) => (row.litres ? `${Number(row.litres).toFixed(2)} L` : '-') },
    { key: 'rate', header: 'Rate (₹/L)', render: (row) => (row.rate ? `₹${Number(row.rate).toFixed(2)}` : '-') },
    {
      key: 'amount',
      header: 'Total Fuel Amount',
      render: (row) => (
        <span className="font-bold text-amber-700">{formatCurrency(Number(row.amount))}</span>
      ),
    },
    {
      key: 'receipt',
      header: 'Receipt',
      render: (row) => (
        row.slip_image ? (
          <button
            type="button"
            onClick={() => setPreviewImage(row.slip_image)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ImageIcon size={13} /> View Slip
          </button>
        ) : (
          <span className="text-xs text-slate-400">No Slip</span>
        )
      ),
    },
    {
      key: 'isAdjusted',
      header: 'Settlement Status',
      render: (row) => (
        <Badge variant={row.is_adjusted ? 'success' : 'warning'}>
          {row.is_adjusted ? 'DEDUCTED' : 'PENDING'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => setDeleteTarget(row)}
          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          title="Delete Fuel Entry"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Fuel & Diesel Transactions"
        subtitle="Truck-wise Diesel Slips, Pump Accounting & Ledger Debits"
        actions={
          <Link
            href="/fuel/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle size={14} /> Add Diesel Entry
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={fuelRecords}
          searchKey="truck_no"
          searchPlaceholder="Search truck number..."
          emptyMessage="No fuel transactions recorded yet"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Fuel Entry"
        message="Are you sure you want to delete this diesel slip record? This action will remove the debit from the pump statement."
        itemName={deleteTarget ? `${deleteTarget.truck_no || 'Truck'} • ${formatCurrency(Number(deleteTarget.amount))} (${deleteTarget.pump_name || 'Pump'})` : undefined}
      />

      {/* Receipt Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon size={16} className="text-blue-600" /> Fuel Slip Receipt Preview
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
                alt="Fuel Slip"
                className="max-h-[70vh] rounded-xl object-contain border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

