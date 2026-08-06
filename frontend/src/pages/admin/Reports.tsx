import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Package, BarChart2, ArrowUpRight, Star, IndianRupee } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Order, Product } from '../../types';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  activeProducts: number;
  ordersByStatus: { status: string; count: number }[];
  topProducts: Product[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-warning-500',
  confirmed: 'bg-accent-500',
  processing: 'bg-accent-400',
  shipped: 'bg-primary-500',
  delivered: 'bg-success-500',
  cancelled: 'bg-error-500',
  returned: 'bg-neutral-400',
};

export default function AdminReports() {
  const { profile, loading: authLoading } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          apiFetch<{ orders: Order[] }>(`/orders/admin?limit=1000`),
          apiFetch<{ products: Product[] }>(`/products?all=true&limit=1000`),
        ]);

        const orders = ordersRes.orders ?? [] as Pick<Order, 'total' | 'status' | 'created_at' | 'payment_status'>[];
        const products = productsRes.products ?? [] as Pick<Product, 'name' | 'rating' | 'review_count' | 'price' | 'is_active'>[];

        const activeOrders = orders.filter((o) => o.status !== 'cancelled');
        const totalRevenue = activeOrders.reduce((s, o) => s + Number(o.total), 0);
        const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

        const statusCount: Record<string, number> = {};
        for (const o of orders) {
          statusCount[o.status] = (statusCount[o.status] ?? 0) + 1;
        }
        const ordersByStatus = Object.entries(statusCount).map(([status, count]) => ({ status, count }));

        const monthlyData = orders.reduce((acc, o) => {
          const month = new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          if (!acc[month]) acc[month] = { revenue: 0, orders: 0 };
          if (o.status !== 'cancelled') acc[month].revenue += Number(o.total);
          acc[month].orders += 1;
          return acc;
        }, {} as Record<string, { revenue: number; orders: number }>);

        const revenueByMonth = Object.entries(monthlyData)
          .slice(-6)
          .map(([month, v]) => ({ month, revenue: v.revenue, orders: v.orders }));

        const topProducts = [...products]
          .sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))
          .slice(0, 5) as Product[];

        setData({
          totalRevenue,
          totalOrders: orders.length,
          avgOrderValue,
          totalProducts: products.length,
          activeProducts: products.filter((p) => p.is_active).length,
          ordersByStatus,
          topProducts,
          revenueByMonth,
        });
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }
      setLoading(false);
    }
    fetchReports();
  }, []);

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-40" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxRevenue = Math.max(...data.revenueByMonth.map((m) => m.revenue), 1);
  const maxStatusCount = Math.max(...data.ordersByStatus.map((s) => s.count), 1);

  const KPIS = [
    { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString('en-IN')}`, Icon: TrendingUp, color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Orders', value: data.totalOrders, Icon: ShoppingBag, color: 'text-accent-600 bg-accent-50' },
    { label: 'Avg Order Value', value: `₹${Math.round(data.avgOrderValue).toLocaleString('en-IN')}`, Icon: BarChart2, color: 'text-success-600 bg-success-50' },
    { label: 'Total Products', value: data.totalProducts, Icon: Package, color: 'text-warning-600 bg-warning-50' },
    { label: 'Active Products', value: data.activeProducts, Icon: ArrowUpRight, color: 'text-primary-600 bg-primary-50' },
    { label: 'Conversion Rate', value: `${data.totalOrders > 0 ? '100%' : '0%'}`, Icon: Star, color: 'text-neutral-600 bg-neutral-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Reports & Analytics</h1>
        <p className="text-neutral-500 text-sm">Store performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-sm text-neutral-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <h2 className="font-semibold text-neutral-900 mb-5">Revenue by Month</h2>
          {data.revenueByMonth.length === 0 ? (
            <p className="text-neutral-400 text-sm text-center py-8">No data available.</p>
          ) : (
            <div className="space-y-3">
              {data.revenueByMonth.map(({ month, revenue, orders }) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 w-16 flex-shrink-0">{month}</span>
                  <div className="flex-1 bg-neutral-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-700"
                      style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-neutral-700 w-24 text-right flex-shrink-0">
                    ₹{revenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-neutral-400 w-12 text-right flex-shrink-0">{orders} ord</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <h2 className="font-semibold text-neutral-900 mb-5">Orders by Status</h2>
          {data.ordersByStatus.length === 0 ? (
            <p className="text-neutral-400 text-sm text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {data.ordersByStatus
                .sort((a, b) => b.count - a.count)
                .map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_COLOR[status] ?? 'bg-neutral-300'}`} />
                    <span className="text-sm text-neutral-700 capitalize flex-1">{status}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${STATUS_COLOR[status] ?? 'bg-neutral-300'} rounded-full transition-all duration-700`}
                        style={{ width: `${(count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-neutral-600 w-8 text-right">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 lg:col-span-2">
          <h2 className="font-semibold text-neutral-900 mb-5">Top Products by Reviews</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100">
                <tr>
                  <th className="text-left pb-3 font-semibold text-neutral-600">Product</th>
                  <th className="text-center pb-3 font-semibold text-neutral-600">Rating</th>
                  <th className="text-right pb-3 font-semibold text-neutral-600">Reviews</th>
                  <th className="text-right pb-3 font-semibold text-neutral-600">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {data.topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-neutral-400 py-6">
                      No products available.
                    </td>
                  </tr>
                ) : (
                  data.topProducts.map((p) => (
                    <tr key={p.name}>
                      <td className="py-3 font-medium text-neutral-800">{p.name}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star size={12} className="text-warning-500 fill-warning-500" />
                          <span className="font-medium">{Number(p.rating).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold text-neutral-700">{p.review_count}</td>
                      <td className="py-3 text-right text-neutral-600 flex items-center justify-end gap-0.5">
                        <IndianRupee size={11} />
                        {Number(p.price).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
