'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { DataTable, Column } from '../../components/ui/DataTable';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api';
import { Settlement } from '../../types';
import { Download, Printer } from 'lucide-react';

export default function ReportsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await apiFetch<Settlement[]>('/settlements');
        setSettlements(res || []);
      } catch (err) {
        console.warn('Notice while loading reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const exportCSV = () => {
    const headers = 'Trip No,Truck No,Destination,Gross Freight,Advance,Diesel,Commission,Net Payable,Paid,Outstanding\n';
    const rows = settlements
      .map(
        (s: any) =>
          `"${s.trip_no || s.trip?.tripNo}","${s.truck_no || s.trip?.truck?.truckNo}","${s.destination_name || s.trip?.destination?.name || ''}",${s.gross_freight || s.grossFreight},${s.advance_amount || s.advanceAmount},${s.diesel_amount || s.dieselAmount},${s.commission},${s.net_payable || s.netPayable},${s.total_paid || s.totalPaid},${s.outstanding}`,
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlement_register_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns: Column<Settlement>[] = [
    { key: 'tripNo', header: 'Trip No', render: (row: any) => row.trip_no || row.trip?.tripNo },
    { key: 'truckNo', header: 'Truck No', render: (row: any) => row.truck_no || row.trip?.truck?.truckNo },
    { key: 'dest', header: 'Destination', render: (row: any) => row.destination_name || row.trip?.destination?.name || '-' },
    { key: 'gross', header: 'Gross Freight', render: (row: any) => formatCurrency(Number(row.gross_freight || row.grossFreight)) },
    { key: 'diesel', header: 'Diesel (₹)', render: (row: any) => formatCurrency(Number(row.diesel_amount || row.dieselAmount)) },
    { key: 'advance', header: 'Advance (₹)', render: (row: any) => formatCurrency(Number(row.advance_amount || row.advanceAmount)) },
    { key: 'net', header: 'Net Payable', render: (row: any) => <span className="font-bold">{formatCurrency(Number(row.net_payable || row.netPayable))}</span> },
    { key: 'paid', header: 'Paid', render: (row: any) => formatCurrency(Number(row.total_paid || row.totalPaid)) },
    {
      key: 'out',
      header: 'Outstanding',
      render: (row: any) => {
        const out = Number(row.outstanding || 0);
        return <span className={`font-bold ${out > 0 ? 'text-rose-600' : 'text-slate-500'}`}>{formatCurrency(out)}</span>;
      },
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Reports & Analytics Center"
        subtitle="Operational Registers, Financial Audits & Excel / CSV Statements"
        actions={
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Printer size={14} /> Print Register
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={settlements}
          searchKey="tripNo"
          searchPlaceholder="Search trip register..."
          emptyMessage="No settlement records for reporting"
        />
      </div>
    </div>
  );
}

