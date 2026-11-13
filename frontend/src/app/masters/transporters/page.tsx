'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { ConfirmDeleteModal } from '../../../components/ui/ConfirmDeleteModal';
import { AddTransporterModal } from '../../../components/masters/AddTransporterModal';
import { apiFetch } from '../../../lib/api';
import { Transporter } from '../../../types';
import { PlusCircle, Trash2, Phone, MapPin, Briefcase, AlertCircle } from 'lucide-react';

export default function TransportersPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', contactNo: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Transporter | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadTransporters = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<Transporter[]>('/masters/transporters');
      setTransporters(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load transporters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransporters(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Transporter name is required');
    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch('/masters/transporters', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim().toUpperCase(),
          contactNo: form.contactNo.trim() || undefined,
          address: form.address.trim() || undefined,
        }),
      });
      setShowAddModal(false);
      setForm({ name: '', contactNo: '', address: '' });
      await loadTransporters();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create transporter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/masters/transporters/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadTransporters();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transporter');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Transporter>[] = [
    {
      key: 'name',
      header: 'Transporter Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs">
            <Briefcase size={15} />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{row.name}</span>
            <span className="text-[11px] text-slate-400">ID: {row.id.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contactNo',
      header: 'Contact Number',
      render: (row) => {
        const phone = row.contactNo || (row as any).contact_no;
        return phone ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Phone size={13} className="text-slate-400" /> {phone}
          </span>
        ) : <span className="text-slate-400 text-xs">-</span>;
      },
    },
    {
      key: 'address',
      header: 'Address / Hub',
      render: (row) =>
        row.address ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin size={13} className="text-slate-400" /> {row.address}
          </span>
        ) : <span className="text-slate-400 text-xs">-</span>,
    },
    {
      key: 'truck_count',
      header: 'Assigned Trucks',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
          {Number((row as any).truck_count || 0)} trucks
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setDeleteTarget(row)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Delete Transporter"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="pb-16">
      <Header
        title="Transporters Master"
        subtitle="Manage logistics companies, fleet owners & freight transporters"
        actions={
          <button
            onClick={() => { setFormError(null); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <PlusCircle size={17} />
            <span>Add Transporter</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl 2xl:max-w-screen-2xl">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
            <AlertCircle size={18} /><span>{error}</span>
          </div>
        )}

        <DataTable
          columns={columns}
          data={transporters}
          searchKey="name"
          searchPlaceholder="Search transporters by name..."
          emptyMessage="No transporters found. Click 'Add Transporter' to register one."
          enableDateFilter={false}
        />
      </div>

      <AddTransporterModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
        form={form}
        onChange={(f, v) => setForm((prev) => ({ ...prev, [f]: v }))}
        submitting={submitting}
        formError={formError}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Transporter"
        message="Are you sure you want to delete this transporter from the master list?"
        itemName={deleteTarget?.name}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
