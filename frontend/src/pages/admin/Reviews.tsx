import { useEffect, useState } from 'react';
import { Star, Check, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Review } from '../../types';

interface ReviewWithProduct extends Review {
  product?: { name: string } | null;
}

export default function AdminReviews() {
  const { profile, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await apiFetch<{ reviews: any[] }>(`/reviews/admin?limit=1000`);
      // map product_name to product object
      const list = (res.reviews ?? []).map((r) => ({ ...r, product: { name: r.product_name } }));
      setReviews(list as ReviewWithProduct[]);
    } catch (err) {
      console.error('Fetch reviews error:', err);
      setReviews([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function toggleApprove(id: string, current: boolean) {
    try {
      await apiFetch(`/reviews/${id}/approve`, { method: 'PUT', body: { approved: !current } });
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_approved: !current } : r)));
    } catch (err) {
      console.error('Toggle approve error:', err);
      return;
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this review?')) return;
    try {
      await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      return;
    }
  }

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });
  const pending = reviews.filter((r) => !r.is_approved).length;

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Reviews</h1>
        <p className="text-neutral-500 text-sm">{pending} pending approval</p>
      </div>

      <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1 w-fit">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(4)
            .fill(null)
            .map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-neutral-100 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">No reviews found.</div>
        ) : (
          filtered.map((r) => {
            const productName = r.product?.name ?? 'Unknown Product';
            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${
                  !r.is_approved ? 'border-warning-200' : 'border-neutral-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-neutral-800 text-sm">{r.user_name}</p>
                      <div className="flex gap-0.5">
                        {Array(5)
                          .fill(null)
                          .map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < r.rating ? 'text-warning-500 fill-warning-500' : 'text-neutral-200 fill-neutral-200'}
                            />
                          ))}
                      </div>
                      <span className="text-xs text-neutral-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">
                      on <span className="font-medium">{productName}</span>
                    </p>
                    {r.title && <p className="font-semibold text-sm text-neutral-700">{r.title}</p>}
                    {r.body && <p className="text-sm text-neutral-600 mt-1">{r.body}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleApprove(r.id, r.is_approved)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                        r.is_approved
                          ? 'text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                          : 'text-success-700 bg-success-50 border-success-200 hover:bg-success-100'
                      }`}
                    >
                      <Check size={13} /> {r.is_approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      onClick={() => del(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error-600 border border-error-200 rounded-lg hover:bg-error-50 transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                    {/* {r.is_approved && <span className="badge bg-success-100 text-success-700 text-center">Approved</span>} */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
