import { useEffect, useState } from 'react';
import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, Clock, CheckCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Order, Product } from '../../types';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: Order[];
  topProducts: Product[];
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-700',
  confirmed: 'bg-accent-100 text-accent-700',
  processing: 'bg-accent-100 text-accent-700',
  shipped: 'bg-primary-100 text-primary-700',
  delivered: 'bg-success-100 text-success-700',
  cancelled: 'bg-error-100 text-error-600',
  returned: 'bg-neutral-100 text-neutral-600',
};

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersRes, productsRes, profilesRes, recentRes, topRes] = await Promise.all([
          apiFetch<{ orders: Order[] }>(`/orders/admin?limit=1000`),
          apiFetch<{ products: Product[]; total?: number }>(`/products?all=true&limit=1`),
          apiFetch<{ users: any[] }>(`/profiles`),
          apiFetch<{ orders: Order[] }>(`/orders/admin?limit=5&page=1`),
          apiFetch<{ products: Product[] }>(`/products?all=true&limit=5&sort=rating`),
        ]);

        const orders = ordersRes.orders ?? [];
        const activeOrders = orders.filter((o) => o.status !== 'cancelled');
        const totalRevenue = activeOrders.reduce((s, o) => s + Number(o.total), 0);
        const pendingOrders = orders.filter((o) => o.status === 'pending').length;

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: productsRes.total ?? 0,
          totalCustomers: profilesRes.users?.length ?? 0,
          pendingOrders,
          recentOrders: recentRes.orders ?? [],
          topProducts: topRes.products ?? [],
        });
      } catch (err) {
        console.error('Fetch stats error:', err);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (authLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="h-28 bg-neutral-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  const METRIC_CARDS = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, Icon: TrendingUp, color: 'bg-primary-50 text-primary-700' },
    { label: 'Total Orders', value: stats.totalOrders, Icon: ShoppingBag, color: 'bg-accent-50 text-accent-700' },
    { label: 'Total Products', value: stats.totalProducts, Icon: Package, color: 'bg-success-50 text-success-700' },
    { label: 'Customers', value: stats.totalCustomers, Icon: Users, color: 'bg-warning-50 text-warning-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Welcome to your store overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CARDS.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <span className="flex items-center gap-1 text-xs text-success-600 font-medium">
                <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {loading ? <span className="animate-pulse bg-neutral-100 rounded h-7 w-20 block" /> : value}
            </p>
            <p className="text-sm text-neutral-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Alert: Pending Orders */}
      {stats.pendingOrders > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-center gap-3">
          <Clock size={18} className="text-warning-600 flex-shrink-0" />
          <p className="text-sm text-warning-700">
            You have <span className="font-semibold">{stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''}</span> waiting for confirmation.
          </p>
          <Link to="/admin/orders" className="ml-auto text-sm font-medium text-warning-700 hover:text-warning-900 flex-shrink-0">
            View →
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="h-10 bg-neutral-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <p className="text-neutral-400 text-sm text-center py-6">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-neutral-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-neutral-400">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
                    <span className={`badge ${STATUS_COLOR[order.status] ?? 'bg-neutral-100 text-neutral-600'} capitalize`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products + Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
          <h2 className="font-semibold text-neutral-900 mb-5">Top Selling Products</h2>
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="h-10 bg-neutral-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : stats.topProducts.length === 0 ? (
            <p className="text-neutral-400 text-sm text-center py-6">No products yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => {
                const img = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
                return (
                  <div key={product.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                    <span className="text-xs font-bold text-neutral-400 w-4">{i + 1}</span>
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      {img ? (
                        <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={14} className="m-auto mt-2.5 text-neutral-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{product.name}</p>
                      <p className="text-xs text-neutral-400">
                        {product.is_best_seller && <span className="text-warning-600">Best Seller</span>}
                        {product.is_best_seller && product.review_count > 0 && ' · '}
                        {product.review_count > 0 && `${product.review_count} reviews`}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">₹{Number(product.price).toLocaleString('en-IN')}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Product', href: '/admin/products', Icon: Package, color: 'bg-primary-50 text-primary-700 hover:bg-primary-100' },
                { label: 'Manage Orders', href: '/admin/orders', Icon: ShoppingBag, color: 'bg-accent-50 text-accent-700 hover:bg-accent-100' },
                { label: 'View Customers', href: '/admin/customers', Icon: Users, color: 'bg-success-50 text-success-700 hover:bg-success-100' },
                { label: 'Bulk Inquiries', href: '/admin/bulk-orders', Icon: CheckCircle, color: 'bg-warning-50 text-warning-700 hover:bg-warning-100' },
              ].map(({ label, href, Icon, color }) => (
                <Link
                  key={label}
                  to={href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors text-center ${color}`}
                >
                  <Icon size={22} />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
