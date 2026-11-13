'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Truck, Source, Destination } from '../../types';

export function useDispatchModals(
  setTrucks: React.Dispatch<React.SetStateAction<Truck[]>>,
  setSources: React.Dispatch<React.SetStateAction<Source[]>>,
  setDestinations: React.Dispatch<React.SetStateAction<Destination[]>>,
  setSingleTruck: React.Dispatch<React.SetStateAction<any>>,
  setCommonForm: React.Dispatch<React.SetStateAction<any>>
) {
  const [modals, setModals] = useState({ truck: false, source: false, dest: false });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [newTruckForm, setNewTruckForm] = useState({ truckNo: '', ownerName: '', truckType: '12_WHEELER' });
  const [newSourceForm, setNewSourceForm] = useState({ name: '', contactNo: '' });
  const [newDestForm, setNewDestForm] = useState({ name: '', state: '' });

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruckForm.truckNo.trim()) return setModalError('Truck registration number required');
    setModalLoading(true);
    try {
      const created = await apiFetch<Truck>('/masters/trucks', {
        method: 'POST',
        body: JSON.stringify({
          truckNo: newTruckForm.truckNo.trim().toUpperCase(),
          ownerName: newTruckForm.ownerName.trim() || undefined,
          truckType: newTruckForm.truckType || undefined,
        }),
      });
      setTrucks((p) => [created, ...p]);
      setSingleTruck((p: any) => ({ ...p, truckId: created.id }));
      setModals((m) => ({ ...m, truck: false }));
    } catch (err: any) { setModalError(err.message); } finally { setModalLoading(false); }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceForm.name.trim()) return setModalError('Source name required');
    setModalLoading(true);
    try {
      const created = await apiFetch<Source>('/masters/sources', {
        method: 'POST',
        body: JSON.stringify({ name: newSourceForm.name.trim().toUpperCase(), contactNo: newSourceForm.contactNo.trim() || undefined }),
      });
      setSources((p) => [...p, created]);
      setCommonForm((p: any) => ({ ...p, sourceId: created.id }));
      setModals((m) => ({ ...m, source: false }));
    } catch (err: any) { setModalError(err.message); } finally { setModalLoading(false); }
  };

  const handleAddDest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestForm.name.trim()) return setModalError('Destination name required');
    setModalLoading(true);
    try {
      const created = await apiFetch<Destination>('/masters/destinations', {
        method: 'POST',
        body: JSON.stringify({ name: newDestForm.name.trim().toUpperCase(), state: newDestForm.state.trim() || undefined }),
      });
      setDestinations((p) => [...p, created]);
      setCommonForm((p: any) => ({ ...p, destination: created.name }));
      setModals((m) => ({ ...m, dest: false }));
    } catch (err: any) { setModalError(err.message); } finally { setModalLoading(false); }
  };

  return {
    modals, setModals, modalLoading, modalError, setModalError,
    newTruckForm, setNewTruckForm, handleAddTruck,
    newSourceForm, setNewSourceForm, handleAddSource,
    newDestForm, setNewDestForm, handleAddDest,
  };
}

