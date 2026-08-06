import { Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Profile } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdmin() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile: me } = useAuth();

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch<{ users: Array<Profile & { email: string }> }>(`/profiles`);
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleAdmin(u: Profile & { email?: string }) {
    try {
      const updated = await apiFetch<{ user: any }>(`/profiles/${u.id}`, { method: 'PUT', body: { is_admin: !u.is_admin } });
      setUsers((s) => s.map(x => x.id === u.id ? { ...x, is_admin: updated.user.is_admin } : x));
    } catch (err) { console.error(err); }
  }

  async function setRole(u: Profile & { email?: string }, role: string) {
    try {
      const updated = await apiFetch<{ user: any }>(`/profiles/${u.id}/role`, { method: 'PUT', body: { role } });
      setUsers((s) => s.map(x => x.id === u.id ? { ...x, role: updated.user.role } : x));
    } catch (err) { console.error(err); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-primary-600" />
          <h1 className="text-2xl font-semibold">Super Admin — Manage Admins</h1>
        </div>
      </div>

      <div className="card p-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Admin</th>
                <th className="py-2">Role</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.full_name ?? '—'}</td>
                  <td className="py-2">{(u as any).email ?? '—'}</td>
                  <td className="py-2">{u.is_admin ? 'Yes' : 'No'}</td>
                  <td className="py-2">{u.role ?? 'user'}</td>
                  <td className="py-2 space-x-2">
                    <button disabled={me?.id === u.id} onClick={() => toggleAdmin(u as any)} className="btn-outline btn-sm">
                      {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                    <select
                      value={u.role ?? 'user'}
                      onChange={(e) => setRole(u as any, e.target.value)}
                      className="input input-sm"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
