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
    { key: 'destination', header: 'Destination', render: (row) => row.destination || '-' },
    { key: 'bales', header: 'Bales', render: (row) => row.bales || '-' },
    { key: 'date', header: 'Date', render: (row) => row.date || '-' },
    { key: 'mobileNo', header: 'Contact', render: (row) => row.mobileNo || '-' },
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
      header: 'Action',
      render: (row) =>
        row.systemTruckId ? (
          <button
            onClick={() => onSelectTruck(row.truckNo)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Party Breakdown →
          </button>
        ) : (
          <Link
            href="/masters/trucks/new"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
          >
            + Register
          </Link>
        ),
    },
  ];

  return (
    <div className="space-y-4">
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
    </div>
  );
};
