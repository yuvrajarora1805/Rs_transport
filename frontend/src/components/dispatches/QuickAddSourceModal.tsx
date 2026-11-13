'use client';

import React from 'react';
import { Plus, X, Building2 } from 'lucide-react';

interface QuickAddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { name: string; contactNo: string };
  onChange: (field: 'name' | 'contactNo', val: string) => void;
  loading: boolean;
  error: string | null;
}

export function QuickAddSourceModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  onChange,
  loading,
  error,
}: QuickAddSourceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Add New Booking Source</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Source / Agent Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. BITTU BRAR, DSBC..."
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number (Optional)</label>
            <input
              type="tel"
              placeholder="e.g. 9812345678"
              value={form.contactNo}
              onChange={(e) => onChange('contactNo', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

