'use client';

import React from 'react';
import { Users, X, Check, AlertCircle } from 'lucide-react';

interface QuickAddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { name: string; contactNo: string };
  onChange: (field: 'name' | 'contactNo', val: string) => void;
  loading: boolean;
  error: string | null;
}

export function QuickAddPartyModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  onChange,
  loading,
  error,
}: QuickAddPartyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Add New Party</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Party / Mill Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HARLOVELEEN, SHREE CEMENT"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value.toUpperCase())}
              className="w-full h-10 px-3 text-sm uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              placeholder="e.g. 9829012345"
              value={form.contactNo}
              onChange={(e) => onChange('contactNo', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Check size={14} />
              {loading ? 'Adding...' : 'Add & Select'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

