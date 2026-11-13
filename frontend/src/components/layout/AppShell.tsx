'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Loader2 } from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = React.useState(false);

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
      }
    }
  }, [mounted, isAuthenticated, isLoading, isLoginPage, router]);

  // If on login page, don't show the ERP layout sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // During SSR and before client mount, render consistent placeholder
  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-100">
        {children}
      </main>
    </div>
  );
};
