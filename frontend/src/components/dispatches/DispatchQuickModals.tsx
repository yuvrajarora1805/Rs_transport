'use client';

import React from 'react';
import { QuickAddTruckModal } from './QuickAddTruckModal';
import { QuickAddSourceModal } from './QuickAddSourceModal';
import { QuickAddDestModal } from './QuickAddDestModal';

interface DispatchQuickModalsProps {
  modals: { truck: boolean; source: boolean; dest: boolean };
  onClose: (key: 'truck' | 'source' | 'dest') => void;
  onAddTruck: (e: React.FormEvent) => void;
  newTruckForm: { truckNo: string; ownerName: string; truckType: string };
  setNewTruckForm: React.Dispatch<React.SetStateAction<{ truckNo: string; ownerName: string; truckType: string }>>;
  onAddSource: (e: React.FormEvent) => void;
  newSourceForm: { name: string; contactNo: string };
  setNewSourceForm: React.Dispatch<React.SetStateAction<{ name: string; contactNo: string }>>;
  onAddDest: (e: React.FormEvent) => void;
  newDestForm: { name: string; state: string };
  setNewDestForm: React.Dispatch<React.SetStateAction<{ name: string; state: string }>>;
  modalLoading: boolean;
  modalError: string | null;
}

export function DispatchQuickModals({
  modals,
  onClose,
  onAddTruck,
  newTruckForm,
  setNewTruckForm,
  onAddSource,
  newSourceForm,
  setNewSourceForm,
  onAddDest,
  newDestForm,
  setNewDestForm,
  modalLoading,
  modalError,
}: DispatchQuickModalsProps) {
  return (
    <>
      <QuickAddTruckModal
        isOpen={modals.truck}
        onClose={() => onClose('truck')}
        onSubmit={onAddTruck}
        form={newTruckForm}
        onChange={(f, v) => setNewTruckForm((prev) => ({ ...prev, [f]: v }))}
        loading={modalLoading}
        error={modalError}
      />
      <QuickAddSourceModal
        isOpen={modals.source}
        onClose={() => onClose('source')}
        onSubmit={onAddSource}
        form={newSourceForm}
        onChange={(f, v) => setNewSourceForm((prev) => ({ ...prev, [f]: v }))}
        loading={modalLoading}
        error={modalError}
      />
      <QuickAddDestModal
        isOpen={modals.dest}
        onClose={() => onClose('dest')}
        onSubmit={onAddDest}
        form={newDestForm}
        onChange={(f, v) => setNewDestForm((prev) => ({ ...prev, [f]: v }))}
        loading={modalLoading}
        error={modalError}
      />
    </>
  );
}

