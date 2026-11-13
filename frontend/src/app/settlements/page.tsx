'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { apiFetch, formatCurrency } from '../../lib/api';
import { Settlement } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { Trash2, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

export default function SettlementsPage() {
  const { activeCompany } = useCompany();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Settlement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<Settlement[]>(`/settlements?companyCode=${activeCompany.code}`);
      setSettlements(res || []);
    } catch (err) {
      console.warn('Notice while loading settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettlements(); }, [activeCompany.code]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/settlements/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadSettlements();
    } catch (err: any) {
      alert(err.message || 'Failed to delete settlement');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Settlement>[] = [
    { key: 'tripNo', header: 'Trip No', render: (row) => <span className="font-semibold text-blue-600">{row.trip?.tripNo || (row as any).trip_no}</span> },
    { key: 'truckNo', header: 'Truck No', render: (row) => row.trip?.truck?.truckNo || (row as any).truck_no },
    { key: 'destination', header: 'Destination', render: (row) => row.trip?.destination?.name || (row as any).destination_name || '-' },
    { key: 'grossFreight', header: 'Gross Freight', render: (row) => formatCurrency(Number(row.grossFreight || (row as any).gross_freight)) },
    { key: 'dieselAmount', header: 'Diesel (₹)', render: (row) => <span className="text-amber-600 font-medium">{formatCurrency(Number(row.dieselAmount || (row as any).diesel_amount))}</span> },
    { key: 'netPayable', header: 'Net Payable', render: (row) => <span className="font-bold text-slate-900">{formatCurrency(Number(row.netPayable || (row as any).net_payable))}</span> },
    { key: 'totalPaid', header: 'Paid (₹)', render: (row) => <span className="text-emerald-600 font-medium">{formatCurrency(Number(row.totalPaid || (row as any).total_paid))}</span> },
    {
      key: 'outstanding', header: 'Outstanding (₹)',
      render: (row) => {
        const out = Number(row.outstanding || (row as any).outstanding);
        if (out < 0) {
          return <span className="font-bold text-amber-600">- {formatCurrency(Math.abs(out))}</span>;
        }
        return <span className={`font-bold ${out > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{formatCurrency(out)}</span>;
      },
    },
    {
      key: 'status', header: 'Status',
      render: (row) => {
        const s = row.status || (row as any).status;
        const out = Number(row.outstanding || (row as any).outstanding);
        if (s === 'PAID') return <Badge variant="success">PAID</Badge>;
        if (s === 'PARTIALLY_PAID') return <Badge variant="warning">PARTIAL</Badge>;
        if (s === 'OVERDRAWN' || out < 0) return <Badge variant="warning">EXCESS DIESEL</Badge>;
        return <Badge variant="danger">PENDING</Badge>;
      },
    },
    {
      key: 'actions', header: 'Action',
      render: (row) => {
        const out = Number(row.outstanding || (row as any).outstanding);
        const slip = (row as any).slip_image;
        return (
          <div className="flex items-center gap-2">
            {slip && (
              <button type="button" onClick={() => setPreviewImage(slip)} title="View Voucher / Slip"
                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                <ImageIcon size={15} />
              </button>
            )}
            {out > 0 ? (
              <Link href={`/payments/new?settlementId=${row.id}&outstanding=${out}`} className="text-xs font-semibold text-emerald-600 hover:underline">
                Record Payment →
              </Link>
            ) : out < 0 ? (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                Recoverable
              </span>
            ) : (<span className="text-xs text-slate-400">Completed</span>)}
            <button type="button" onClick={() => setDeleteTarget(row)} className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Settlement">
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="pb-12">
      <Header title="Settlement Management" subtitle="Freight Deductions (Advance, Diesel, Commission) & Net Balance" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable columns={columns} data={settlements} dateKey="settlementDate" searchKey="tripNo" searchPlaceholder="Search trip or truck..." emptyMessage="No settlement records created yet" />
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading}
        title="Delete Settlement Entry" message="Are you sure you want to delete this settlement? Any linked payment records will also be removed."
        itemName={deleteTarget ? `Trip #${deleteTarget.trip?.tripNo || (deleteTarget as any).trip_no || ''} • Net: ${formatCurrency(Number(deleteTarget.netPayable || (deleteTarget as any).net_payable))}` : undefined}
      />

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="font-bold text-sm text-slate-900">Settlement Voucher / Slip Photo</h4>
              <button onClick={() => setPreviewImage(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex justify-center bg-slate-100 rounded-xl p-2">
              <img src={previewImage} alt="Settlement Slip" className="max-w-full h-auto rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
