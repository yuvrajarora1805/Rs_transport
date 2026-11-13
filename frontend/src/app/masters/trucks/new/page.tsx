'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../../../components/layout/Header';
import { apiFetch } from '../../../../lib/api';
import { Transporter } from '../../../../types';
import { Truck, Send, AlertCircle, ShieldCheck } from 'lucide-react';

export default function NewTruckPage() {
  const router = useRouter();
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    truckNo: '',
    ownerName: '',
    mobileNo: '',
    truckType: 'Trailer 14 Tyre',
    capacity: '',
    transporterId: '',
  });

  useEffect(() => {
    apiFetch<Transporter[]>('/masters/transporters')
      .then((res) => setTransporters(res || []))
      .catch((err) => setError(err.message));
  }, []);

  const selectedTransporter = transporters.find((t) => t.id === form.transporterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.truckNo) return setError('Please provide truck registration number');
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/masters/trucks', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          capacity: form.capacity ? Number(form.capacity) : undefined,
          transporterId: form.transporterId || undefined,
        }),
      });
      router.push('/masters/trucks');
    } catch (err: any) {
      setError(err.message || 'Failed to register truck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <Header title="Register New Truck" subtitle="Add vehicle to permanent fleet master registry" />

      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl 2xl:max-w-screen-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RJ07GD2004"
                    value={form.truckNo}
                    onChange={(e) => setForm({ ...form, truckNo: e.target.value.toUpperCase() })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono uppercase bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Truck Owner Name (Malik)</label>
                  <input
                    type="text"
                    placeholder="e.g. Gursewak Singh"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Owner / Driver Mobile</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.mobileNo}
                    onChange={(e) => setForm({ ...form, mobileNo: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Transporter Affiliation</label>
                  <select
                    value={form.transporterId}
                    onChange={(e) => setForm({ ...form, transporterId: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Independent / Self</option>
                    {transporters.map((tr) => (
                      <option key={tr.id} value={tr.id}>{tr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Truck Body / Type</label>
                  <input
                    type="text"
                    value={form.truckType}
                    onChange={(e) => setForm({ ...form, truckType: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Payload Capacity (MT)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 25"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

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
                  {loading ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Truck size={18} className="text-blue-600" /> Vehicle Profile
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Reg Number:</span>
                  <span className="font-bold font-mono text-slate-900">{form.truckNo || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Owner:</span>
                  <span className="font-bold text-slate-900">{form.ownerName || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Transporter:</span>
                  <span className="font-semibold text-slate-700">{selectedTransporter?.name || 'Independent'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Body Type:</span>
                  <span className="font-bold text-slate-900">{form.truckType}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-6 text-xs text-blue-900 space-y-2">
              <p className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-600" /> Permanent Master
              </p>
              <p className="leading-relaxed">
                Once registered, this truck is selectable in dispatches, trips, and petrol pump diesel slips.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
