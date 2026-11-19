'use client';

import React from 'react';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { Badge } from '../../../../components/ui/Badge';
import { TruckReconcileFilters } from './TruckReconcileFilters';
import { TruckReconcileTableSummaryBar } from './TruckReconcileTableSummaryBar';
import { formatCurrency } from '../../../../lib/api';
import Link from 'next/link';

interface Props {
  data: any;
  trucksList: any[];
  partiesList: string[];
  filterSource: string;
  setFilterSource: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterParty: string;
  setFilterParty: (val: string) => void;
  loading: boolean;
  onReload: () => void;
  onSelectTruck: (truckNo: string) => void;
}

export const TruckReconcileTable: React.FC<Props> = ({
  data,
  trucksList,
  partiesList,
  filterSource,
  setFilterSource,
  filterStatus,
  setFilterStatus,
  filterParty,
  setFilterParty,
  loading,
  onReload,
  onSelectTruck,
}) => {
  const columns: Column<any>[] = [
    {
      key: 'truckNo',
      header: 'Truck No',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 tracking-wide">{row.truckNo}</span>
          {row.slipNo && <div className="text-[10px] text-slate-400">Slip #{row.slipNo}</div>}
        </div>
      ),
    },
    { key: 'source', header: 'Source / From', render: (row) => <span className="text-xs text-slate-600">{row.source}</span> },
    {
      key: 'destination',
      header: 'Destination / Party',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800 max-w-[200px] truncate" title={row.destination}>
            {row.destination || '-'}
          </div>
          {row.mobileNo && <div className="text-[11px] text-slate-400">{row.mobileNo}</div>}
        </div>
      ),
    },
    {
      key: 'excelWeight',
      header: 'Excel Qty / Wt',
      render: (row) => {
        const wt = Number(row.excelWeight || 0);
        const bales = Number(row.excelBales || 0);
        if (bales > 0 && wt > 0) return <span className="font-medium text-slate-700">{bales} B ({wt.toFixed(2)})</span>;
        if (wt > 0) return <span className="font-medium text-slate-700">{wt.toFixed(2)} Qtl</span>;
        if (bales > 0) return <span className="font-medium text-slate-700">{bales} Bales</span>;
        return <span className="text-slate-400">-</span>;
      },
    },
    {
      key: 'erpActivity',
      header: 'ERP Activity',
      render: (row) => {
        if (!row.isRegisteredInSystem) return <span className="text-slate-400">-</span>;
        const trips = Number(row.erpTrips || 0);
        const bales = Number(row.erpBales || 0);
        const wt = Number(row.erpNetWeight || 0);
        if (trips === 0 && bales === 0) return <span className="text-xs text-amber-600 italic">No trips yet</span>;
        return (
          <div className="text-xs">
            <span className="font-semibold text-slate-800">{trips} {trips === 1 ? 'Trip' : 'Trips'}</span>
            <div className="text-[11px] text-slate-500">
              {wt > 0 ? `${wt.toFixed(2)} MT` : ''} {bales > 0 ? `(${bales} Bales)` : ''}
            </div>
          </div>
        );
      },
    },
    {
      key: 'dbGrossFreight',
      header: 'Freight (ERP)',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          {row.isRegisteredInSystem && row.erpGrossFreight > 0 ? formatCurrency(row.erpGrossFreight) : '-'}
        </span>
      ),
    },
    {
      key: 'dbDiesel',
      header: 'Diesel (ERP)',
      render: (row) => (
        <span className="font-medium text-amber-700">
          {row.isRegisteredInSystem && row.erpDiesel > 0 ? formatCurrency(row.erpDiesel) : '-'}
        </span>
      ),
    },
    {
      key: 'dbPaid',
      header: 'Paid Amount',
      render: (row) => (
        <span className="font-semibold text-emerald-600">
          {row.isRegisteredInSystem && row.erpPaid > 0 ? formatCurrency(row.erpPaid) : '-'}
        </span>
      ),
    },
    {
      key: 'dbOutstanding',
      header: 'Outstanding Balance',
      render: (row) => {
        if (!row.isRegisteredInSystem) return <span className="text-slate-400">-</span>;
        const out = Number(row.erpOutstanding || 0);
        if (out > 0) {
          return (
            <span className="inline-block font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {formatCurrency(out)}
            </span>
          );
        }
        return <span className="font-semibold text-emerald-600">₹0.00</span>;
      },
    },
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
            href={`/masters/trucks/new?truckNo=${row.truckNo}`}
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
            filterParty={filterParty}
            setFilterParty={setFilterParty}
            sourcesBreakdown={data?.sourcesBreakdown || []}
            partiesList={partiesList}
            matchedCount={data?.matchedInSystem || 0}
            missingCount={data?.missingInSystem || 0}
            loading={loading}
            onReload={onReload}
          />

          <TruckReconcileTableSummaryBar
            trucksList={trucksList}
            filterParty={filterParty}
            filterSource={filterSource}
          />

          <DataTable
            columns={columns}
            data={trucksList}
            searchKey="truckNo"
            searchPlaceholder="Search truck number, source or destination..."
            emptyMessage={loading ? 'Reconciling Excel truck entries...' : 'No matching trucks found'}
            disablePagination={true}
            maxHeight="650px"
          />
        </>
      )}
    </div>
  );
};
