'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import { apiFetch } from '../../../lib/api';
import { Truck, Source, Destination } from '../../../types';
import { useCompany } from '../../../context/CompanyContext';
import { Send, AlertCircle } from 'lucide-react';
import { MultiTruckGuideAlert } from '../../../components/dispatches/MultiTruckGuideAlert';
import { MultiTruckRow } from '../../../components/dispatches/MultiTruckRowCard';
import { MultiTruckListSection } from '../../../components/dispatches/MultiTruckListSection';
import { SingleTruckSection } from '../../../components/dispatches/SingleTruckSection';
import { DispatchSummarySidebar } from '../../../components/dispatches/DispatchSummarySidebar';
import { DispatchHeaderFields } from '../../../components/dispatches/DispatchHeaderFields';
import { DispatchQuickModals } from '../../../components/dispatches/DispatchQuickModals';
import { submitDispatch } from '../../../components/dispatches/dispatchSubmit';
import { useDispatchModals } from '../../../components/dispatches/useDispatchModals';

export default function NewDispatchPage() {
  const router = useRouter();
  const { activeCompany } = useCompany();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [commonForm, setCommonForm] = useState({ date: '', srNo: '', sourceId: '', destination: '', remarks: '' });
  const [singleTruck, setSingleTruck] = useState({ truckId: '', bales: '', driverMobile: '' });
  const [multiTrucks, setMultiTrucks] = useState<MultiTruckRow[]>([
    { id: 'row-1', truckId: '', bales: '', driverMobile: '' },
    { id: 'row-2', truckId: '', bales: '', driverMobile: '' },
  ]);

  const {
    modals, setModals, modalLoading, modalError, setModalError,
    newTruckForm, setNewTruckForm, handleAddTruck,
    newSourceForm, setNewSourceForm, handleAddSource,
    newDestForm, setNewDestForm, handleAddDest,
  } = useDispatchModals(setTrucks, setSources, setDestinations, setSingleTruck, setCommonForm);

  useEffect(() => {
    setCommonForm((f) => ({ ...f, date: new Date().toISOString().split('T')[0] }));
    Promise.all([
      apiFetch<Truck[]>('/masters/trucks'),
      apiFetch<Source[]>('/masters/sources'),
      apiFetch<Destination[]>('/masters/destinations'),
    ]).then(([tRes, sRes, dRes]) => {
      setTrucks(tRes || []);
      setSources(sRes || []);
      setDestinations(dRes || []);
      if (sRes && sRes.length > 0) setCommonForm((f) => ({ ...f, sourceId: sRes[0].id }));
    }).catch((err) => setError(err.message));
  }, []);

  const handleMultiRowChange = (id: string, field: keyof MultiTruckRow, value: string) => {
    setMultiTrucks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!commonForm.sourceId) return setError('Please select Booking Source');
    setLoading(true);
    setError(null);
    try {
      await submitDispatch({
        isMultiMode, commonForm: { ...commonForm, companyCode: activeCompany.code },
        singleTruck, multiTrucks, companyCode: activeCompany.code,
      });
      router.push('/dispatches');
    } catch (err: any) { setError(err.message || 'Failed to record dispatch'); } finally { setLoading(false); }
  };

  return (
    <div className="pb-16">
      <Header title="Add New Dispatch" subtitle="Record truck departure, load details & destination slips" />
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl 2xl:max-w-screen-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                <AlertCircle size={18} /><span>{error}</span>
              </div>
            )}

            {/* CARD 1: Order Booking Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">Dispatch Order Setup</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsMultiMode(false)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${!isMultiMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}`}>
                    Single Truck
                  </button>
                  <button type="button" onClick={() => setIsMultiMode(true)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isMultiMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}`}>
                    Multiple Trucks
                  </button>
                </div>
              </div>

              {isMultiMode && <MultiTruckGuideAlert truckCount={multiTrucks.length} />}

              <DispatchHeaderFields
                date={commonForm.date} srNo={commonForm.srNo} sourceId={commonForm.sourceId} destination={commonForm.destination}
                sources={sources} destinations={destinations}
                onDateChange={(v) => setCommonForm((f) => ({ ...f, date: v }))}
                onSrNoChange={(v) => setCommonForm((f) => ({ ...f, srNo: v }))}
                onSourceChange={(v) => setCommonForm((f) => ({ ...f, sourceId: v }))}
                onDestChange={(v) => setCommonForm((f) => ({ ...f, destination: v }))}
                onOpenAddSource={() => { setModalError(null); setModals((m) => ({ ...m, source: true })); }}
                onOpenAddDest={() => { setModalError(null); setModals((m) => ({ ...m, dest: true })); }}
              />
            </div>

            {/* CARD 2: Assigned Fleet / Multi-Trucks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isMultiMode ? `Assigned Fleet (${multiTrucks.length} Trucks)` : 'Vehicle Assignment'}
                  </h3>
                  <p className="text-xs text-slate-500">Record truck registration, bales count & driver contact details</p>
                </div>
              </div>

              {!isMultiMode ? (
                <SingleTruckSection
                  form={singleTruck} trucks={trucks}
                  onChange={(f, v) => setSingleTruck((prev) => ({ ...prev, [f]: v }))}
                  onOpenAddTruck={() => { setModalError(null); setModals((m) => ({ ...m, truck: true })); }}
                />
              ) : (
                <MultiTruckListSection
                  multiTrucks={multiTrucks} trucks={trucks}
                  onOpenAddTruck={() => { setModalError(null); setModals((m) => ({ ...m, truck: true })); }}
                  onAddRow={() => setMultiTrucks((prev) => [...prev, { id: `row-${Date.now()}`, truckId: '', bales: '', driverMobile: '' }])}
                  onRemoveRow={(id) => setMultiTrucks((prev) => prev.filter((r) => r.id !== id))}
                  onRowChange={handleMultiRowChange}
                />
              )}
            </div>

            {/* CARD 3: Load Remarks & Submit */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Remarks / Load Notes</label>
                <textarea rows={2} placeholder="Optional notes regarding driver, bales quality, or transit conditions..."
                  value={commonForm.remarks} onChange={(e) => setCommonForm({ ...commonForm, remarks: e.target.value })}
                  className="w-full p-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>

              <div className="pt-4 flex justify-end gap-4 border-t border-slate-100">
                <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50">
                  <Send size={16} />{loading ? 'Saving...' : isMultiMode ? `Save Dispatch (${multiTrucks.filter((r) => r.truckId).length} Trucks)` : 'Save Dispatch'}
                </button>
              </div>
            </div>
          </form>

          <DispatchSummarySidebar
            isMultiMode={isMultiMode} selectedTruck={trucks.find((t) => t.id === singleTruck.truckId)} singleBales={singleTruck.bales}
            multiTrucks={multiTrucks} trucks={trucks} multiTruckCount={multiTrucks.filter((r) => r.truckId).length}
            totalMultiBales={multiTrucks.reduce((sum, r) => sum + Number(r.bales || 0), 0)}
            selectedSource={sources.find((s) => s.id === commonForm.sourceId)} destination={commonForm.destination}
            loading={loading} onSubmit={handleSubmit}
          />
        </div>
      </div>
      <DispatchQuickModals
        modals={modals} onClose={(k) => setModals((m) => ({ ...m, [k]: false }))}
        onAddTruck={handleAddTruck} newTruckForm={newTruckForm} setNewTruckForm={setNewTruckForm}
        modalLoading={modalLoading} modalError={modalError}
        onAddSource={handleAddSource} newSourceForm={newSourceForm} setNewSourceForm={setNewSourceForm}
        onAddDest={handleAddDest} newDestForm={newDestForm} setNewDestForm={setNewDestForm}
      />
    </div>
  );
}
