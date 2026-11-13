'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api';

export default function OutstandingPage() {
  const [summary, setSummary] = useState<any>({
    truckOutstanding: [],
    transporterOutstanding: [],
    partyOutstanding: [],
    pumpOutstanding: [],
  });
  const [ageing, setAgeing] = useState<any>({ brackets: {}, allPending: [] });
  const [activeTab, setActiveTab] = useState<'trucks' | 'transporters' | 'ageing'>('trucks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, ageRes] = await Promise.all([
          apiFetch<any>('/outstanding/summary'),
          apiFetch<any>('/outstanding/ageing'),
        ]);
        if (sumRes) setSummary(sumRes);
        if (ageRes) setAgeing(ageRes);
      } catch (err) {
        console.warn('Notice while loading outstanding ledger:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const truckOutstandingList = Array.isArray(summary?.truckOutstanding) ? summary.truckOutstanding : [];
  const ageingList = Array.isArray(ageing?.allPending) ? ageing.allPending : [];

  const totalTruckOutstanding = truckOutstandingList.reduce(
    (acc: number, curr: any) => acc + Number(curr.outstanding_amount || 0),
    0,
  );

  const truckColumns: Column<any>[] = [
    {
      key: 'truck_no',
      header: 'Truck No',
      render: (row) => <span className="font-bold text-slate-900">{row.truck_no}</span>,
    },
    { key: 'owner_name', header: 'Owner (Malik)', render: (row) => row.owner_name || '-' },
    { key: 'pending_settlements', header: 'Pending Trips' },
    {
      key: 'outstanding_amount',
      header: 'Outstanding Balance',
      render: (row) => (
        <span className="font-bold text-rose-600">{formatCurrency(Number(row.outstanding_amount))}</span>
      ),
    },
  ];

  const ageingColumns: Column<any>[] = [
    { key: 'trip_no', header: 'Trip No' },
    { key: 'truck_no', header: 'Truck' },
    { key: 'settlement_date', header: 'Date', render: (row) => formatDate(row.settlement_date) },
    { key: 'days_overdue', header: 'Overdue', render: (row) => `${row.days_overdue} days` },
    {
      key: 'ageing_bracket',
      header: 'Ageing Bracket',
      render: (row) => (
        <Badge variant={row.days_overdue > 30 ? 'danger' : row.days_overdue > 15 ? 'warning' : 'info'}>
          {row.ageing_bracket}
        </Badge>
      ),
    },
    {
      key: 'outstanding',
      header: 'Pending Balance',
      render: (row) => (
        <span className="font-bold text-rose-600">{formatCurrency(Number(row.outstanding))}</span>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Outstanding & Ageing Management"
        subtitle="Unpaid Freight Ledgers, Ageing Brackets & Recoverable Balances"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Outstanding"
            value={formatCurrency(totalTruckOutstanding)}
            subtitle="Freight payables remaining"
            color="red"
          />
          <StatCard
            title="Pending Trucks"
            value={truckOutstandingList.length}
            subtitle="Trucks with balance"
            color="amber"
          />
          <StatCard
            title="60+ Days Overdue"
            value={ageing?.brackets?.['60+ days']?.length || 0}
            subtitle="Long-standing payables"
            color="red"
          />
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('trucks')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'trucks'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Truck-wise Outstanding ({truckOutstandingList.length})
          </button>
          <button
            onClick={() => setActiveTab('ageing')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'ageing'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Ageing Analysis ({ageingList.length})
          </button>
        </div>

        {activeTab === 'trucks' && (
          <DataTable
            columns={truckColumns}
            data={truckOutstandingList}
            searchKey="truck_no"
            searchPlaceholder="Search truck..."
            emptyMessage="No outstanding truck balances"
          />
        )}

        {activeTab === 'ageing' && (
          <DataTable
            columns={ageingColumns}
            data={ageingList}
            searchKey="truck_no"
            searchPlaceholder="Search truck or trip..."
            emptyMessage="No overdue settlements"
          />
        )}
      </div>
    </div>
  );
}
