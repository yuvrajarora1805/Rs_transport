'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Upload, X, FileText, Clipboard, Check } from 'lucide-react';

interface SettlementSlipUploadProps {
  slipImage: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onImagePasted?: (base64: string) => void;
}

export function SettlementSlipUpload({
  slipImage,
  onUpload,
  onRemove,
  onImagePasted,
}: SettlementSlipUploadProps) {
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files (PNG, JPG, WebP) are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Slip image must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (onImagePasted) {
        onImagePasted(base64);
      }
      setPasteNotice('Image pasted from clipboard!');
      setTimeout(() => setPasteNotice(null), 3000);
    };
    reader.readAsDataURL(file);
  }, [onImagePasted]);

  // Global Ctrl + V Paste Listener
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

  // Clickable "Paste from Clipboard" button using Clipboard API
  const handlePasteClick = async () => {
    try {
      if (navigator.clipboard?.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            processImageFile(new File([blob], 'clipboard-slip.png', { type: imageType }));
            return;
          }
        }
      }
      alert('No image found in clipboard. Copy an image (or press Ctrl+V) to attach.');
    } catch {
      alert('Clipboard access prompt blocked. Please press Ctrl+V to paste the image directly.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <FileText size={16} className="text-blue-600" />
          <span>Attach Settlement Voucher / Bilty Receipt (Photo)</span>
        </label>
        {!slipImage && (
          <button
            type="button"
            onClick={handlePasteClick}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-2xs"
            title="Paste screenshot or copied image from clipboard (Ctrl+V)"
          >
            <Clipboard size={14} /> Paste from Clipboard (Ctrl+V)
          </button>
        )}
      </div>

      {pasteNotice && (
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-200">
          <Check size={14} /> {pasteNotice}
        </div>
      )}

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
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) processImageFile(file);
          }}
          className="relative"
        >
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition-colors bg-white group">
            <div className="flex items-center gap-2 mb-2">
              <Upload size={22} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-slate-300 font-bold">•</span>
              <Clipboard size={22} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
              Click to upload, drag & drop, or press Ctrl+V to paste from clipboard
            </span>
            <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</span>
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
}
