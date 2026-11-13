'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { apiFetch, formatCurrency } from '../../../lib/api';
import { Pump } from '../../../types';
import Link from 'next/link';

export default function PumpsMasterPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPumps() {
      try {
        const res = await apiFetch<Pump[]>('/masters/pumps');
        setPumps(res || []);
      } catch (err) {
        console.warn('Notice while loading pumps:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPumps();
  }, []);

  const columns: Column<Pump>[] = [
    {
      key: 'name',
      header: 'Petrol Pump Name',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
    },
    { key: 'contactNo', header: 'Contact No', render: (row) => row.contactNo || (row as any).contact_no || '-' },
    {
      key: 'openingBalance',
      header: 'Opening Balance',
      render: (row) => formatCurrency(Number(row.openingBalance || (row as any).opening_balance)),
    },
    {
      key: 'totalFuel',
      header: 'Total Fuel Supplied',
      render: (row) => (
        <span className="text-amber-700 font-medium">
          {formatCurrency(Number((row as any).total_fuel || 0))}
        </span>
      ),
    },
    {
      key: 'totalPaid',
      header: 'Payments to Pump',
      render: (row) => (
        <span className="text-emerald-600 font-medium">
          {formatCurrency(Number((row as any).total_paid || 0))}
        </span>
      ),
    },
    {
      key: 'currentBalance',
      header: 'Closing Outstanding',
      render: (row) => {
        const bal = Number((row as any).current_balance || 0);
        return (
          <span className={`font-bold ${bal > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
            {formatCurrency(bal)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ledger',
      render: (row) => (
        <Link
          href={`/masters/pumps/${row.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Statement →
        </Link>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Petrol Pump Accounts"
        subtitle="14 Pump Ledgers, Fuel Debits & Disbursed Payments"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={pumps}
          searchKey="name"
          searchPlaceholder="Search pump name..."
          emptyMessage="No petrol pumps registered"
        />
      </div>
    </div>
  );
}

