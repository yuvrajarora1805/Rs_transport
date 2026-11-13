'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api';
import { Payment } from '../../types';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await apiFetch<Payment[]>('/payments');
        setPayments(res || []);
      } catch (err) {
        console.warn('Notice while loading payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const columns: Column<Payment>[] = [
    {
      key: 'paymentDate',
      header: 'Payment Date',
      render: (row) => formatDate(row.paymentDate || (row as any).payment_date),
    },
    {
      key: 'truckNo',
      header: 'Truck No',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900">
            {(row as any).truck_no || row.settlement?.trip?.truck?.truckNo}
          </span>
          <p className="text-[10px] text-slate-400">
            {(row as any).owner_name || row.settlement?.trip?.truck?.ownerName || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      render: (row) => (
        <span className="font-bold text-emerald-600">{formatCurrency(Number(row.amount))}</span>
      ),
    },
    {
      key: 'method',
      header: 'Payment Mode',
      render: (row) => <Badge variant="neutral">{row.method}</Badge>,
    },
    {
      key: 'refNo',
      header: 'UTR / Ref No',
      render: (row) => (row.refNo || (row as any).ref_no ? (
        <span className="font-mono text-xs text-slate-600">{row.refNo || (row as any).ref_no}</span>
      ) : '-'),
    },
    {
      key: 'paidTo',
      header: 'Recipient / Payee',
      render: (row) => row.paidTo || (row as any).paid_to || '-',
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (row) => row.remarks || '-',
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Payment Management"
        subtitle="Freight Disbursement Vouchers, Bank Transfers & UTR Traceability"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={payments}
          searchKey="paidTo"
          searchPlaceholder="Search payee..."
          emptyMessage="No payment records recorded yet"
        />
      </div>
    </div>
  );
}

