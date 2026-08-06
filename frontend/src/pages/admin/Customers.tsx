import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Shield, ShieldCheck, Crown, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface CustomerRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
}

const PAGE_SIZE = 20;

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', Icon: Crown, badge: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400' },
  admin: { label: 'Admin', Icon: ShieldCheck, badge: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' },
  user: { label: 'User', Icon: Shield, badge: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400' },
} as const;

export default function AdminCustomers() {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ customer: CustomerRow; newRole: 'user' | 'admin' | 'super_admin' } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ users: CustomerRow[] }>(`/profiles`);
      let list = res.users ?? [];
      // client-side search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter((u) => (u.full_name ?? '').toLowerCase().includes(q) || (u.phone ?? '').toLowerCase().includes(q));
      }
      const totalCount = list.length;
      setTotal(totalCount);
      const start = page * PAGE_SIZE;
      const paged = list.slice(start, start + PAGE_SIZE);
      setCustomers(paged);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setCustomers([]);
      setTotal(0);
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  async function handleRoleChange(customer: CustomerRow, newRole: 'user' | 'admin' | 'super_admin') {
    setModalError(null);

    if (customer.role === newRole) {
      setConfirmModal(null);
      return;
    }

    if (customer.role === 'super_admin' && newRole !== 'super_admin' && customer.id === profile?.id) {
      setModalError('You cannot demote yourself. Ask another super admin to demote you.');
      return;
    }

    setUpdatingId(customer.id);
    try {
      // map role to is_admin flag
      const is_admin = newRole !== 'user';
      await apiFetch(`/profiles/${customer.id}`, { method: 'PUT', body: { is_admin } });
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, role: is_admin ? (newRole === 'super_admin' ? 'super_admin' : 'admin') : 'user', is_admin } : c)));
      setConfirmModal(null);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : String(err));
    }
    setUpdatingId(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Users size={24} /> Customers
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {total} total {total === 1 ? 'customer' : 'customers'}
          </p>
        </div>
        {isSuperAdmin && (
          <span className="badge bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 flex items-center gap-1">
            <Crown size={14} /> Role Management
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-start gap-2 text-sm text-error-700 dark:text-error-400">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by name or phone..."
          className="input pl-10"
        />
      </div>

      <div className="bg-white dark:bg-[#2e1547] rounded-xl shadow-sm border border-neutral-100 dark:border-primary-800/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-primary-800/40 text-left text-neutral-500 dark:text-neutral-400">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                {isSuperAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-12 text-center text-neutral-400">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-12 text-center text-neutral-400">No customers found</td></tr>
              ) : (
                customers.map(c => {
                  const { label: roleLabel, Icon: RoleIcon, badge: roleBadge } = ROLE_CONFIG[c.role] ?? ROLE_CONFIG.user;
                  return (
                    <tr key={c.id} className="border-b border-neutral-50 dark:border-primary-800/20 hover:bg-neutral-50 dark:hover:bg-[#3a1d5c] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-800/40 flex items-center justify-center text-primary-600 dark:text-primary-300 font-medium text-sm">
                              {(c.full_name ?? '?')[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-200">{c.full_name ?? 'Unknown'}</p>
                            {c.id === profile?.id && <span className="text-xs text-primary-500">(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{c.phone ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${roleBadge} flex items-center gap-1 w-fit`}>
                          <RoleIcon size={12} /> {roleLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3 text-right">
                          {updatingId === c.id ? (
                            <span className="text-xs text-neutral-400">Saving...</span>
                          ) : (
                            <button
                              onClick={() => setConfirmModal({ customer: c, newRole: c.role })}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                            >
                              Change Role
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-primary-800/40">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-neutral-200 dark:border-primary-800/40 text-neutral-600 dark:text-neutral-300 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-[#3a1d5c] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-neutral-200 dark:border-primary-800/40 text-neutral-600 dark:text-neutral-300 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-[#3a1d5c] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {!isSuperAdmin && (
        <p className="mt-4 text-sm text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
          <Shield size={14} /> Only super admins can change user roles.
        </p>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#2e1547] rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Change Role</h3>
              <button onClick={() => { setConfirmModal(null); setModalError(null); }} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Change role for <span className="font-medium text-neutral-900 dark:text-white">{confirmModal.customer.full_name ?? 'this user'}</span>:
            </p>

            <div className="space-y-2 mb-4">
              {(['super_admin', 'admin', 'user'] as const).map(role => {
                const { label, Icon: RoleIcon } = ROLE_CONFIG[role];
                const selected = confirmModal.newRole === role;
                const isSelf = confirmModal.customer.id === profile?.id;
                const isSelfDemotion = isSelf && confirmModal.customer.role === 'super_admin' && role !== 'super_admin';
                return (
                  <button
                    key={role}
                    onClick={() => { setConfirmModal(prev => prev ? { ...prev, newRole: role } : prev); setModalError(null); }}
                    disabled={isSelfDemotion}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      selected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-neutral-200 dark:border-primary-800/40 hover:border-neutral-300 dark:hover:border-primary-700'
                    } ${isSelfDemotion ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <RoleIcon size={18} className="text-neutral-500 dark:text-neutral-400" />
                    <span className="flex-1 text-left text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
                    {selected && <ShieldCheck size={16} className="text-primary-600 dark:text-primary-400" />}
                    {isSelfDemotion && <span className="text-xs text-neutral-400">Locked</span>}
                  </button>
                );
              })}
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-start gap-2 text-sm text-error-700 dark:text-error-400">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmModal(null); setModalError(null); }}
                className="flex-1 btn-secondary justify-center text-sm py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRoleChange(confirmModal.customer, confirmModal.newRole)}
                disabled={confirmModal.newRole === confirmModal.customer.role}
                className="flex-1 btn-primary justify-center text-sm py-2.5 disabled:opacity-50"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
