'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/ui/StatCard';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api';
import { DashboardKpis, Dispatch, Trip, Payment } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import {
  Truck,
  Send,
  Navigation,
  Fuel,
  Wallet,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { activeCompany } = useCompany();
  const [kpis, setKpis] = useState<DashboardKpis>({
    totalRegisteredTrucks: 0,
    totalDispatches: 0,
    totalTrips: 0,
    totalGrossFreight: 0,
    totalDieselAmount: 0,
    totalAdvances: 0,
    totalCommission: 0,
    totalNetPayable: 0,
    totalPaymentsMade: 0,
    totalOutstanding: 0,
    pendingSettlements: 0,
  });

  const [recentDispatches, setRecentDispatches] = useState<Dispatch[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [kpiRes, recentRes] = await Promise.all([
          apiFetch<DashboardKpis>(`/dashboard/kpis?companyCode=${activeCompany.code}`).catch(() => null),
          apiFetch<any>(`/dashboard/recent?companyCode=${activeCompany.code}`).catch(() => null),
        ]);

        if (kpiRes) setKpis(kpiRes);
        if (recentRes) {
          setRecentDispatches(recentRes.recentDispatches || []);
          setRecentTrips(recentRes.recentTrips || []);
        }
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [activeCompany.code]);

  const dispatchColumns: Column<Dispatch>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'truck', header: 'Truck No', render: (row) => (
      <span className="font-semibold text-slate-900">{row.truck?.truckNo || (row as any).truck_no}</span>
    )},
    { key: 'source', header: 'Source', render: (row) => row.source?.name || (row as any).source_name || '-' },
    { key: 'destination', header: 'Destination' },
    { key: 'bales', header: 'Bales' },
  ];

  const tripColumns: Column<Trip>[] = [
    { key: 'tripNo', header: 'Trip No', render: (row) => (
      <span className="font-semibold text-blue-600">{row.tripNo || (row as any).trip_no}</span>
    )},
    { key: 'truck', header: 'Truck', render: (row) => row.truck?.truckNo || (row as any).truck_no },
    { key: 'destination', header: 'Destination', render: (row) => row.destination?.name || (row as any).destination_name || '-' },
    { key: 'netWeight', header: 'Weight (MT)', render: (row) => `${Number(row.netWeight || (row as any).net_weight).toFixed(2)} MT` },
    { key: 'grossFreight', header: 'Gross Freight', render: (row) => formatCurrency(Number(row.grossFreight || (row as any).gross_freight)) },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Transport ERP Dashboard"
        subtitle="Complete Operational & Financial Overview"
        actions={
          <div className="flex gap-2">
            <Link
              href="/dispatches/new"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              <PlusCircle size={14} /> Add Dispatch
            </Link>
            <Link
              href="/trips/new"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Navigation size={14} /> Record Trip
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Registered Trucks"
            value={kpis.totalRegisteredTrucks}
            icon={<Truck size={18} />}
            color="blue"
          />
          <StatCard
            title="Total Dispatches"
            value={kpis.totalDispatches}
            icon={<Send size={18} />}
            color="slate"
          />
          <StatCard
            title="Total Trips"
            value={kpis.totalTrips}
            icon={<Navigation size={18} />}
            color="purple"
          />
          <StatCard
            title="Pending Settlements"
            value={kpis.pendingSettlements}
            icon={<AlertCircle size={18} />}
            color={kpis.pendingSettlements > 0 ? 'amber' : 'green'}
          />
        </div>

        {/* Financial KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Gross Freight"
            value={formatCurrency(kpis.totalGrossFreight)}
            subtitle="Billable freight generated"
            color="blue"
          />
          <StatCard
            title="Diesel Deductions"
            value={formatCurrency(kpis.totalDieselAmount)}
            subtitle="Fuel provided from pumps"
            color="amber"
          />
          <StatCard
            title="Payments Disbursed"
            value={formatCurrency(kpis.totalPaymentsMade)}
            subtitle="Freight paid out to trucks"
            color="green"
          />
          <StatCard
            title="Net Outstanding"
            value={formatCurrency(kpis.totalOutstanding)}
            subtitle="Payables pending balance"
            color="red"
          />
        </div>

        {/* Recent Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Recent Dispatches
              </h3>
              <Link href="/dispatches" className="text-xs text-blue-600 font-medium hover:underline">
                View All
              </Link>
            </div>
            <DataTable
              columns={dispatchColumns}
              data={recentDispatches}
              emptyMessage="No dispatch records entered yet"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Recent Trips & Weight Records
              </h3>
              <Link href="/trips" className="text-xs text-blue-600 font-medium hover:underline">
                View All
              </Link>
            </div>
            <DataTable
              columns={tripColumns}
              data={recentTrips}
              emptyMessage="No trip records entered yet"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

