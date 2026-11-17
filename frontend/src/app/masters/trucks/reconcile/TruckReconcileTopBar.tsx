'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Upload, ArrowLeft, FileSpreadsheet } from 'lucide-react';

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
    <div className="space-y-4">
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
              {uploading ? 'Analyzing Excel...' : 'Upload Excel File (.xlsx)'}
            </button>
          </div>
        }
      />

      {/* Prominent Upload Banner */}
      <div className="mx-4 sm:mx-6 lg:mx-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-2 border-dashed border-blue-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Upload & Analyze Excel Workbook</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Select any file such as <code className="bg-white/80 px-1.5 py-0.5 rounded text-blue-700 font-semibold border border-blue-200">TRUCK DETAILS (2).xlsx</code> to extract all booking sources, match truck numbers, and view party-wise delivery balances.
            </p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 disabled:opacity-50"
        >
          <Upload size={16} />
          {uploading ? 'Analyzing Workbook...' : 'Choose Excel File to Upload'}
        </button>
      </div>
    </div>
  );
};
