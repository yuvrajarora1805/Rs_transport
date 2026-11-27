'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { apiFetch } from '../../lib/api';
import { Loader2, Lock } from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [locked, setLocked] = React.useState(false);
  const [unlockedUntil, setUnlockedUntil] = React.useState<string | null>(null);
  const [unlockRequested, setUnlockRequested] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.replace('/login');
      } else if (isAuthenticated && isLoginPage) {
        router.replace('/dashboard');
      } else if (isAuthenticated && (user?.role as string) === 'MANAGER') {
        apiFetch<{ locked: boolean; tempUnlockedUntil?: string }>('/auth/access-status')
          .then((res) => {
            if (res && typeof res.locked === 'boolean') setLocked(res.locked);
            setUnlockedUntil(res?.tempUnlockedUntil || null);
          })
          .catch(() => {});
      } else {
        setLocked(false);
      }
    }
  }, [mounted, isAuthenticated, isLoading, isLoginPage, router, user?.role, pathname]);

  // If on login page, don't show the ERP layout sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // During SSR and before client mount, render consistent placeholder
  if (!mounted || isLoading || !isAuthenticated) {
    if (locked && (user?.role as string) === 'MANAGER') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Locked</h1>
          <p className="text-sm text-slate-600">
            Manager access requires daily Admin approval before viewing Dispatches, Trips, Trucks, or Sources.
          </p>
          {unlockRequested ? (
            <p className="text-xs font-semibold text-emerald-600">
              Unlock request sent to Admin! Please wait for approval.
            </p>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await apiFetch('/auth/request-access', { method: 'POST', body: JSON.stringify({ reason: 'Daily manager access request' }) });
                setUnlockRequested(true);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
            >
              Request Admin Unlock
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">Checking session...</p>
      </div>
    );
  }

  if (locked && (user?.role as string) === 'MANAGER') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Locked</h1>
          <p className="text-sm text-slate-600">
            Manager access requires daily Admin approval before viewing Dispatches, Trips, Trucks, or Sources.
          </p>
          {unlockRequested ? (
            <p className="text-xs font-semibold text-emerald-600">
              Unlock request sent to Admin! Please wait for approval.
            </p>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await apiFetch('/auth/request-access', { method: 'POST', body: JSON.stringify({ reason: 'Daily manager access request' }) });
                setUnlockRequested(true);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
            >
              Request Admin Unlock
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-100">
        {(user?.role as string) === 'MANAGER' && unlockedUntil && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between">
            <span>Manager Slot Active • Today & Yesterday View</span>
            <span>
              Remaining: {Math.max(0, Math.round((new Date(unlockedUntil).getTime() - Date.now()) / 60000))} min (until {new Date(unlockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};
