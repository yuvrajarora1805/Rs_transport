'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Shield } from 'lucide-react';

export const MailSettingsCard: React.FC = () => {
  const [smtpHost] = useState('mail.omvky.com');
  const [smtpPort] = useState('465 (SSL)');
  const [smtpUser] = useState('noreply@omvky.com');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Email & SMTP Notification Service</h3>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 size={12} /> Configured & Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-slate-500 block mb-0.5">SMTP Server</span>
          <span className="font-bold text-slate-800">{smtpHost}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-slate-500 block mb-0.5">Port & Encryption</span>
          <span className="font-bold text-slate-800">{smtpPort}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-slate-500 block mb-0.5">Sender Email</span>
          <span className="font-bold text-slate-800">{smtpUser}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <Shield size={13} className="text-emerald-600 shrink-0" />
        <span>Credentials saved securely in system environment. Ready for settlement vouchers, trip dispatch notifications & reports.</span>
      </div>
    </div>
  );
};
