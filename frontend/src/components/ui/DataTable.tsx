'use client';

import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  emptyMessage?: string;
  dateKey?: keyof T;
  enableDateFilter?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search records...',
  emptyMessage = 'No records found',
  dateKey,
  enableDateFilter = true,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Auto-detect dateKey if not explicitly provided
  const effectiveDateKey = React.useMemo(() => {
    if (dateKey) return dateKey;
    if (data.length > 0) {
      const sample = data[0];
      const candidates = ['date', 'unloadingDate', 'unloading_date', 'createdAt', 'created_at', 'slipDate'];
      for (const k of candidates) {
        if (k in sample && sample[k]) return k as keyof T;
      }
    }
    return undefined;
  }, [data, dateKey]);

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // 1. Text search filter
      if (search && searchKey) {
        const val = item[searchKey];
        if (!String(val).toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
      }

      // 2. Date range filter
      if (effectiveDateKey && (startDate || endDate)) {
        const rawDate = item[effectiveDateKey] || (item as any)[String(effectiveDateKey).replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)];
        if (!rawDate) return false;

        const dateObj = new Date(rawDate);
        if (isNaN(dateObj.getTime())) return false;

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const itemDateStr = `${year}-${month}-${day}`;

        if (startDate && itemDateStr < startDate) {
          return false;
        }
        if (endDate && itemDateStr > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [data, search, searchKey, startDate, endDate, effectiveDateKey]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const hasActiveFilters = Boolean(search || startDate || endDate);

  const clearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs w-full">
      {(searchKey || (enableDateFilter && effectiveDateKey)) && (
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {searchKey && (
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-72 px-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
              />
            )}

            {enableDateFilter && effectiveDateKey && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 border border-slate-300 rounded-xl shadow-xs text-xs">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <span className="text-slate-500 font-medium">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:ring-0 p-0"
                />
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 font-medium">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:ring-0 p-0"
                />
              </div>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredData.length} of {data.length} records
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100/90 text-xs uppercase font-bold text-slate-700 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-500 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-base font-bold text-slate-800">{emptyMessage}</p>
                    <p className="text-sm text-slate-500">
                      {hasActiveFilters ? 'No records match the active date or search filters.' : 'New records will automatically appear in this register.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/90 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600 bg-slate-50/60">
          <span className="font-medium">
            Page {page} of {totalPages} ({filteredData.length} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 text-xs font-bold"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 text-xs font-bold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
