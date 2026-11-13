'use client';

import React from 'react';
import { Bell, Search, ArrowLeftRight, Menu } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useMobileNav } from '../../context/MobileNavContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const { activeCompany, toggleCompany } = useCompany();
  const { toggle } = useMobileNav();

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          type="button"
          onClick={toggle}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden border border-slate-200"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Company Switcher Pill */}
        <button
          onClick={toggleCompany}
          title={`Click to switch firm (Current: ${activeCompany.name})`}
          className={`flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-all ${
            activeCompany.code === 'RS_TRANSPORT'
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
          }`}
        >
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center font-black text-white text-[10px] sm:text-[11px] shadow-xs ${
              activeCompany.code === 'RS_TRANSPORT' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}
          >
            {activeCompany.initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="leading-tight font-bold tracking-tight">{activeCompany.name}</p>
            <p className="text-[10px] opacity-75 font-medium leading-none">Switch Firm</p>
          </div>
          <ArrowLeftRight size={13} className="opacity-60 ml-0.5 sm:ml-1" />
        </button>

        <div className="relative hidden xl:block">
          <Search size={17} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search trucks, trips, pumps..."
            className="pl-10 pr-4 h-10 text-sm bg-slate-50 border border-slate-200 rounded-xl w-64 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="p-2 sm:p-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors relative border border-slate-200">
          <Bell size={18} />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};
