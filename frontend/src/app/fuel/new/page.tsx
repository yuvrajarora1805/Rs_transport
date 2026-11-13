'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import { apiFetch, formatDate } from '../../../lib/api';
import { Truck, Pump } from '../../../types';
import { Send, AlertCircle, ArrowRight } from 'lucide-react';
import { TruckSelect } from '../../../components/ui/TruckSelect';
import { FuelImpactSidebar } from '../../../components/fuel/FuelImpactSidebar';
import { FuelReceiptUpload } from '../../../components/fuel/FuelReceiptUpload';
import Link from 'next/link';

function NewFuelForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTripId = searchParams.get('tripId') || '';
  const paramTruckId = searchParams.get('truckId') || '';

  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [linkedTrip, setLinkedTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: '',
    truckId: paramTruckId || '',
    tripId: paramTripId || '',
    pumpId: '',
    amount: '',
    slipImage: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Slip image must be smaller than 5MB');
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, slipImage: reader.result as string }));
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setForm((f) => ({
      ...f,
      date: new Date().toISOString().split('T')[0],
      ...(paramTruckId ? { truckId: paramTruckId } : {}),
      ...(paramTripId ? { tripId: paramTripId } : {}),
    }));

    Promise.all([
      apiFetch<Truck[]>('/masters/trucks'),
      apiFetch<Pump[]>('/masters/pumps'),
      paramTripId ? apiFetch<any>(`/trips/${paramTripId}`).catch(() => null) : Promise.resolve(null),
    ])
      .then(([t, p, tripData]) => {
        setTrucks(t || []);
        setPumps(p || []);
        if (p && p.length > 0) setForm((f) => ({ ...f, pumpId: p[0].id }));
        if (tripData && !tripData.error) {
          setLinkedTrip(tripData);
          const tId = tripData.truck_id || tripData.truckId || tripData.truck?.id;
          if (tId) setForm((f) => ({ ...f, truckId: tId }));
        }
      })
      .catch((err) => setError(err.message));
  }, [paramTruckId, paramTripId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.truckId || !form.pumpId || !form.amount) {
      return setError('Please select Truck, Pump and enter Net Fuel Amount');
    }
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/fuel', {
        method: 'POST',
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      router.push('/fuel');
    } catch (err: any) {
      setError(err.message || 'Failed to record fuel entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <Header title="Add Diesel Entry" subtitle="Record fuel slip, link truck & update pump ledger" />
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl 2xl:max-w-screen-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                <AlertCircle size={18} /><span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Slip Date *</label>
                  <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Petrol Pump *</label>
                  <select required value={form.pumpId} onChange={(e) => setForm({ ...form, pumpId: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white">
                    {pumps.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Select Truck *</label>
                {linkedTrip && (
                  <div className="mb-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-blue-900">
                      <span>Trip #{linkedTrip.trip_no || linkedTrip.tripNo || 'Active'}</span>
                      <Link href={`/trips`} className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                        View Trip <ArrowRight size={12} />
                      </Link>
                    </div>
                    <div className="text-slate-600">
                      {formatDate(linkedTrip.unloading_date)} • {linkedTrip.destination?.name || linkedTrip.destination_name || 'Destination'} • {linkedTrip.party?.name || linkedTrip.party_name || 'Party'}
                    </div>
                  </div>
                )}
                <TruckSelect trucks={trucks} value={form.truckId} onChange={(id) => setForm({ ...form, truckId: id })} required placeholder="Search truck..." />
              </div>

              <FuelReceiptUpload slipImage={form.slipImage} onUpload={handleImageUpload} onRemove={() => setForm((f) => ({ ...f, slipImage: '' }))} />

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <label className="block text-sm font-bold text-slate-800 mb-2">Net Fuel Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold text-lg pointer-events-none">₹</span>
                  <input type="number" step="0.01" required placeholder="e.g. 22125" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full h-12 pl-9 pr-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white" />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-slate-200">
                <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50">
                  <Send size={16} />{loading ? 'Saving...' : 'Save Diesel Slip'}
                </button>
              </div>
            </form>
          </div>

          <FuelImpactSidebar selectedPump={pumps.find((p) => p.id === form.pumpId)} selectedTruck={trucks.find((t) => t.id === form.truckId)} amount={form.amount} />
        </div>
      </div>
    </div>
  );
}

export default function NewFuelPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading fuel entry...</div>}>
      <NewFuelForm />
    </Suspense>
  );
}
