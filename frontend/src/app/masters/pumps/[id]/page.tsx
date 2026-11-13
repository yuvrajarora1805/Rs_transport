'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '../../../../components/layout/Header';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { StatCard } from '../../../../components/ui/StatCard';
import { apiFetch, formatCurrency, formatDate } from '../../../../lib/api';

function PumpContent() {
  const params = useParams();
  const pumpId = params.id as string;
  const [pump, setPump] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPumpDetails() {
      try {
        const res = await apiFetch<any>(`/masters/pumps/${pumpId}`);
        setPump(res);
      } catch (err) {
        console.warn('Notice while loading pump details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (pumpId) loadPumpDetails();
  }, [pumpId]);

  if (!pump) {
    return <div className="p-8 text-xs text-slate-500">Loading pump account statement...</div>;
  }

  const ledgerColumns: Column<any>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'description', header: 'Particulars / Description' },
    {
      key: 'debit',
      header: 'Fuel Debit (₹)',
      render: (row) => (Number(row.debit) > 0 ? (
        <span className="text-amber-700 font-medium">+{formatCurrency(Number(row.debit))}</span>
      ) : '-'),
    },
    {
      key: 'credit',
      header: 'Payment Credit (₹)',
      render: (row) => (Number(row.credit) > 0 ? (
        <span className="text-emerald-700 font-medium">-{formatCurrency(Number(row.credit))}</span>
      ) : '-'),
    },
    {
      key: 'balance',
      header: 'Cumulative Balance',
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(Number(row.balance))}</span>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title={`${pump.name} – Account Statement`}
        subtitle="Double-entry fuel ledger and disbursements reconciliation"
      />

      <div className="p-8 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Opening Balance"
            value={formatCurrency(Number(pump.opening_balance))}
            subtitle="Initial ledger balance"
            color="slate"
          />
          <StatCard
            title="Recent Fuel Slips"
            value={pump.fuelRecords?.length || 0}
            subtitle="Recent truck fuel transactions"
            color="amber"
          />
          <StatCard
            title="Payment Slips"
            value={pump.pumpPayments?.length || 0}
            subtitle="Disbursements issued"
            color="green"
          />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
            Transaction Ledger Entries
          </h3>
          <DataTable
            columns={ledgerColumns}
            data={pump.ledgerEntries || []}
            searchKey="description"
            searchPlaceholder="Search entry..."
            emptyMessage="No ledger entries for this pump"
          />
        </div>
      </div>
    </div>
  );
}

export default function PumpStatementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading statement...</div>}>
      <PumpContent />
    </Suspense>
  );
}
