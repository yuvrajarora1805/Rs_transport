'use client';

import React, { useEffect, useCallback } from 'react';
import { Upload, X, Clipboard } from 'lucide-react';

interface FuelReceiptUploadProps {
  slipImage: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onImagePasted?: (base64: string) => void;
}

export function FuelReceiptUpload({
  slipImage,
  onUpload,
  onRemove,
  onImagePasted,
}: FuelReceiptUploadProps) {
  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (onImagePasted) onImagePasted(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [onImagePasted]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processImageFile]);

  const handlePasteClick = async () => {
    try {
      if (navigator.clipboard?.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            processImageFile(new File([blob], 'fuel-receipt.png', { type: imageType }));
            return;
          }
        }
      }
      alert('Please press Ctrl+V to paste the image directly.');
    } catch {
      alert('Please press Ctrl+V to paste the image directly.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-bold text-slate-800">
          Attach Fuel Receipt / Photo (Optional)
        </label>
        {!slipImage && (
          <button
            type="button"
            onClick={handlePasteClick}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
          >
            <Clipboard size={13} /> Paste (Ctrl+V)
          </button>
        )}
      </div>
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
          <div className="flex items-center gap-2 mb-2">
            <Upload size={22} className="text-slate-400" />
            <span className="text-slate-300 font-bold">•</span>
            <Clipboard size={22} className="text-slate-400" />
          </div>
          <span className="text-sm font-bold text-slate-700">Click to upload or press Ctrl+V to paste</span>
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
