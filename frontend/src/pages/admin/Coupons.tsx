import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Percent, IndianRupee } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Coupon } from '../../types';

interface CouponForm {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  min_order_value: string;
  max_uses: string;
  is_active: boolean;
  expires_at: string;
}

const EMPTY: CouponForm = {
  code: '',
  type: 'percentage',
  value: '',
  min_order_value: '0',
  max_uses: '',
  is_active: true,
  expires_at: '',
};

export default function AdminCoupons() {
  const { profile, loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await apiFetch<{ coupons: Coupon[] }>(`/coupons`);
      setCoupons(res.coupons ?? []);
    } catch (err) {
      console.error('Fetch coupons error:', err);
      setCoupons([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setModalOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      min_order_value: String(c.min_order_value),
      max_uses: c.max_uses ? String(c.max_uses) : '',
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.code || !form.value) {
      setError('Code and value are required.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      min_order_value: parseFloat(form.min_order_value) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    try {
      if (editing) {
        await apiFetch(`/coupons/${editing.id}`, { method: 'PUT', body: payload });
      } else {
        await apiFetch(`/coupons`, { method: 'POST', body: payload });
      }
      await fetchCoupons();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save coupon');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return;
    try {
      await apiFetch(`/coupons/${id}`, { method: 'DELETE' });
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      return;
    }
  }

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Coupons</h1>
          <p className="text-neutral-500 text-sm">{coupons.length} coupons</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Discount</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Min Order</th>
                <th className="text-center px-4 py-3 font-semibold text-neutral-600">Used</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Expires</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto" />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-neutral-400 py-10">
                    No coupons yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  const isExhausted = c.max_uses !== null && c.used_count >= c.max_uses;
                  return (
                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-800">
                        {c.type === 'percentage' ? (
                          <span className="flex items-center gap-1">
                            <Percent size={12} className="text-primary-500" />
                            {c.value}% off
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <IndianRupee size={12} className="text-primary-500" />
                            {c.value} off
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">₹{c.min_order_value}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">
                        {c.used_count}
                        {c.max_uses ? `/${c.max_uses}` : ''}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs">
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'No expiry'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            isExpired || isExhausted
                              ? 'bg-neutral-100 text-neutral-500'
                              : c.is_active
                                ? 'bg-success-100 text-success-700'
                                : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {isExpired ? 'Expired' : isExhausted ? 'Exhausted' : c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-neutral-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-neutral-400 hover:text-error-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center px-4 py-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up my-4 max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900">{editing ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Coupon Code *</label>
                <input
                  className="input font-mono uppercase"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Type</label>
                  <select
                    className="input"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Value *</label>
                  <input
                    type="number"
                    className="input"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder={form.type === 'percentage' ? '10' : '200'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Min Order (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={form.min_order_value}
                    onChange={(e) => setForm((f) => ({ ...f, min_order_value: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Max Uses</label>
                  <input
                    type="number"
                    className="input"
                    value={form.max_uses}
                    onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-neutral-700">Active</span>
              </label>
              {error && <p className="text-error-600 text-sm bg-error-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
