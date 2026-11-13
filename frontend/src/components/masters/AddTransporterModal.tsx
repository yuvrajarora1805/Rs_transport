'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';

interface AddTransporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { name: string; contactNo: string; address: string };
  onChange: (field: string, value: string) => void;
  submitting: boolean;
  formError: string | null;
}

export function AddTransporterModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  onChange,
  submitting,
  formError,
}: AddTransporterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={18} className="text-blue-600" /> Add Transporter
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Transporter Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. RS TRANSPORT COMPANY"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full h-11 px-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={form.contactNo}
              onChange={(e) => onChange('contactNo', e.target.value)}
              className="w-full h-11 px-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address / Hub</label>
            <textarea
              rows={2}
              placeholder="Office address, city or hub location..."
              value={form.address}
              onChange={(e) => onChange('address', e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Transporter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

