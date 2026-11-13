'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Party, Transporter } from '../../types';

export function useTripModals(
  destinationId: string,
  setParties: React.Dispatch<React.SetStateAction<Party[]>>,
  setTransporters: React.Dispatch<React.SetStateAction<Transporter[]>>,
  setCommonForm: React.Dispatch<React.SetStateAction<any>>
) {
  // Party Modal
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [newPartyForm, setNewPartyForm] = useState({ name: '', contactNo: '' });
  const [newPartyLoading, setNewPartyLoading] = useState(false);
  const [newPartyError, setNewPartyError] = useState<string | null>(null);

  // Transporter Modal
  const [showAddTransporterModal, setShowAddTransporterModal] = useState(false);
  const [newTransporterForm, setNewTransporterForm] = useState({ name: '', contactNo: '', address: '' });
  const [newTransporterLoading, setNewTransporterLoading] = useState(false);
  const [newTransporterError, setNewTransporterError] = useState<string | null>(null);

  const handleQuickAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyForm.name.trim()) return setNewPartyError('Party name required');
    setNewPartyLoading(true);
    try {
      const created = await apiFetch<Party>('/masters/parties', {
        method: 'POST',
        body: JSON.stringify({
          name: newPartyForm.name.trim().toUpperCase(),
          contactNo: newPartyForm.contactNo.trim() || undefined,
          destinationId: destinationId || undefined,
        }),
      });
      setParties((p) => [...p, created]);
      setCommonForm((p: any) => ({ ...p, partyId: created.id }));
      setShowAddPartyModal(false);
      setNewPartyForm({ name: '', contactNo: '' });
    } catch (err: any) {
      setNewPartyError(err.message);
    } finally {
      setNewPartyLoading(false);
    }
  };

  const handleQuickAddTransporter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransporterForm.name.trim()) return setNewTransporterError('Transporter name required');
    setNewTransporterLoading(true);
    try {
      const created = await apiFetch<Transporter>('/masters/transporters', {
        method: 'POST',
        body: JSON.stringify({
          name: newTransporterForm.name.trim().toUpperCase(),
          contactNo: newTransporterForm.contactNo.trim() || undefined,
          address: newTransporterForm.address.trim() || undefined,
        }),
      });
      setTransporters((tr) => [...tr, created]);
      setCommonForm((p: any) => ({ ...p, transporterId: created.id }));
      setShowAddTransporterModal(false);
      setNewTransporterForm({ name: '', contactNo: '', address: '' });
    } catch (err: any) {
      setNewTransporterError(err.message);
    } finally {
      setNewTransporterLoading(false);
    }
  };

  return {
    showAddPartyModal, setShowAddPartyModal, newPartyForm, setNewPartyForm,
    newPartyLoading, newPartyError, setNewPartyError, handleQuickAddParty,
    showAddTransporterModal, setShowAddTransporterModal, newTransporterForm,
    setNewTransporterForm, newTransporterLoading, newTransporterError,
    setNewTransporterError, handleQuickAddTransporter,
  };
}

