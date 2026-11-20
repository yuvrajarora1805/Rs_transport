'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, HardDrive } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface SyncData {
  isOnline: boolean;
  cloudSyncUrl: string | null;
  lastSyncedAt: string | null;
  pendingSyncCount: number;
}

export const SyncStatusBadge: React.FC = () => {
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch<SyncData>('/sync/status');
      if (res) setSyncData(res);
    } catch {
      // If endpoint not reachable yet, default to local offline mode
      setSyncData({
        isOnline: false,
        cloudSyncUrl: null,
        lastSyncedAt: null,
        pendingSyncCount: 0,
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await apiFetch<{ success: boolean; message: string }>('/sync/trigger', {
        method: 'POST',
      });
      if (res) {
        alert(res.message);
        await fetchStatus();
      }
    } catch (err: any) {
      alert(`Sync notice: ${err.message || 'Running in local mode'}`);
    } finally {
      setSyncing(false);
    }
  };

  const isLocalOnly = !syncData?.cloudSyncUrl;
  const isOnline = syncData?.isOnline;
  const pending = syncData?.pendingSyncCount || 0;

  return (
    <button
      onClick={handleSync}
      title={
        isLocalOnly
          ? 'Running in Dedicated Local Mode (Zero internet required)'
          : isOnline
          ? `Connected to Cloud Server. Last synced: ${syncData?.lastSyncedAt || 'Never'}`
          : 'Offline Mode: Transactions are queued locally and will sync when reconnected'
      }
      className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
        isLocalOnly
          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          : isOnline
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
      }`}
    >
      {syncing ? (
        <RefreshCw size={13} className="animate-spin text-blue-600" />
      ) : isLocalOnly ? (
        <HardDrive size={13} className="text-slate-500" />
      ) : isOnline ? (
        <Cloud size={13} className="text-emerald-600" />
      ) : (
        <CloudOff size={13} className="text-amber-600" />
      )}

      <span>
        {isLocalOnly
          ? 'Local Offline DB'
          : isOnline
          ? pending > 0
            ? `${pending} Pending Sync`
            : 'Cloud Synced'
          : `${pending} Queued Offline`}
      </span>
    </button>
  );
};
