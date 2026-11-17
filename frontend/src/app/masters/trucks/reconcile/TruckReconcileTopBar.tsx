'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Upload, ArrowLeft, FileSpreadsheet, SlidersHorizontal } from 'lucide-react';

interface Props {
  uploading: boolean;
  fileName?: string;
  showMappingModal: boolean;
  setShowMappingModal: (val: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TruckReconcileTopBar: React.FC<Props> = ({
  uploading,
  fileName,
  showMappingModal,
  setShowMappingModal,
  fileInputRef,
  handleFileUpload,
}) => {
  return (
    <div className="space-y-4">
      <Header
        title="Truck Data Match & Party Summary"
        subtitle="Upload any Excel file with optional manual column selection to match fleet data"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/masters/trucks"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ArrowLeft size={14} /> Back to Trucks
            </Link>
            <button
              onClick={() => setShowMappingModal(!showMappingModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <SlidersHorizontal size={14} className="text-blue-600" />
              Column Mapping (Manual)
            </button>
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
              {uploading ? 'Analyzing Excel...' : 'Upload Excel (.xlsx)'}
            </button>
          </div>
        }
      />

      <div className="mx-4 sm:mx-6 lg:mx-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-2 border-dashed border-blue-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Upload & Analyze Any Excel File</h4>
              {fileName && (
                <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  Active: {fileName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Automatic column detection active (detects Indian truck plates e.g. <code className="font-semibold text-slate-800">RJ07GC4818</code>). You can also click <b>Column Mapping (Manual)</b> to specify custom columns.
            </p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 disabled:opacity-50"
        >
          <Upload size={16} />
          {uploading ? 'Analyzing Workbook...' : 'Choose Separate Excel File'}
        </button>
      </div>
    </div>
  );
};
