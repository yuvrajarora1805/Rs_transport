'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { apiFetch, formatCurrency, formatDate } from '../../../lib/api';
import { Party } from '../../../types';
import Link from 'next/link';
import { Filter, Users, DollarSign, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function PartiesPage() {
  const [parties, setParties] = useState<any[]>([]);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'directory' | 'pending'>('directory');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pRes, pendingRes] = await Promise.all([
        apiFetch<any[]>('/masters/parties'),
        apiFetch<any[]>(`/masters/parties/pending-payments${selectedPartyId !== 'ALL' ? `?partyId=${selectedPartyId}` : ''}`),
      ]);
      setParties(pRes || []);
      setPendingList(pendingRes || []);
    } catch (err) {
      console.warn('Notice while loading parties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPartyId]);

  const totalOutstanding = pendingList.reduce((sum, item) => sum + Number(item.outstanding || 0), 0);
  const totalGross = pendingList.reduce((sum, item) => sum + Number(item.gross_freight || 0), 0);

  const directoryColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'Party / Client Name',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
    },
    {
      key: 'destination',
      header: 'Linked Destination',
      render: (row) => row.destination_name || <span className="text-slate-400">All Locations</span>,
    },
    { key: 'contactNo', header: 'Contact No', render: (row) => row.contact_no || '-' },
    {
      key: 'trip_count',
      header: 'Trips Received',
      render: (row) => <span className="font-semibold text-blue-600">{Number(row.trip_count || 0)} trips</span>,
    },
    {
      key: 'total_outstanding',
      header: 'Pending Balance',
      render: (row) => {
        const out = Number(row.total_outstanding || 0);
        return <span className={`font-bold ${out > 0 ? 'text-rose-600' : 'text-slate-500'}`}>{formatCurrency(out)}</span>;
      },
    },
    {
      key: 'actions',
      header: 'History',
      render: (row) => (
        <Link
          href={`/masters/parties/${row.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          View Trips <ArrowUpRight size={12} />
        </Link>
      ),
    },
  ];

  const pendingColumns: Column<any>[] = [
    {
      key: 'party_name',
      header: 'Party',
      render: (row) => <span className="font-bold text-slate-900">{row.party_name}</span>,
    },
    {
      key: 'trip_no',
      header: 'Trip / SR No',
      render: (row) => <span className="font-medium text-blue-600">{row.trip_no}</span>,
    },
    {
      key: 'truck_no',
      header: 'Truck Sent',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.truck_no}</div>
          {row.owner_name && <div className="text-[10px] text-slate-400">{row.owner_name}</div>}
        </div>
      ),
    },
    { key: 'destination_name', header: 'Destination', render: (row) => row.destination_name || '-' },
    {
      key: 'gross_freight',
      header: 'Gross Freight',
      render: (row) => formatCurrency(Number(row.gross_freight)),
    },
    {
      key: 'diesel_amount',
      header: 'Diesel (₹)',
      render: (row) => formatCurrency(Number(row.diesel_amount)),
    },
    {
      key: 'total_paid',
      header: 'Paid Amount',
      render: (row) => formatCurrency(Number(row.total_paid)),
    },
    {
      key: 'outstanding',
      header: 'Pending Balance',
      render: (row) => {
        const out = Number(row.outstanding || 0);
        return (
          <span className={`font-bold ${out > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatCurrency(out)}
          </span>
        );
      },
    },
    {
      key: 'settlement_status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.settlement_status === 'PAID' ? 'success' : row.settlement_status === 'APPROVED' ? 'warning' : 'neutral'}>
          {row.settlement_status || 'PENDING'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Parties Master & Reconciliation"
        subtitle="Business Parties, Freight Ledger & Pending Payment Analysis"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Registered Parties" value={parties.length} color="blue" />
          <StatCard title="Total Party Freight" value={formatCurrency(totalGross)} color="purple" />
          <StatCard title="Pending Party Receivables" value={formatCurrency(totalOutstanding)} color="red" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('directory')}
              className={`pb-2.5 transition-colors ${
                activeTab === 'directory'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Parties Directory ({parties.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-2.5 transition-colors ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Party-Wise Pending Payments ({pendingList.length})
            </button>
          </div>

          {activeTab === 'pending' && (
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Parties Filter</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTab === 'directory' && (
          <DataTable
            columns={directoryColumns}
            data={parties}
            searchKey="name"
            searchPlaceholder="Search party..."
            emptyMessage="No parties registered"
          />
        )}

        {activeTab === 'pending' && (
          <DataTable
            columns={pendingColumns}
            data={pendingList}
            searchKey="party_name"
            searchPlaceholder="Search by party or truck..."
            emptyMessage="No pending payment records found for selected party"
          />
        )}
      </div>
    </div>
  );
}
