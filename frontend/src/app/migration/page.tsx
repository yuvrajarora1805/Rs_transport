'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/ui/StatCard';
import { apiFetch } from '../../lib/api';
import { Database, FileSpreadsheet, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MigrationPage() {
  const [status, setStatus] = useState<any>({
    dispatchesCount: 0,
    trucksCount: 0,
    tripsCount: 0,
    settlementsCount: 0,
    fuelCount: 0,
  });
  const [activeImport, setActiveImport] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const loadStatus = async () => {
    try {
      const res = await apiFetch<any>('/imports/status');
      if (res) setStatus(res);
    } catch (e) {
      console.warn('Notice while loading migration status:', e);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const runImport = async (key: string, endpoint: string) => {
    setActiveImport(key);
    setResult(null);
    try {
      const res = await apiFetch<any>(endpoint, { method: 'POST' });
      setResult({ success: true, message: `Completed ${key}: imported ${res.imported || 0} records` });
      await loadStatus();
    } catch (e: any) {
      setResult({ success: false, message: e.message || 'Import failed' });
    } finally {
      setActiveImport(null);
    }
  };

  const workbooks = [
    {
      key: 'trucks',
      name: '1. TRUCK DETAILS.xlsx',
      desc: '6 Booking Sources (Bittu Brar, Happy Sarpanch, DSBC, etc.) and departure slips.',
      endpoint: '/imports/truck-details',
    },
    {
      key: 'pumps',
      name: '2. pump details.xlsx',
      desc: '14 Petrol Pump accounts, diesel purchases and disbursements statement.',
      endpoint: '/imports/pump-details',
    },
    {
      key: 'rs_transport',
      name: '3. RS TRANSPORT COMPANY (1).xlsx',
      desc: 'Main company settlement registers (Chattargarh, Sardarshahar, Jasrasar).',
      endpoint: '/imports/rs-transport',
    },
    {
      key: 'ranbir',
      name: '4. RANBIR LOGISTICS.xlsx',
      desc: 'Ranbir Logistics destination freight settlements (Bhadra, Mandrella).',
      endpoint: '/imports/ranbir-logistics',
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Excel Migration Center"
        subtitle="Intake historical records from the 4 Transport Workbooks into MySQL"
      />

      <div className="p-8 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Dispatches" value={status.dispatchesCount} color="blue" />
          <StatCard title="Registered Fleet" value={status.trucksCount} color="green" />
          <StatCard title="Trips Recorded" value={status.tripsCount} color="purple" />
          <StatCard title="Fuel Slips" value={status.fuelCount} color="amber" />
        </div>

        {result && (
          <div
            className={`p-4 rounded-xl border text-xs font-medium ${
              result.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="space-y-4">
          {workbooks.map((wb) => (
            <div
              key={wb.key}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">{wb.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{wb.desc}</p>
              </div>
              <button
                onClick={() => runImport(wb.key, wb.endpoint)}
                disabled={activeImport !== null}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs shrink-0"
              >
                {activeImport === wb.key ? 'Importing...' : 'Migrate Workbook'}
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
