'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { useMobileNav } from '../../context/MobileNavContext';
import {
  LayoutDashboard, Truck, Send, Navigation, Fuel, CreditCard,
  FileCheck2, Receipt, FileText, Settings, Database, Building2,
  MapPin, Users, Briefcase, LogOut, ArrowLeftRight, X,
} from 'lucide-react';

interface NavItem { name: string; href: string; icon: React.ReactNode; }

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={19} /> },
      { name: 'Dispatches', href: '/dispatches', icon: <Send size={19} /> },
      { name: 'Trips & Freight', href: '/trips', icon: <Navigation size={19} /> },
      { name: 'Fuel & Diesel', href: '/fuel', icon: <Fuel size={19} /> },
    ],
  },
  {
    title: 'ACCOUNTS & SETTLEMENT',
    items: [
      { name: 'Settlements', href: '/settlements', icon: <FileCheck2 size={19} /> },
      { name: 'Payments', href: '/payments', icon: <CreditCard size={19} /> },
      { name: 'Outstanding', href: '/outstanding', icon: <Receipt size={19} /> },
      { name: 'Pump Accounts', href: '/masters/pumps', icon: <Fuel size={19} /> },
      { name: 'Reports & Analytics', href: '/reports', icon: <FileText size={19} /> },
    ],
  },
  {
    title: 'MASTERS',
    items: [
      { name: 'Truck Master', href: '/masters/trucks', icon: <Truck size={19} /> },
      { name: 'Transporters', href: '/masters/transporters', icon: <Briefcase size={19} /> },
      { name: 'Sources Master', href: '/masters/sources', icon: <Building2 size={19} /> },
      { name: 'Destinations', href: '/masters/destinations', icon: <MapPin size={19} /> },
      { name: 'Parties', href: '/masters/parties', icon: <Users size={19} /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Excel Migration', href: '/migration', icon: <Database size={19} /> },
      { name: 'Settings', href: '/settings', icon: <Settings size={19} /> },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { activeCompany, toggleCompany } = useCompany();
  const { isOpen, close } = useMobileNav();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const initials = mounted && user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : mounted && user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD';

  const isRanbir = activeCompany.code === 'RANBIR_LOGISTICS';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity animate-in fade-in"
        />
      )}

      {/* Responsive Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-800 text-slate-100 flex flex-col shrink-0 border-r border-slate-700 shadow-xl lg:shadow-md lg:static lg:h-screen lg:top-0 lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 lg:h-20 flex items-center justify-between px-5 lg:px-6 border-b border-slate-700 bg-slate-850">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center font-black text-white text-base lg:text-lg shadow-sm transition-colors ${
                isRanbir ? 'bg-emerald-600 ring-2 ring-emerald-400/30' : 'bg-blue-600 ring-2 ring-blue-400/30'
              }`}
            >
              {activeCompany.initials}
            </div>
            <div className="truncate">
              <h1 className="font-bold text-white tracking-wide text-xs lg:text-sm truncate leading-tight">
                {activeCompany.name}
              </h1>
              <p className={`text-[10px] lg:text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                isRanbir ? 'text-emerald-400' : 'text-blue-300'
              }`}>
                {activeCompany.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleCompany}
              title="Switch Firm"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors shrink-0"
            >
              <ArrowLeftRight size={15} />
            </button>
            <button
              onClick={close}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg lg:hidden transition-colors"
              title="Close Navigation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navSections.map((sec) => (
            <div key={sec.title}>
              <p className={`px-3 text-[11px] font-bold uppercase tracking-wider mb-2 transition-colors ${
                isRanbir ? 'text-emerald-400' : 'text-blue-300'
              }`}>
                {sec.title}
              </p>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                        isActive
                          ? isRanbir ? 'bg-emerald-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-200 hover:text-white hover:bg-slate-700/80'
                      }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-300'}>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3.5 border-t border-slate-700 bg-slate-850">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-700/60 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs lg:text-sm font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-xs lg:text-sm font-bold text-white truncate">
                  {mounted ? (user?.fullName || user?.username || 'Administrator') : 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-300 truncate">
                  {mounted ? (user?.role || 'SUPER_ADMIN') : 'SUPER_ADMIN'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
