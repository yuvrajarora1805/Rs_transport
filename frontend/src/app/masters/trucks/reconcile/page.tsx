'use client';

import React, { useEffect, useState, useRef } from 'react';
import { StatCard } from '../../../../components/ui/StatCard';
import { TruckReconcileTopBar } from './TruckReconcileTopBar';
import { TruckReconcileTable } from './TruckReconcileTable';
import { TruckPartySummaryView } from './TruckPartySummaryView';
import { ColumnMappingDrawer } from './ColumnMappingDrawer';
import { apiFetch, getApiBase } from '../../../../lib/api';
import { Search } from 'lucide-react';

export default function TruckReconcilePage() {
  const [data, setData] = useState<any>(null);
  const [partyData, setPartyData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'excel' | 'party_summary'>('party_summary');
  const [loading, setLoading] = useState(true);
  const [partyLoading, setPartyLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTruck, setSearchTruck] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [truckCol, setTruckCol] = useState<number>(-1);
  const [dateCol, setDateCol] = useState<number>(-1);
  const [balesCol, setBalesCol] = useState<number>(-1);
  const [destCol, setDestCol] = useState<number>(-1);
  const [contactCol, setContactCol] = useState<number>(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/masters/trucks/reconcile/summary');
      if (res) setData(res);
    } catch (err) {
      console.warn('Notice while loading reconciliation summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPartySummary = async (queryTruck?: string) => {
    setPartyLoading(true);
    try {
      const endpoint = queryTruck
        ? `/masters/trucks/reconcile/party-summary?truckNo=${encodeURIComponent(queryTruck)}`
        : '/masters/trucks/reconcile/party-summary';
      const res = await apiFetch<any[]>(endpoint);
      setPartyData(res || []);
    } catch (err) {
      console.warn('Notice while loading party summary:', err);
    } finally {
      setPartyLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadPartySummary();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (truckCol > 0) formData.append('truckCol', String(truckCol));
    if (dateCol > 0) formData.append('dateCol', String(dateCol));
    if (balesCol > 0) formData.append('balesCol', String(balesCol));
    if (destCol > 0) formData.append('destCol', String(destCol));
    if (contactCol > 0) formData.append('contactCol', String(contactCol));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('rs_token') : null;
      const res = await fetch(`${getApiBase()}/masters/trucks/reconcile/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to parse uploaded Excel');
      const json = await res.json();
      setData(json);
      setActiveTab('excel');
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Could not parse Excel workbook'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const trucksList: any[] = (data?.trucks || []).filter((item: any) => {
    if (filterSource !== 'ALL' && item.source !== filterSource) return false;
    if (filterStatus === 'MATCHED' && !item.isRegisteredInSystem) return false;
    if (filterStatus === 'MISSING' && item.isRegisteredInSystem) return false;
    return true;
  });

  return (
    <div className="pb-12">
      <TruckReconcileTopBar
        uploading={uploading}
        fileName={data?.uploadedFileName}
        showMappingModal={showMappingModal}
        setShowMappingModal={setShowMappingModal}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
      />

      <ColumnMappingDrawer
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        truckCol={truckCol}
        setTruckCol={setTruckCol}
        dateCol={dateCol}
        setDateCol={setDateCol}
        balesCol={balesCol}
        setBalesCol={setBalesCol}
        destCol={destCol}
        setDestCol={setDestCol}
        contactCol={contactCol}
        setContactCol={setContactCol}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Excel Rows" value={data?.totalRows || 0} subtitle={`${data?.totalBales || 0} Bales`} color="blue" />
          <StatCard title="Unique Trucks" value={data?.distinctTrucks || 0} subtitle="Vehicles found" color="purple" />
          <StatCard title="Matched in ERP" value={data?.matchedInSystem || 0} subtitle="Registered vehicles" color="green" />
          <StatCard title="Missing in ERP" value={data?.missingInSystem || 0} subtitle="Needs registration" color="red" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('party_summary')}
              className={`pb-2.5 transition-colors ${
                activeTab === 'party_summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Truck-Wise Summary (Party Sorted) ({partyData.length})
            </button>
            <button
              onClick={() => setActiveTab('excel')}
              className={`pb-2.5 transition-colors ${
                activeTab === 'excel' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Raw Excel Workbook Data ({data?.totalRows || 0})
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); loadPartySummary(searchTruck); }} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter truck (e.g. RJ01GD4535)..."
              value={searchTruck}
              onChange={(e) => setSearchTruck(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-2xs">
              <Search size={13} /> Filter
            </button>
            {searchTruck && (
              <button type="button" onClick={() => { setSearchTruck(''); loadPartySummary(''); }} className="text-xs text-slate-500 hover:text-slate-800">
                Clear
              </button>
            )}
          </form>
        </div>

        {activeTab === 'party_summary' && <TruckPartySummaryView data={partyData} loading={partyLoading} />}

        {activeTab === 'excel' && (
          <TruckReconcileTable
            data={data}
            trucksList={trucksList}
            filterSource={filterSource}
            setFilterSource={setFilterSource}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            loading={loading}
            onReload={loadSummary}
            onSelectTruck={(tNo) => {
              setSearchTruck(tNo);
              loadPartySummary(tNo);
              setActiveTab('party_summary');
            }}
          />
        )}
      </div>
    </div>
  );
}
