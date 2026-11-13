'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { apiFetch, formatDate } from '../../../lib/api';
import { Truck } from '../../../types';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrucks() {
      try {
        const res = await apiFetch<Truck[]>('/masters/trucks');
        setTrucks(res || []);
      } catch (err) {
        console.warn('Notice while loading trucks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrucks();
  }, []);

  const columns: Column<Truck>[] = [
    {
      key: 'truckNo',
      header: 'Registration No',
      render: (row) => (
        <span className="font-bold text-slate-900 tracking-wide">
          {row.truckNo || (row as any).truck_no}
        </span>
      ),
    },
    {
      key: 'ownerName',
      header: 'Truck Owner (Malik)',
      render: (row) => row.ownerName || (row as any).owner_name || 'N/A',
    },
    {
      key: 'mobileNo',
      header: 'Mobile No',
      render: (row) => row.mobileNo || (row as any).mobile_no || '-',
    },
    {
      key: 'transporter',
      header: 'Transporter',
      render: (row) => row.transporter?.name || (row as any).transporter_name || 'Independent',
    },
    {
      key: 'capacity',
      header: 'Capacity (MT)',
      render: (row) => (row.capacity || (row as any).capacity ? `${row.capacity || (row as any).capacity} MT` : '-'),
    },
    {
      key: 'createdAt',
      header: 'Registered On',
      render: (row) => formatDate(row.createdAt || (row as any).created_at),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive !== false ? 'success' : 'neutral'}>
          {row.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Profile',
      render: (row) => (
        <Link
          href={`/masters/trucks/${row.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Ledger →
        </Link>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <Header
        title="Truck Master Directory"
        subtitle="Permanent Vehicle Master, Ownership & Transporter Affiliations"
        actions={
          <Link
            href="/masters/trucks/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle size={14} /> Register New Truck
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full">
        <DataTable
          columns={columns}
          data={trucks}
          searchKey="truckNo"
          searchPlaceholder="Search registration or owner..."
          emptyMessage="No trucks registered yet"
        />
      </div>
    </div>
  );
}

