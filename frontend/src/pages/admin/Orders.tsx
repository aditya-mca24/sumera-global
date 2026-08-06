import { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-700',
  confirmed: 'bg-accent-100 text-accent-700',
  processing: 'bg-accent-100 text-accent-700',
  shipped: 'bg-primary-100 text-primary-700',
  delivered: 'bg-success-100 text-success-700',
  cancelled: 'bg-error-100 text-error-600',
  returned: 'bg-neutral-100 text-neutral-600',
};
const PAYMENT_COLOR: Record<string, string> = {
  paid: 'bg-success-100 text-success-700',
  pending: 'bg-warning-100 text-warning-700',
  failed: 'bg-error-100 text-error-600',
  refunded: 'bg-neutral-100 text-neutral-600',
};

export default function AdminOrders() {
  const { profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const qs = statusFilter !== 'all' ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const res = await apiFetch<{ orders: Order[] }>(`/orders/admin${qs}`);
      setOrders(res.orders ?? []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setOrders([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(true);
    try {
      await apiFetch(`/orders/${orderId}/status`, { method: 'PUT', body: { status } });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: status as Order['status'] } : o)));
      if (selected?.id === orderId) setSelected((s) => (s ? { ...s, status: status as Order['status'] } : s));
    } catch (err) {
      console.error('Update status error:', err);
    }
    setUpdating(false);
  }

  async function updatePaymentStatus(orderId: string, payment_status: string) {
    setUpdating(true);
    try {
      await apiFetch(`/orders/${orderId}/status`, { method: 'PUT', body: { payment_status } });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: payment_status as Order['payment_status'] } : o)));
      if (selected?.id === orderId) setSelected((s) => (s ? { ...s, payment_status: payment_status as Order['payment_status'] } : s));
    } catch (err) {
      console.error('Update payment status error:', err);
    }
    setUpdating(false);
  }

  const filtered = orders.filter((o) => o.id.toLowerCase().includes(search.toLowerCase()));

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Orders</h1>
        <p className="text-neutral-500 text-sm">{orders.length} orders</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                statusFilter === s ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-neutral-600">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Payment</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-10 bg-neutral-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-neutral-400 py-10">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-700">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {order.shipping_address?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.payment_status}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        disabled={updating}
                        className={`badge cursor-pointer border-0 capitalize text-xs font-medium ${
                          PAYMENT_COLOR[order.payment_status] ?? 'bg-neutral-100'
                        }`}
                      >
                        {['pending', 'paid', 'failed', 'refunded'].map((s) => (
                          <option key={s} value={s} className="bg-white text-neutral-900">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating}
                        className={`badge cursor-pointer border-0 capitalize text-xs font-medium ${
                          STATUS_COLOR[order.status] ?? 'bg-neutral-100'
                        }`}
                      >
                        {STATUSES.slice(1).map((s) => (
                          <option key={s} value={s} className="bg-white text-neutral-900">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelected(order)}
                          className="p-1.5 text-neutral-400 hover:text-primary-600 transition-colors"
                        >
                          <Eye size={16} />
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
              <h2 className="font-semibold text-neutral-900">Order #{selected.id.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Status</p>
                  <span className={`badge capitalize ${STATUS_COLOR[selected.status]}`}>{selected.status}</span>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Payment</p>
                  <p className="font-medium capitalize">
                    {selected.payment_method ?? '—'} · {selected.payment_status}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Subtotal</p>
                  <p className="font-medium">₹{Number(selected.subtotal).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Total</p>
                  <p className="font-bold text-lg">₹{Number(selected.total).toLocaleString('en-IN')}</p>
                </div>
                {selected.coupon_code && (
                  <div>
                    <p className="text-neutral-500 text-xs mb-0.5">Coupon</p>
                    <p className="font-mono text-xs">{selected.coupon_code}</p>
                  </div>
                )}
                {selected.discount > 0 && (
                  <div>
                    <p className="text-neutral-500 text-xs mb-0.5">Discount</p>
                    <p className="font-medium text-success-600">-₹{Number(selected.discount).toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>

              {selected.shipping_address && (
                <div className="bg-neutral-50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-neutral-700 mb-2 text-xs uppercase tracking-wide">Shipping Address</p>
                  <p className="font-medium">{selected.shipping_address.full_name}</p>
                  <p className="text-neutral-600">{selected.shipping_address.line1}</p>
                  <p className="text-neutral-600">
                    {selected.shipping_address.city}, {selected.shipping_address.state} –{' '}
                    {selected.shipping_address.pincode}
                  </p>
                  <p className="text-neutral-600">{selected.shipping_address.phone}</p>
                </div>
              )}

              {selected.items && selected.items.length > 0 && (
                <div>
                  <p className="font-semibold text-neutral-700 text-xs uppercase tracking-wide mb-3">Items</p>
                  <div className="space-y-2">
                    {selected.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        {item.product_image && (
                          <img src={item.product_image} alt="" className="w-10 h-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-neutral-800">{item.product_name}</p>
                          <p className="text-xs text-neutral-400">
                            {item.variant_size} · {item.variant_color} · Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">₹{Number(item.total_price).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.notes && (
                <div className="bg-neutral-50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-neutral-700 text-xs uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-neutral-600">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
