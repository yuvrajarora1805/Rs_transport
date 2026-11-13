'use client';

import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Database, ShieldCheck, Palette, Building2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('RS Transport Company');
  const [address, setAddress] = useState('New Grain Market, Mandi Road');
  const [contact, setContact] = useState('+91 98765 43210');
  const [selectedTheme, setSelectedTheme] = useState('slate');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="pb-12">
      <Header
        title="System Settings"
        subtitle="Configure company details, database parameters & UI preferences"
      />

      <div className="p-8 space-y-6 w-full">
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
            Settings updated successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Company Profile */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Company Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Primary Phone / Mobile</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Registered Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Database & Engine */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database size={18} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Database Engine Configuration</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Engine</span>
                <span className="font-bold text-slate-800">MySQL / MariaDB</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Database Name</span>
                <span className="font-bold text-slate-800">rs_transport_db</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Driver</span>
                <span className="font-bold text-slate-800">mysql2/promise</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Port</span>
                <span className="font-bold text-slate-800">3306</span>
              </div>
            </div>
          </div>

          {/* UI Color Palette Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Palette size={18} className="text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800">Sidebar Medium-Dark Shade</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'slate', name: 'Medium Slate', color: 'bg-slate-800', desc: 'Comfortable slate with high contrast' },
                { id: 'navy', name: 'Navy Steel', color: 'bg-[#182234]', desc: 'Deep executive navy tone' },
                { id: 'charcoal', name: 'Charcoal Grey', color: 'bg-[#27272a]', desc: 'Balanced neutral dark tone' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    selectedTheme === t.id
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md shrink-0 mt-0.5 ${t.color}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t.name}</p>
                    <p className="text-[11px] text-slate-500">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <Save size={16} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

