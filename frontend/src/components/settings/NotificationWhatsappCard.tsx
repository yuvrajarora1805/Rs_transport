'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export function NotificationWhatsappCard() {
  const [phones, setPhones] = useState<{ id: string; phone: string }[]>([]);
  const [input, setInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const loadPhones = async () => {
    try {
      const res = await apiFetch<{ id: string; phone: string }[]>('/alerts/whatsapp');
      if (Array.isArray(res)) setPhones(res);
    } catch {}
  };

  useEffect(() => {
    loadPhones();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setStatusMsg('');
    try {
      await apiFetch('/alerts/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ phone: input.trim() }),
      });
      setInput('');
      setStatusMsg('WhatsApp number saved!');
      loadPhones();
    } catch (err: any) {
      setStatusMsg(err?.message || 'Failed to save number');
    }
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/alerts/whatsapp/${id}`, { method: 'DELETE' });
    loadPhones();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 mt-6">
      <div className="flex items-center gap-2">
        <MessageSquare size={18} className="text-emerald-600" />
        <h2 className="text-base font-bold text-slate-900">WhatsApp Alert Recipients (OpenWA)</h2>
      </div>
      <p className="text-xs text-slate-500">
        All 10-digit WhatsApp numbers listed below will receive instant Dispatch, Trip, and 7:00 PM EOD alerts via OpenWA.
      </p>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="tel"
          required
          placeholder="Add 10-digit WhatsApp number (e.g. 9829012345)"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1"
        >
          <Plus size={15} /> Add
        </button>
      </form>
      {statusMsg && <p className="text-xs font-semibold text-emerald-600">{statusMsg}</p>}
      <div className="divide-y divide-slate-100">
        {phones.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No WhatsApp recipients added yet.</p>
        ) : (
          phones.map((item) => (
            <div key={item.id} className="py-2 flex items-center justify-between">
              <span className="text-sm text-slate-800">+{item.phone}</span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                title="Remove number"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
