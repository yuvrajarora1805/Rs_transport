'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CompanyCode = 'RS_TRANSPORT' | 'RANBIR_LOGISTICS';

export interface CompanyInfo {
  code: CompanyCode;
  name: string;
  shortName: string;
  tagline: string;
  initials: string;
  theme: 'blue' | 'emerald';
  badgeColor: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  ringColor: string;
}

export const COMPANIES: Record<CompanyCode, CompanyInfo> = {
  RS_TRANSPORT: {
    code: 'RS_TRANSPORT',
    name: 'RS TRANSPORT COMPANY',
    shortName: 'RS Transport',
    tagline: 'ENTERPRISE ERP & LOGISTICS',
    initials: 'RS',
    theme: 'blue',
    badgeColor: 'bg-blue-600 text-white',
    accentBg: 'bg-blue-50 text-blue-700',
    accentText: 'text-blue-600',
    accentBorder: 'border-blue-600',
    ringColor: 'focus:ring-blue-500',
  },
  RANBIR_LOGISTICS: {
    code: 'RANBIR_LOGISTICS',
    name: 'RANBIR LOGISTICS',
    shortName: 'Ranbir Logistics',
    tagline: 'FLEET & CARGO OPERATIONS',
    initials: 'RL',
    theme: 'emerald',
    badgeColor: 'bg-emerald-600 text-white',
    accentBg: 'bg-emerald-50 text-emerald-700',
    accentText: 'text-emerald-600',
    accentBorder: 'border-emerald-600',
    ringColor: 'focus:ring-emerald-500',
  },
};

interface CompanyContextType {
  activeCompany: CompanyInfo;
  setCompany: (code: CompanyCode, reload?: boolean) => void;
  toggleCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType>({
  activeCompany: COMPANIES.RS_TRANSPORT,
  setCompany: () => {},
  toggleCompany: () => {},
});

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [activeCode, setActiveCode] = useState<CompanyCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rs_selected_company') as CompanyCode;
      if (stored && COMPANIES[stored]) return stored;
    }
    return 'RS_TRANSPORT';
  });

  const handleSetCompany = (code: CompanyCode, reload = true) => {
    setActiveCode(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rs_selected_company', code);
      if (reload) {
        window.location.reload();
      }
    }
  };

  const handleToggle = () => {
    const next: CompanyCode = activeCode === 'RS_TRANSPORT' ? 'RANBIR_LOGISTICS' : 'RS_TRANSPORT';
    handleSetCompany(next, true);
  };

  return (
    <CompanyContext.Provider
      value={{
        activeCompany: COMPANIES[activeCode],
        setCompany: handleSetCompany,
        toggleCompany: handleToggle,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}

