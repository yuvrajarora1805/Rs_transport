import type { Metadata } from 'next';
import './globals.css';
import React, { Suspense } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CompanyProvider } from '../context/CompanyContext';
import { MobileNavProvider } from '../context/MobileNavContext';
import { AppShell } from '../components/layout/AppShell';
import { PerformancePolyfill } from '../components/common/PerformancePolyfill';

export const metadata: Metadata = {
  title: 'RS Transport & Ranbir Logistics ERP',
  description: 'Enterprise Transport Management, Settlement, and Petrol Pump Accounting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-100">
      <body className="h-full bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
        <PerformancePolyfill />
        <AuthProvider>
          <CompanyProvider>
            <MobileNavProvider>
              <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
                <AppShell>{children}</AppShell>
              </Suspense>
            </MobileNavProvider>
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
