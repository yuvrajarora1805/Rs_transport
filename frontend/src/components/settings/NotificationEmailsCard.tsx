'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Mail, Plus, Trash2 } from 'lucide-react';

export function NotificationEmailsCard() {
  const [emails, setEmails] = useState<{ id: string; email: string }[]>([]);
  const [input, setInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const loadEmails = async () => {
    try {
      const res = await apiFetch<{ id: string; email: string }[]>('/alerts/emails');
      if (Array.isArray(res)) setEmails(res);
    } catch {}
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setStatusMsg('');
    try {
      await apiFetch('/alerts/emails', {
        method: 'POST',
        body: JSON.stringify({ email: input.trim() }),
      });
      setInput('');
      setStatusMsg('Recipient saved!');
      loadEmails();
    } catch (err: any) {
      setStatusMsg(err?.message || 'Failed to save email');
    }
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/alerts/emails/${id}`, { method: 'DELETE' });
    loadEmails();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 mt-6">
      <div className="flex items-center gap-2">
        <Mail size={18} className="text-blue-600" />
        <h2 className="text-base font-bold text-slate-900">7:00 PM EOD & Alert Email Recipients</h2>
      </div>
      <p className="text-xs text-slate-500">
        All email addresses listed below will automatically receive the 7:00 PM Daily Summary and Operational Alerts.
      </p>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Add recipient email (e.g. yuvrajarora1805@gmail.com)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1"
        >
          <Plus size={15} /> Add
        </button>
      </form>
      {statusMsg && <p className="text-xs font-semibold text-blue-600">{statusMsg}</p>}
      <div className="divide-y divide-slate-100">
        {emails.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No custom recipients added (default: rs@omvky.com).</p>
        ) : (
          emails.map((item) => (
            <div key={item.id} className="py-2 flex items-center justify-between">
              <span className="text-sm text-slate-800">{item.email}</span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                title="Remove email"
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

