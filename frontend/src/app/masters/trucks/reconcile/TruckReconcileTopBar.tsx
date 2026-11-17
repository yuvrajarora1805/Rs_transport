'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Upload, ArrowLeft } from 'lucide-react';

interface Props {
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TruckReconcileTopBar: React.FC<Props> = ({
  uploading,
  fileInputRef,
  handleFileUpload,
}) => {
  return (
    <>
      <Header
        title="Truck Data Match & Party Summary"
        subtitle="Fetch truck list, match workbook data, and summarize deliveries sorted party-wise"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/masters/trucks"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ArrowLeft size={14} /> Back to Trucks
            </Link>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? 'Analyzing Excel...' : 'Upload Excel File'}
            </button>
          </div>
        }
      />
    </>
  );
};
