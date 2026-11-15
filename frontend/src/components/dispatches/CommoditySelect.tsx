'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Tag } from 'lucide-react';

const DEFAULT_PRODUCTS = ['Cotton Bales', 'Rice', 'Paddy', 'Wheat', 'Mustard', 'Barseem'];
const STORAGE_KEY = 'rs_transport_custom_products';

interface CommoditySelectProps {
  material: string;
  onMaterialChange: (val: string) => void;
}

export function CommoditySelect({ material, onMaterialChange }: CommoditySelectProps) {
  const [customList, setCustomList] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProductInput, setNewProductInput] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCustomList(parsed);
      }
    } catch {}
  }, []);

  const allProducts = Array.from(new Set([...DEFAULT_PRODUCTS, ...customList, ...(material ? [material] : [])]));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setIsAdding(true);
      setNewProductInput('');
    } else {
      setIsAdding(false);
      onMaterialChange(val);
    }
  };

  const handleSaveNewProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newProductInput.trim();
    if (!trimmed) return;

    // Capitalize first letter of each word nicely
    const formatted = trimmed
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    if (!DEFAULT_PRODUCTS.includes(formatted) && !customList.includes(formatted)) {
      const updated = [...customList, formatted];
      setCustomList(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    onMaterialChange(formatted);
    setIsAdding(false);
    setNewProductInput('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-bold text-slate-800">
          Commodity / Product *
        </label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <Plus size={13} /> Add Custom Product
          </button>
        )}
      </div>

      {!isAdding ? (
        <div className="flex gap-2">
          <select
            value={allProducts.includes(material) ? material : allProducts[0]}
            onChange={handleSelectChange}
            className="w-full h-11 px-4 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-900"
          >
            <optgroup label="Standard Products">
              {DEFAULT_PRODUCTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </optgroup>
            {customList.length > 0 && (
              <optgroup label="Custom Added Products">
                {customList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </optgroup>
            )}
            <option value="__ADD_NEW__" className="text-blue-600 font-bold">
              + Add New Custom Product...
            </option>
          </select>
        </div>
      ) : (
        <form onSubmit={handleSaveNewProduct} className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              required
              placeholder="e.g. Soyabean, Maize, Cotton Seed..."
              value={newProductInput}
              onChange={(e) => setNewProductInput(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-sm font-semibold border-2 border-blue-500 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Check size={15} /> Add to List
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewProductInput('');
            }}
            className="px-3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
