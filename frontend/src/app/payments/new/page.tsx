'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import { apiFetch, formatCurrency } from '../../../lib/api';
import { CreditCard, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const settlementId = searchParams.get('settlementId') || '';
  const outstandingParam = searchParams.get('outstanding') || '0';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    settlementId,
    paymentDate: '',
    amount: outstandingParam,
    method: 'BANK_TRANSFER',
    refNo: '',
    paidTo: '',
    remarks: '',
  });

  React.useEffect(() => {
    setForm((f) => ({ ...f, paymentDate: new Date().toISOString().split('T')[0] }));
  }, []);

  const remAfterPay = Math.max(0, Number(outstandingParam) - (Number(form.amount) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.settlementId || !form.amount) {
      return setError('Please provide settlement and payment amount');
    }

    setLoading(true);
    setError(null);
    try {
      await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      router.push('/payments');
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <Header title="Disburse Payment" subtitle="Issue payment voucher and update settlement balance" />

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
                  <label className="block text-sm font-bold text-slate-800 mb-2">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Payment Method *</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">UTR / Transaction Ref No</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR12345678"
                    value={form.refNo}
                    onChange={(e) => setForm({ ...form, refNo: e.target.value })}
                    className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Paid To (Payee / Malik Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Sukhwant Kaur / Truck Owner"
                  value={form.paidTo}
                  onChange={(e) => setForm({ ...form, paidTo: e.target.value })}
                  className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Voucher Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Payment remarks or bank branch details..."
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="w-full p-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                />
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
                  {loading ? 'Disbursing...' : 'Record Payment Voucher'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" /> Voucher Balance
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Current Outstanding:</span>
                  <span className="font-bold text-rose-600">{formatCurrency(Number(outstandingParam))}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Disbursing Now:</span>
                  <span className="font-bold text-blue-600">{formatCurrency(Number(form.amount) || 0)}</span>
                </div>
                <div className="flex justify-between py-2 bg-slate-50 px-3 rounded-xl">
                  <span className="text-slate-700 font-semibold">Remaining Due:</span>
                  <span className="text-lg font-black text-slate-900">{formatCurrency(remAfterPay)}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-100 p-6 text-xs text-emerald-900 space-y-2">
              <p className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> Real-time Reconciliation
              </p>
              <p className="leading-relaxed">
                If the disbursed amount equals the current outstanding balance, the settlement status automatically transitions to <strong>PAID</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading form...</div>}>
      <PaymentForm />
    </Suspense>
  );
}
