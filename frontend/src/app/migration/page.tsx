'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/ui/StatCard';
import { apiFetch, getApiBase } from '../../lib/api';
import { Database, FileSpreadsheet, Download, Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const downloadWorkbook = (downloadKey: string, filename: string) => {
    const url = `${getApiBase()}/imports/download/${downloadKey}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveImport('upload_trucks');
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('rs_token') : null;
      const res = await fetch(`${getApiBase()}/imports/upload/truck-details`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload and import workbook');
      const data = await res.json();
      setResult({ success: true, message: `Successfully uploaded & imported ${data.imported || 0} dispatches from ${file.name}` });
      await loadStatus();
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'File upload failed' });
    } finally {
      setActiveImport(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const workbooks = [
    {
      key: 'trucks',
      downloadKey: 'truck-details',
      name: '1. TRUCK DETAILS (2).xlsx',
      desc: '11 Booking Sources (Bittu Brar, Happy Sarpanch, DSBC, etc.) and departure slips.',
      endpoint: '/imports/truck-details',
      canUpload: true,
    },
    {
      key: 'pumps',
      downloadKey: 'pump-details',
      name: '2. pump details.xlsx',
      desc: '14 Petrol Pump accounts, diesel purchases and disbursements statement.',
      endpoint: '/imports/pump-details',
    },
    {
      key: 'rs_transport',
      downloadKey: 'rs-transport',
      name: '3. RS TRANSPORT COMPANY (1).xlsx',
      desc: 'Main company settlement registers (Chattargarh, Sardarshahar, Jasrasar, Sheets 4-10).',
      endpoint: '/imports/rs-transport',
    },
    {
      key: 'ranbir',
      downloadKey: 'ranbir-logistics',
      name: '4. RANBIR LOGISTICS.xlsx',
      desc: 'Ranbir Logistics destination freight settlements (Bhadra, Mandrella).',
      endpoint: '/imports/ranbir-logistics',
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Excel Migration Center"
        subtitle="Upload customized workbooks, download backups, or intake records into MySQL"
        actions={
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={activeImport !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <Upload size={14} />
              {activeImport === 'upload_trucks' ? 'Uploading...' : 'Upload & Import TRUCK DETAILS.xlsx'}
            </button>
            <Link
              href="/masters/trucks/reconcile"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs"
            >
              <FileSpreadsheet size={14} /> Match Truck Data
            </Link>
          </div>
        }
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
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">{wb.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{wb.desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadWorkbook(wb.downloadKey, wb.name)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-300 shadow-2xs"
                >
                  <Download size={14} /> Download
                </button>
                {wb.canUpload && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={activeImport !== null}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <Upload size={14} /> Upload New File
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => runImport(wb.key, wb.endpoint)}
                  disabled={activeImport !== null}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {activeImport === wb.key ? 'Importing...' : 'Migrate'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
