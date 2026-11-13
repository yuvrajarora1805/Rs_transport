'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';

interface FuelReceiptUploadProps {
  slipImage: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function FuelReceiptUpload({
  slipImage,
  onUpload,
  onRemove,
}: FuelReceiptUploadProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-800 mb-2">
        Attach Fuel Receipt / Photo (Optional)
      </label>
      {slipImage ? (
        <div className="relative inline-block border border-blue-200 rounded-xl p-2 bg-slate-50">
          <img
            src={slipImage}
            alt="Fuel Receipt"
            className="h-32 w-auto rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-3 right-3 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xs"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition-colors bg-white">
          <Upload size={24} className="text-slate-400 mb-2" />
          <span className="text-sm font-bold text-slate-700">Click to upload fuel receipt image</span>
          <span className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</span>
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

