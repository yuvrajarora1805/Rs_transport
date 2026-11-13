'use client';

import React from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface SettlementSlipUploadProps {
  slipImage: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function SettlementSlipUpload({
  slipImage,
  onUpload,
  onRemove,
}: SettlementSlipUploadProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
        <FileText size={16} className="text-blue-600" />
        <span>Attach Settlement Voucher / Bilty Receipt (Photo)</span>
      </label>
      {slipImage ? (
        <div className="relative inline-block border border-blue-200 rounded-xl p-2 bg-slate-50">
          <img
            src={slipImage}
            alt="Settlement Slip"
            className="h-32 w-auto rounded-lg object-contain shadow-2xs"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-3 right-3 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xs transition-colors"
            title="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition-colors bg-white">
          <Upload size={22} className="text-slate-400 mb-1.5" />
          <span className="text-xs font-bold text-slate-700">Click to upload settlement voucher/slip image</span>
          <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
        </label>
      )}
    </div>
  );
}

