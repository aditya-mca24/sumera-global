import { useEffect, useState } from 'react';
import { Eye, X, Trash2, Factory, Mail, Phone, MapPin } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { BulkOrder } from '../../types';

const STATUSES = ['all', 'pending', 'reviewing', 'quoted', 'confirmed', 'in_production', 'dispatched', 'completed', 'cancelled'];
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-700',
  reviewing: 'bg-accent-100 text-accent-700',
  quoted: 'bg-primary-100 text-primary-700',
  confirmed: 'bg-success-100 text-success-600',
  in_production: 'bg-primary-100 text-primary-800',
  dispatched: 'bg-neutral-100 text-neutral-700',
  completed: 'bg-success-100 text-success-700',
  cancelled: 'bg-error-100 text-error-600',
};

export default function AdminBulkOrders() {
  const { profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<BulkOrder | null>(null);
  const [quotation, setQuotation] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const qs = statusFilter !== 'all' ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const res = await apiFetch<{ orders: BulkOrder[] }>(`/bulk-orders${qs}`);
      setOrders(res.orders ?? []);
    } catch (err) {
      console.error('Fetch bulk orders error:', err);
      setOrders([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function updateStatus(id: string, status: string) {
    try {
      await apiFetch(`/bulk-orders/${id}`, { method: 'PUT', body: { status } });
    } catch (err) {
      console.error('Update status error:', err);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as BulkOrder['status'] } : o)));
    if (selected?.id === id) setSelected((s) => (s ? { ...s, status: status as BulkOrder['status'] } : s));
  }

  async function saveQuotation() {
    if (!selected || !quotation) return;
    const amt = parseFloat(quotation);
    if (isNaN(amt)) return;
    setSaving(true);
    try {
      await apiFetch(`/bulk-orders/${selected.id}`, { method: 'PUT', body: { quotation_amount: amt, status: 'quoted' } });
      const updated = { ...selected, quotation_amount: amt, status: 'quoted' as BulkOrder['status'] };
      setOrders((prev) => prev.map((o) => (o.id === selected.id ? updated : o)));
      setSelected(updated);
      setQuotation('');
    } catch (err) {
      console.error('Save quotation error:', err);
    }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Delete this bulk order inquiry?')) return;
    try {
      await apiFetch(`/bulk-orders/${id}`, { method: 'DELETE' });
      setOrders((prev) => prev.filter((o) => o.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error('Delete error:', err);
      return;
    }
  }

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Bulk Orders</h1>
        <p className="text-neutral-500 text-sm">{orders.length} inquiries</p>
      </div>

      <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1 overflow-x-auto w-fit">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors capitalize ${
              statusFilter === s ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Product</th>
                <th className="text-center px-4 py-3 font-semibold text-neutral-600">Qty</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-neutral-600">Quotation</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-10 bg-neutral-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-neutral-400 py-10">
                    No bulk orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-800">{o.contact_name}</p>
                      <p className="text-xs text-neutral-400">{o.company_name ?? o.email}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{o.product_type}</td>
                    <td className="px-4 py-3 text-center font-medium text-neutral-800">{o.quantity}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      {o.quotation_amount ? (
                        `₹${o.quotation_amount.toLocaleString('en-IN')}`
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`badge cursor-pointer border-0 capitalize text-xs font-medium ${
                          STATUS_COLOR[o.status] ?? 'bg-neutral-100'
                        }`}
                      >
                        {STATUSES.slice(1).map((s) => (
                          <option key={s} value={s} className="bg-white text-neutral-900">
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelected(o);
                            setQuotation(o.quotation_amount ? String(o.quotation_amount) : '');
                            setNewStatus(o.status);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-primary-600 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => del(o.id)}
                          className="p-1.5 text-neutral-400 hover:text-error-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center px-4 py-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up my-4 max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Factory size={18} className="text-primary-500" /> Bulk Order Details
              </h2>
              <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-neutral-400 text-xs mb-0.5">Contact</p>
                  <p className="font-medium">{selected.contact_name}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-0.5">Company</p>
                  <p className="font-medium">{selected.company_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-0.5">Email</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Mail size={11} className="text-neutral-400" /> {selected.email}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-0.5">Phone</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Phone size={11} className="text-neutral-400" /> {selected.phone}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-0.5">Product Type</p>
                  <p className="font-medium">{selected.product_type}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-0.5">Quantity</p>
                  <p className="font-bold text-lg">{selected.quantity} pcs</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-0.5">Sizes</p>
                  <p>{selected.sizes?.join(', ') ?? '—'}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-0.5">Colors</p>
                  <p>{selected.colors?.join(', ') ?? '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-400 text-xs mb-0.5">Delivery Location</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <MapPin size={11} className="text-neutral-400" /> {selected.delivery_location}
                  </p>
                </div>
                {selected.customization && (
                  <div className="col-span-2">
                    <p className="text-neutral-400 text-xs mb-0.5">Customization</p>
                    <p>{selected.customization}</p>
                  </div>
                )}
                {selected.notes && (
                  <div className="col-span-2">
                    <p className="text-neutral-400 text-xs mb-0.5">Notes</p>
                    <p>{selected.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <p className="font-semibold text-neutral-700 mb-2 text-xs uppercase tracking-wide">Update Status</p>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input text-sm"
                >
                  {STATUSES.slice(1).map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => updateStatus(selected.id, newStatus)}
                  disabled={newStatus === selected.status}
                  className="btn-secondary text-sm mt-2 w-full disabled:opacity-50"
                >
                  Update Status
                </button>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <p className="font-semibold text-neutral-700 mb-2 text-xs uppercase tracking-wide">Send Quotation</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="input flex-1 text-sm"
                    value={quotation}
                    onChange={(e) => setQuotation(e.target.value)}
                    placeholder="Enter amount in ₹"
                  />
                  <button onClick={saveQuotation} disabled={!quotation || saving} className="btn-primary text-sm disabled:opacity-60">
                    {saving ? 'Sending...' : 'Send'}
                  </button>
                </div>
                {selected.quotation_amount && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Current quotation: ₹{selected.quotation_amount.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
