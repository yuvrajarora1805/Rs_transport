'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import { apiFetch, formatCurrency } from '../../../lib/api';
import { Trip } from '../../../types';
import { Send, AlertCircle } from 'lucide-react';
import { SettlementSlipUpload } from '../../../components/settlements/SettlementSlipUpload';
import { SettlementSummarySidebar } from '../../../components/settlements/SettlementSummarySidebar';

function SettlementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    tripId: tripIdParam || '',
    advanceAmount: '0',
    dieselAmount: '0',
    commission: '700',
    otherDeductions: '0',
    slipImage: '',
  });

  const handleTripChange = async (id: string, tripList: Trip[] = trips) => {
    setForm((f) => ({ ...f, tripId: id }));
    const found = tripList.find((t) => t.id === id) || null;
    if (found) setSelectedTrip(found);
    if (id) {
      try {
        const details = await apiFetch<any>(`/trips/${id}`);
        if (details) {
          setSelectedTrip((prev) => ({ ...(found || {}), ...prev, ...details }));
          if (details?.fuelRecords && Array.isArray(details.fuelRecords)) {
            const totalFuel = details.fuelRecords.reduce((acc: number, f: any) => acc + Number(f.amount || 0), 0);
            if (totalFuel > 0) setForm((prev) => ({ ...prev, dieselAmount: totalFuel.toFixed(2) }));
          }
          if (details?.advances && Array.isArray(details.advances)) {
            const totalAdv = details.advances.reduce((acc: number, a: any) => acc + Number(a.amount || 0), 0);
            if (totalAdv > 0) setForm((prev) => ({ ...prev, advanceAmount: totalAdv.toFixed(2) }));
          }
        }
      } catch (e) {}
    } else {
      setSelectedTrip(null);
    }
  };

  useEffect(() => {
    apiFetch<Trip[]>('/trips')
      .then((res) => {
        const list = res || [];
        setTrips(list);
        if (tripIdParam) {
          handleTripChange(tripIdParam, list);
        }
      })
      .catch((err) => setError(err.message));
  }, [tripIdParam]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Slip image must be smaller than 5MB');
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, slipImage: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const rawGross = selectedTrip ? Number(selectedTrip.grossFreight ?? (selectedTrip as any).gross_freight ?? 0) : 0;
  const netWt = selectedTrip ? Number(selectedTrip.netWeight ?? (selectedTrip as any).net_weight ?? 0) : 0;
  const rate = selectedTrip ? Number(selectedTrip.ratePerUnit ?? (selectedTrip as any).rate_per_unit ?? 0) : 0;
  const gross = rawGross > 0 ? rawGross : (netWt > 0 && rate > 0 ? netWt * rate : 0);
  const advance = Number(form.advanceAmount) || 0;
  const diesel = Number(form.dieselAmount) || 0;
  const comm = Number(form.commission) || 0;
  const other = Number(form.otherDeductions) || 0;
  const totalDeductions = advance + diesel + comm + other;
  const netPayable = gross - totalDeductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tripId) return setError('Please select a Trip to settle');
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/settlements', {
        method: 'POST',
        body: JSON.stringify({
          tripId: form.tripId,
          advanceAmount: advance,
          dieselAmount: diesel,
          commission: comm,
          otherDeductions: other,
          slipImage: form.slipImage || undefined,
        }),
      });
      router.push('/settlements');
    } catch (err: any) {
      setError(err.message || 'Failed to create settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <Header title="Create Trip Settlement" subtitle="Calculate freight deductions, commission & net payable balance" />

      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl 2xl:max-w-screen-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                <AlertCircle size={18} /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Select Trip to Settle *</label>
                <select
                  required
                  value={form.tripId}
                  onChange={(e) => handleTripChange(e.target.value)}
                  className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Choose Unsettled Trip --</option>
                  {trips.map((t) => {
                    const transp = (t as any).transporter_name || t.transporter?.name || (t as any).company_code || 'RS Transport';
                    return (
                      <option key={t.id} value={t.id}>
                        Trip: {t.tripNo || (t as any).trip_no} | Truck: {t.truck?.truckNo || (t as any).truck_no} | Transporter: {transp} | Gross: {formatCurrency(Number(t.grossFreight || (t as any).gross_freight))}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Diesel Deductions (₹)</label>
                  <input
                    type="number"
                    value={form.dieselAmount}
                    onChange={(e) => setForm({ ...form, dieselAmount: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Cash Advances (₹)</label>
                  <input
                    type="number"
                    value={form.advanceAmount}
                    onChange={(e) => setForm({ ...form, advanceAmount: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Commission (₹)</label>
                  <input
                    type="number"
                    value={form.commission}
                    onChange={(e) => setForm({ ...form, commission: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Other Adjustments (₹)</label>
                  <input
                    type="number"
                    value={form.otherDeductions}
                    onChange={(e) => setForm({ ...form, otherDeductions: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <SettlementSlipUpload
                slipImage={form.slipImage}
                onUpload={handleImageUpload}
                onRemove={() => setForm((f) => ({ ...f, slipImage: '' }))}
              />

              <div className="pt-6 flex justify-end gap-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  {loading ? 'Saving...' : 'Finalize Settlement'}
                </button>
              </div>
            </form>
          </div>

          <SettlementSummarySidebar
            selectedTrip={selectedTrip}
            gross={gross}
            diesel={diesel}
            advance={advance}
            comm={comm}
            other={other}
            netPayable={netPayable}
          />
        </div>
      </div>
    </div>
  );
}

export default function NewSettlementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading form...</div>}>
      <SettlementForm />
    </Suspense>
  );
}
