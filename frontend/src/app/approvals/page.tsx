'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { CheckCircle2, XCircle, Clock, Activity, ShieldCheck, UserPlus, Trash2, Pencil } from 'lucide-react';

interface PendingItem {
  id: string;
  module: 'dispatches' | 'trips' | 'sources';
  ref_no: string;
  record_date: string;
  title: string;
  created_by: string;
  approval_status: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  username: string;
  action: string;
  module: string;
  record_id?: string;
  details?: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'approvals' | 'activity' | 'users' | 'alerts'>('approvals');
  const [alerts, setAlerts] = useState<any>({ fuelWithoutDispatch: [], dispatchesWithoutFuel: [], pendingPumpSettlements: [] });
  const [eod, setEod] = useState<any>(null);
  const [mailStatus, setMailStatus] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: 'MANAGER', assignedCompany: 'ALL' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userMsg, setUserMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, lRes, uRes, aRes, alRes, eodRes] = await Promise.allSettled([
        apiFetch('/approvals/pending'),
        apiFetch('/activity-logs?limit=100'),
        apiFetch('/auth/users'),
        apiFetch('/auth/access-requests'),
        apiFetch('/alerts'),
        apiFetch('/dashboard/eod-summary'),
      ]);
      if (pRes.status === 'fulfilled') {
        const pAny = (pRes.value || {}) as any;
        setPending([
          ...(pAny.dispatches || []),
          ...(pAny.trips || []),
          ...(pAny.sources || []),
        ]);
      }
      if (lRes.status === 'fulfilled') {
        setLogs(Array.isArray(lRes.value) ? lRes.value : []);
      }
      if (uRes.status === 'fulfilled') {
        setUsers(Array.isArray(uRes.value) ? uRes.value : []);
      } else {
        setUserMsg(uRes.reason?.message || 'Failed to load users list');
      }
      if (aRes.status === 'fulfilled') {
        setAccessRequests(Array.isArray(aRes.value) ? aRes.value : []);
      }
      if (alRes.status === 'fulfilled' && alRes.value) {
        setAlerts(alRes.value);
      }
      if (eodRes.status === 'fulfilled' && eodRes.value) {
        setEod(eodRes.value);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (module: string, id: string) => {
    await apiFetch(`/approvals/${module}/${id}/approve`, { method: 'POST' });
    fetchData();
  };

  const handleReject = async (module: string, id: string) => {
    await apiFetch(`/approvals/${module}/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Rejected by Admin' }),
    });
    fetchData();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg('');
    try {
      await apiFetch('/auth/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      setNewUser({ username: '', password: '', fullName: '', role: 'MANAGER', assignedCompany: 'ALL' });
      setUserMsg('User created successfully!');
      fetchData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to create user';
      setUserMsg(msg.includes('409') || msg.toLowerCase().includes('exists')
        ? 'Username already exists. Please choose a different username.'
        : msg);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Admin Approvals & Manager Activity
          </h1>
          <p className="text-sm text-slate-500">
            Review manager-submitted entries and monitor manager activity logs
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('approvals')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              tab === 'approvals' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Pending Approvals ({pending.length})
          </button>
          <button
            onClick={() => setTab('activity')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              tab === 'activity' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Manager Activity ({logs.length})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setTab('alerts')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              tab === 'alerts' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Alerts & 7PM EOD
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading...</div>
      ) : tab === 'approvals' ? (
        <div className="space-y-4">
          {accessRequests.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden divide-y divide-amber-100">
              <div className="px-4 py-2.5 bg-amber-100/70 text-xs font-bold text-amber-900 uppercase">
                Manager Time-Slot Unlock Requests ({accessRequests.length})
              </div>
              {accessRequests.map((reqItem) => (
                <div key={reqItem.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">@{reqItem.username} • Dashboard Unlock Request</p>
                    <p className="text-xs text-slate-600">{reqItem.reason} • {new Date(reqItem.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await apiFetch(`/auth/access-requests/${reqItem.id}/unlock`, { method: 'POST' });
                      fetchData();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Approve & Unlock (4h)
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {pending.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={32} />
              No pending manager entries awaiting approval.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map((item) => (
                <div key={`${item.module}-${item.id}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-amber-100 text-amber-800">
                        {item.module}
                      </span>
                      <span className="font-semibold text-slate-900">{item.ref_no || item.id.slice(0, 8)}</span>
                      <span className="text-sm text-slate-600">• {item.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> Submitted {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(item.module, item.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.module, item.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      ) : tab === 'activity' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Activity className="mx-auto mb-2 text-slate-400" size={32} />
              No manager activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{log.username}</span>
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-50 text-blue-700">
                        {log.action}
                      </span>
                      <span className="text-xs uppercase font-semibold text-slate-500">{log.module}</span>
                    </div>
                    {log.details && <p className="text-sm text-slate-600 mt-0.5">{log.details}</p>}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCreateUser} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600" /> Create User
            </h2>
            <input
              type="text"
              required
              placeholder="Username (e.g. manager1)"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.fullName}
              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="MANAGER">MANAGER (Today & Yesterday only)</option>
              <option value="ADMIN">ADMIN (Full Access)</option>
            </select>
            <select
              value={newUser.assignedCompany}
              onChange={(e) => setNewUser({ ...newUser, assignedCompany: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="ALL">All Firms (RS Transport & Ranbir)</option>
              <option value="RS_TRANSPORT">RS Transport Only</option>
              <option value="RANBIR_LOGISTICS">Ranbir Logistics Only</option>
            </select>
            {userMsg && <p className="text-xs font-semibold text-blue-600">{userMsg}</p>}
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
              Create User
            </button>
          </form>
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{u.full_name || u.username}</p>
                  <p className="text-xs text-slate-500">@{u.username}</p>
                  {u.role === 'MANAGER' && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <input
                        type="time"
                        defaultValue={u.access_start || '09:00'}
                        onBlur={async (e) => {
                          await apiFetch(`/auth/users/${u.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ fullName: u.full_name || u.username, role: u.role, accessStart: e.target.value, accessEnd: u.access_end || '19:00' }),
                          });
                          fetchData();
                        }}
                        className="px-2 py-0.5 border border-slate-300 rounded text-xs"
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <input
                        type="time"
                        defaultValue={u.access_end || '19:00'}
                        onBlur={async (e) => {
                          await apiFetch(`/auth/users/${u.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ fullName: u.full_name || u.username, role: u.role, accessStart: u.access_start || '09:00', accessEnd: e.target.value }),
                          });
                          fetchData();
                        }}
                        className="px-2 py-0.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.role === 'MANAGER' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role}
                  </span>
                  {u.role === 'MANAGER' && u.temp_unlocked_until && new Date(u.temp_unlocked_until) > new Date() && (
                    <button
                      type="button"
                      onClick={async () => {
                        await apiFetch(`/auth/users/${u.id}/lock`, { method: 'POST' });
                        fetchData();
                      }}
                      className="px-2.5 py-1 bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-semibold rounded-lg"
                    >
                      Revoke / Lock
                    </button>
                  )}
                  <button
                    type="button"
                    title="Edit User"
                    onClick={() => setEditingUser({ ...u, password: '' })}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    title="Delete User"
                    onClick={async () => {
                      await apiFetch(`/auth/users/${u.id}`, { method: 'DELETE' });
                      fetchData();
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">7:00 PM Daily End-of-Day Summary</h2>
              <p className="text-xs text-slate-500">
                Dispatches: {eod?.totalDispatches ?? 0} • Trucks: {eod?.totalTrucksDispatched ?? 0} • Trips: {eod?.totalTrips ?? 0} • Parties Done: {eod?.partiesDone ?? 0} • Settled: {eod?.settlementsCompleted ?? 0} • Pending Settlements: {eod?.pendingSettlements ?? 0}
              </p>
              {mailStatus && <p className="text-xs font-semibold text-emerald-600 mt-1">{mailStatus}</p>}
            </div>
            <button
              type="button"
              onClick={async () => {
                setMailStatus('Sending...');
                try {
                  await apiFetch('/alerts/send-eod-email', { method: 'POST', body: JSON.stringify({}) });
                  setMailStatus('EOD Summary & Alerts email sent!');
                } catch (e: any) {
                  setMailStatus(e?.message || 'Failed to send email');
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
            >
              Send EOD Email Now
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-amber-200 p-4">
              <h3 className="font-bold text-amber-900 text-sm mb-2">Dispatches Without Diesel ({alerts.dispatchesWithoutFuel?.length || 0})</h3>
              {(alerts.dispatchesWithoutFuel || []).slice(0, 8).map((d: any) => (
                <p key={d.id} className="text-xs text-slate-600 py-1 border-b border-slate-100">{d.truck_no} • {d.source_name}</p>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-rose-200 p-4">
              <h3 className="font-bold text-rose-900 text-sm mb-2">Diesel Without Dispatch ({alerts.fuelWithoutDispatch?.length || 0})</h3>
              {(alerts.fuelWithoutDispatch || []).slice(0, 8).map((f: any) => (
                <p key={f.id} className="text-xs text-slate-600 py-1 border-b border-slate-100">{f.truck_no} • ₹{f.amount}</p>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-blue-200 p-4">
              <h3 className="font-bold text-blue-900 text-sm mb-2">Pending Pump Settlements ({alerts.pendingPumpSettlements?.length || 0})</h3>
              {(alerts.pendingPumpSettlements || []).slice(0, 8).map((p: any) => (
                <p key={p.id} className="text-xs text-slate-600 py-1 border-b border-slate-100">{p.name} • ₹{p.balance}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900">Edit User @{editingUser.username}</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={editingUser.full_name || ''}
              onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="password"
              placeholder="New Password (leave blank to keep)"
              value={editingUser.password || ''}
              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <select
              value={editingUser.role || 'MANAGER'}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select
              value={editingUser.assigned_company || 'ALL'}
              onChange={(e) => setEditingUser({ ...editingUser, assigned_company: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="ALL">All Firms</option>
              <option value="RS_TRANSPORT">RS Transport</option>
              <option value="RANBIR_LOGISTICS">Ranbir Logistics</option>
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  await apiFetch(`/auth/users/${editingUser.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                      fullName: editingUser.full_name,
                      role: editingUser.role,
                      password: editingUser.password || undefined,
                      accessStart: editingUser.access_start || '09:00',
                      accessEnd: editingUser.access_end || '19:00',
                    }),
                  });
                  setEditingUser(null);
                  fetchData();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

