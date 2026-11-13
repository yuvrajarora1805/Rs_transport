'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '../../../../components/layout/Header';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { StatCard } from '../../../../components/ui/StatCard';
import { Badge } from '../../../../components/ui/Badge';
import { apiFetch, formatCurrency, formatDate } from '../../../../lib/api';
import Link from 'next/link';
import { ArrowLeft, MapPin, Truck } from 'lucide-react';

function PartyContent() {
  const params = useParams();
  const partyId = params.id as string;
  const [party, setParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParty() {
      try {
        const res = await apiFetch<any>(`/masters/parties/${partyId}`);
        setParty(res);
      } catch (err) {
        console.warn('Notice while loading party profile:', err);
      } finally {
        setLoading(false);
      }
    }
    if (partyId) loadParty();
  }, [partyId]);

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading party ledger...</div>;
  }

  if (!party) {
    return <div className="p-8 text-sm text-rose-500">Party not found</div>;
  }

  const trips: any[] = party.trips || [];
  const totalWeight = trips.reduce((sum, t) => sum + Number(t.net_weight || 0), 0);
  const totalFreight = trips.reduce((sum, t) => sum + Number(t.gross_freight || 0), 0);

  const tripColumns: Column<any>[] = [
    {
      key: 'trip_no',
      header: 'Trip / SR No',
      render: (row) => <span className="font-bold text-blue-600">{row.trip_no}</span>,
    },
    {
      key: 'unloading_date',
      header: 'Unload Date',
      render: (row) => formatDate(row.unloading_date),
    },
    {
      key: 'truck_no',
      header: 'Truck Sent',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Truck size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-900">{row.truck_no}</span>
          {row.owner_name && <span className="text-[10px] text-slate-400">({row.owner_name})</span>}
        </div>
      ),
    },
    {
      key: 'destination_name',
      header: 'Unload Location',
      render: (row) => row.destination_name || '-',
    },
    {
      key: 'net_weight',
      header: 'Delivered MT',
      render: (row) => `${Number(row.net_weight).toFixed(2)} MT`,
    },
    {
      key: 'rate_per_unit',
      header: 'Rate (₹/MT)',
      render: (row) => `₹${Number(row.rate_per_unit).toFixed(2)}`,
    },
    {
      key: 'gross_freight',
      header: 'Gross Freight',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(Number(row.gross_freight))}
        </span>
      ),
    },
    {
      key: 'settlement',
      header: 'Status',
      render: (row) => {
        if (row.settlement_status === 'PAID') return <Badge variant="success">PAID</Badge>;
        if (row.settlement_status === 'PARTIALLY_PAID') return <Badge variant="warning">PARTIAL</Badge>;
        if (row.settlement_id) return <Badge variant="info">SETTLED</Badge>;
        return <Badge variant="neutral">PENDING</Badge>;
      },
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title={party.name}
        subtitle={
          party.destination_name
            ? `Consignee Location: ${party.destination_name} | Contact: ${party.contact_no || 'None'}`
            : `Client / Consignee | Contact: ${party.contact_no || 'None'}`
        }
        actions={
          <Link
            href="/masters/parties"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Parties
          </Link>
        }
      />

      <div className="p-8 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Trips Sent" value={trips.length} color="blue" />
          <StatCard title="Total Goods Delivered" value={`${totalWeight.toFixed(2)} MT`} color="purple" />
          <StatCard title="Total Gross Freight" value={formatCurrency(totalFreight)} color="green" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Trip-wise Truck Delivery Register
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing which trucks were dispatched and delivered to this party
            </span>
          </div>

          <DataTable
            columns={tripColumns}
            data={trips}
            searchKey="truck_no"
            searchPlaceholder="Search truck number sent to party..."
            emptyMessage="No trips recorded for this party yet"
          />
        </div>
      </div>
    </div>
  );
}

export default function PartyProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading party profile...</div>}>
      <PartyContent />
    </Suspense>
  );
}
