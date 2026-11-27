'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/ui/StatCard';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api';
import { DashboardKpis, Dispatch, Trip, Payment } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
  const isManager = (user?.role as string) === 'MANAGER';
  const [accessStatus, setAccessStatus] = useState<{ locked: boolean; accessStart?: string; accessEnd?: string }>({ locked: false });
  const [unlockRequested, setUnlockRequested] = useState(false);

  useEffect(() => {
    if (!isManager) return;
    apiFetch<{ locked: boolean; accessStart?: string; accessEnd?: string }>('/auth/access-status')
      .then((res) => { if (res && typeof res.locked === 'boolean') setAccessStatus(res); })
      .catch(() => {});
  }, [isManager]);
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

  if (isManager && accessStatus.locked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Locked</h1>
          <p className="text-sm text-slate-600">
            Manager access is restricted to office hours ({accessStatus.accessStart || '09:00'} – {accessStatus.accessEnd || '19:00'}).
          </p>
          {unlockRequested ? (
            <p className="text-xs font-semibold text-emerald-600">
              Unlock request sent to Admin! Please wait for approval.
            </p>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await apiFetch('/auth/request-access', { method: 'POST', body: JSON.stringify({ reason: 'Outside office hours' }) });
                setUnlockRequested(true);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
            >
              Request Admin Unlock
            </button>
          )}
        </div>
      </div>
    );
  }

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
          {!isManager && (
            <StatCard
              title="Pending Settlements"
              value={kpis.pendingSettlements}
              icon={<AlertCircle size={18} />}
              color={kpis.pendingSettlements > 0 ? 'amber' : 'green'}
            />
          )}
        </div>

        {/* Financial KPI Grid */}
        {!isManager && (
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
        )}

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

