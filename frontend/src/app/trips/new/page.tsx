'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import { apiFetch } from '../../../lib/api';
import { Truck, Destination, Party, Transporter } from '../../../types';
import { TruckSelect } from '../../../components/ui/TruckSelect';
import { useCompany } from '../../../context/CompanyContext';
import { Send, AlertCircle, Plus } from 'lucide-react';
import { TripCommonHeader } from '../../../components/trips/TripCommonHeader';
import { TripWeighbridgeSection } from '../../../components/trips/TripWeighbridgeSection';
import { TripFreightSidebar } from '../../../components/trips/TripFreightSidebar';
import { QuickAddPartyModal } from '../../../components/trips/QuickAddPartyModal';
import { TripMultiTruckCard, TripMultiTruckRow } from '../../../components/trips/TripMultiTruckCard';
import { submitTrip } from '../../../components/trips/tripSubmit';
import { useTripModals } from '../../../components/trips/useTripModals';
import { AddTransporterModal } from '../../../components/masters/AddTransporterModal';

function TripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCompany } = useCompany();

  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [tareHistories, setTareHistories] = useState<Record<string, any[]>>({});

  const [commonForm, setCommonForm] = useState({
    tripNo: searchParams.get('srNo') || '', dispatchId: searchParams.get('dispatchId') || '',
    destinationId: '', partyId: '', transporterId: '', unloadingDate: '',
  });

  const {
    showAddPartyModal, setShowAddPartyModal, newPartyForm, setNewPartyForm,
    newPartyLoading, newPartyError, setNewPartyError, handleQuickAddParty,
    showAddTransporterModal, setShowAddTransporterModal, newTransporterForm,
    setNewTransporterForm, newTransporterLoading, newTransporterError,
    setNewTransporterError, handleQuickAddTransporter,
  } = useTripModals(commonForm.destinationId, setParties, setTransporters, setCommonForm);

  const [singleTruck, setSingleTruck] = useState({
    truckId: searchParams.get('truckId') || '', grossWeight: '', tareWeight: '', netWeight: '', ratePerUnit: '', slipImage: '',
  });

  const [multiRows, setMultiRows] = useState<TripMultiTruckRow[]>([
    { id: 't-1', truckId: '', transporterId: '', tareWeight: '', grossWeight: '', netWeight: '', ratePerUnit: '', slipImage: '' },
    { id: 't-2', truckId: '', transporterId: '', tareWeight: '', grossWeight: '', netWeight: '', ratePerUnit: '', slipImage: '' },
  ]);

  const fetchTare = async (tId: string) => {
    if (!tId || tareHistories[tId]) return;
    try {
      const res = await apiFetch<any[]>(`/masters/trucks/${tId}/recent-tare`);
      setTareHistories((p) => ({ ...p, [tId]: res || [] }));
    } catch (e) {}
  };

  useEffect(() => {
    setCommonForm((f) => ({ ...f, unloadingDate: new Date().toISOString().split('T')[0] }));
    Promise.all([
      apiFetch<Truck[]>('/masters/trucks'), apiFetch<Destination[]>('/masters/destinations'),
      apiFetch<Party[]>('/masters/parties'), apiFetch<Transporter[]>('/masters/transporters'),
    ]).then(([t, d, p, tr]) => {
      setTrucks(t || []); setDestinations(d || []); setParties(p || []); setTransporters(tr || []);
      if (tr && tr.length > 0) setCommonForm((f) => ({ ...f, transporterId: tr[0].id }));
      const destParam = searchParams.get('destination');
      if (destParam && d) {
        const found = d.find((dest) => dest.name.toLowerCase() === destParam.toLowerCase());
        if (found) setCommonForm((f) => ({ ...f, destinationId: found.id }));
      }
      const initialTruck = searchParams.get('truckId');
      if (initialTruck) fetchTare(initialTruck);
    }).catch((err) => setError(err.message));
  }, []);

  const handleMultiRowChange = (id: string, field: keyof TripMultiTruckRow, val: string) => {
    setMultiRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const u = { ...r, [field]: val };
        if (field === 'truckId') fetchTare(val);
        if (field === 'grossWeight' || field === 'tareWeight') {
          const g = Number(field === 'grossWeight' ? val : r.grossWeight);
          const t = Number(field === 'tareWeight' ? val : r.tareWeight);
          if (g > 0 && t > 0 && g >= t) u.netWeight = (g - t).toFixed(3);
        }
        return u;
      })
    );
  };

  const handleMultiImage = (id: string, file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Slip image must be under 5MB');
    const reader = new FileReader();
    reader.onloadend = () => handleMultiRowChange(id, 'slipImage', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSingleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Slip image must be under 5MB');
    const reader = new FileReader();
    reader.onloadend = () => setSingleTruck((s) => ({ ...s, slipImage: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonForm.destinationId || !commonForm.partyId) return setError('Please select Destination and Party');
    setLoading(true);
    setError(null);
    try {
      await submitTrip({ isMultiMode, commonForm, singleTruck, multiRows, companyCode: activeCompany.code });
      router.push('/trips');
    } catch (err: any) { setError(err.message || 'Failed to record trip'); } finally { setLoading(false); }
  };

  const totalGross = isMultiMode
    ? multiRows.reduce((sum, r) => sum + (Number(r.netWeight || 0) * Number(r.ratePerUnit || singleTruck.ratePerUnit || 0)), 0)
    : Number(singleTruck.netWeight || 0) * Number(singleTruck.ratePerUnit || 0);

  return (
    <div className="pb-16">
      <Header title="Record New Trip" subtitle="Enter weighbridge unloading weight, rate and freight details" />
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl 2xl:max-w-screen-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                <AlertCircle size={18} /><span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Unloading Type</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsMultiMode(false)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${!isMultiMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    Single Truck
                  </button>
                  <button type="button" onClick={() => setIsMultiMode(true)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isMultiMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    Multiple Trucks (Same Order)
                  </button>
                </div>
              </div>

              <TripCommonHeader
                tripNo={commonForm.tripNo} unloadingDate={commonForm.unloadingDate} destinationId={commonForm.destinationId}
                partyId={commonForm.partyId} transporterId={commonForm.transporterId}
                destinations={destinations} parties={parties} transporters={transporters}
                onTripNoChange={(v) => setCommonForm((f) => ({ ...f, tripNo: v }))}
                onDateChange={(v) => setCommonForm((f) => ({ ...f, unloadingDate: v }))}
                onDestChange={(v) => setCommonForm((f) => ({ ...f, destinationId: v }))}
                onPartyChange={(v) => setCommonForm((f) => ({ ...f, partyId: v }))}
                onTransporterChange={(v) => setCommonForm((f) => ({ ...f, transporterId: v }))}
                onOpenAddParty={() => { setNewPartyError(null); setShowAddPartyModal(true); }}
                onOpenAddTransporter={() => { setNewTransporterError(null); setShowAddTransporterModal(true); }}
              />

              {!isMultiMode ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Select Truck *</label>
                    <TruckSelect trucks={trucks} value={singleTruck.truckId} onChange={(id) => { setSingleTruck((s) => ({ ...s, truckId: id })); fetchTare(id); }} required placeholder="Search truck..." />
                  </div>
                  <TripWeighbridgeSection
                    grossWeight={singleTruck.grossWeight} tareWeight={singleTruck.tareWeight} netWeight={singleTruck.netWeight} ratePerUnit={singleTruck.ratePerUnit}
                    slipImage={singleTruck.slipImage} tareHistory={tareHistories[singleTruck.truckId] || []}
                    onGrossChange={(v) => setSingleTruck((s) => ({ ...s, grossWeight: v, ...(Number(v) > 0 && Number(s.tareWeight) > 0 && Number(v) >= Number(s.tareWeight) ? { netWeight: (Number(v) - Number(s.tareWeight)).toFixed(3) } : {}) }))}
                    onTareChange={(v) => setSingleTruck((s) => ({ ...s, tareWeight: v, ...(Number(s.grossWeight) > 0 && Number(v) > 0 && Number(s.grossWeight) >= Number(v) ? { netWeight: (Number(s.grossWeight) - Number(v)).toFixed(3) } : {}) }))}
                    onNetChange={(v) => setSingleTruck((s) => ({ ...s, netWeight: v }))} onRateChange={(v) => setSingleTruck((s) => ({ ...s, ratePerUnit: v }))}
                    onSelectTareHistory={(tare) => setSingleTruck((s) => ({ ...s, tareWeight: Number(tare).toFixed(3), ...(Number(s.grossWeight) >= Number(tare) ? { netWeight: (Number(s.grossWeight) - Number(tare)).toFixed(3) } : {}) }))}
                    onImageUpload={handleSingleImage} onRemoveImage={() => setSingleTruck((s) => ({ ...s, slipImage: '' }))}
                  />
                </>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Trucks in this Unloading ({multiRows.length})</h4>
                      <p className="text-xs text-slate-500">Each truck gets independent weights & slip photo upload</p>
                    </div>
                    <button type="button" onClick={() => setMultiRows((p) => [...p, { id: `t-${Date.now()}`, truckId: '', transporterId: commonForm.transporterId, tareWeight: '', grossWeight: '', netWeight: '', ratePerUnit: singleTruck.ratePerUnit, slipImage: '' }])}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"><Plus size={14} /> Add Another Truck</button>
                  </div>
                  <div className="space-y-4">
                    {multiRows.map((row, idx) => (
                      <TripMultiTruckCard
                        key={row.id} row={row} index={idx} trucks={trucks} transporters={transporters}
                        tareHistory={tareHistories[row.truckId] || []} canRemove={multiRows.length > 1} defaultRate={singleTruck.ratePerUnit}
                        onChange={(f, v) => handleMultiRowChange(row.id, f, v)} onRemove={() => setMultiRows((p) => p.filter((r) => r.id !== row.id))}
                        onImageUpload={(e) => handleMultiImage(row.id, e.target.files?.[0])}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-end gap-4 border-t border-slate-200">
                <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50">
                  <Send size={16} />{loading ? 'Saving...' : isMultiMode ? `Save Trip (${multiRows.filter((r) => r.truckId).length} Trucks)` : 'Save Trip'}
                </button>
              </div>
            </form>
          </div>

          <TripFreightSidebar
            netWeight={isMultiMode ? multiRows.reduce((sum, r) => sum + Number(r.netWeight || 0), 0).toFixed(3) : singleTruck.netWeight}
            ratePerUnit={singleTruck.ratePerUnit}
            grossFreight={totalGross}
            isMultiMode={isMultiMode}
            truckCount={multiRows.filter((r) => r.truckId).length}
            multiRows={multiRows}
            trucks={trucks}
          />
        </div>
      </div>
      <QuickAddPartyModal isOpen={showAddPartyModal} onClose={() => setShowAddPartyModal(false)} onSubmit={handleQuickAddParty} form={newPartyForm} onChange={(f, v) => setNewPartyForm({ ...newPartyForm, [f]: v })} loading={newPartyLoading} error={newPartyError} />
      <AddTransporterModal isOpen={showAddTransporterModal} onClose={() => setShowAddTransporterModal(false)} onSubmit={handleQuickAddTransporter} form={newTransporterForm} onChange={(f, v) => setNewTransporterForm((prev) => ({ ...prev, [f]: v }))} submitting={newTransporterLoading} formError={newTransporterError} />
    </div>
  );
}

export default function NewTripPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading trip setup...</div>}>
      <TripForm />
    </Suspense>
  );
}
