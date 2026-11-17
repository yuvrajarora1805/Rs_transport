'use client';

import React from 'react';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { Badge } from '../../../../components/ui/Badge';
import { TruckReconcileFilters } from './TruckReconcileFilters';
import Link from 'next/link';

interface Props {
  data: any;
  trucksList: any[];
  filterSource: string;
  setFilterSource: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  loading: boolean;
  onReload: () => void;
  onSelectTruck: (truckNo: string) => void;
}

export const TruckReconcileTable: React.FC<Props> = ({
  data,
  trucksList,
  filterSource,
  setFilterSource,
  filterStatus,
  setFilterStatus,
  loading,
  onReload,
  onSelectTruck,
}) => {
  const columns: Column<any>[] = [
    {
      key: 'truckNo',
      header: 'Truck No',
      render: (row) => <span className="font-bold text-slate-900 tracking-wide">{row.truckNo}</span>,
    },
    { key: 'source', header: 'Source', render: (row) => row.source },
    {
      key: 'destination',
      header: 'Destination / Party',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800">{row.destination || '-'}</div>
          {row.mobileNo && <div className="text-[11px] text-slate-400">{row.mobileNo}</div>}
        </div>
      ),
    },
    { key: 'bales', header: 'Bales', render: (row) => row.bales || '-' },
    { key: 'date', header: 'Date', render: (row) => row.date || '-' },
    {
      key: 'status',
      header: 'Registry Status',
      render: (row) =>
        row.isRegisteredInSystem ? (
          <Badge variant="success">REGISTERED</Badge>
        ) : (
          <Badge variant="danger">MISSING IN DB</Badge>
        ),
    },
    {
      key: 'action',
      header: 'Action / Party Activity',
      render: (row) =>
        row.systemTruckId ? (
          <button
            onClick={() => onSelectTruck(row.truckNo)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-xs font-semibold text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors"
          >
            Party Breakdown →
          </button>
        ) : (
          <Link
            href="/masters/trucks/new"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
          >
            + Register
          </Link>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {(!trucksList || trucksList.length === 0) && !loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <div className="text-sm font-semibold text-slate-700">No Excel file loaded</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click <b>&quot;Choose Separate Excel File&quot;</b> or <b>&quot;Upload Excel (.xlsx)&quot;</b> above to select a workbook to analyze.
          </p>
        </div>
      ) : (
        <>
          <TruckReconcileFilters
            filterSource={filterSource}
            setFilterSource={setFilterSource}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sourcesBreakdown={data?.sourcesBreakdown || []}
            matchedCount={data?.matchedInSystem || 0}
            missingCount={data?.missingInSystem || 0}
            loading={loading}
            onReload={onReload}
          />
          <DataTable
            columns={columns}
            data={trucksList}
            searchKey="truckNo"
            searchPlaceholder="Search truck number, source or destination..."
            emptyMessage={loading ? 'Reconciling Excel truck entries...' : 'No matching trucks found'}
          />
        </>
      )}
    </div>
  );
};
