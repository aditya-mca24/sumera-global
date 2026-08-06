import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ExternalLink, Upload, Link2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../../types';

interface BannerForm {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  button_text: string;
  display_order: string;
  is_active: boolean;
}

const EMPTY: BannerForm = {
  title: '',
  subtitle: '',
  image_url: '',
  link_url: '',
  button_text: 'Shop Now',
  display_order: '1',
  is_active: true,
};

export default function AdminBanners() {
  const { profile, loading: authLoading } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      void file;
      // File uploads are not supported by the local API in this setup.
      // Ask the user to provide an image URL instead.
      throw new Error('File uploads are not supported. Please provide an image URL.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
    setUploading(false);
  }

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await apiFetch<{ banners: Banner[] }>(`/banners`);
      setBanners(res.banners ?? []);
    } catch (err) {
      console.error('Fetch banners error:', err);
      setBanners([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setModalOpen(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? '',
      image_url: b.image_url,
      link_url: b.link_url ?? '',
      button_text: b.button_text ?? '',
      display_order: String(b.display_order),
      is_active: b.is_active,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.image_url) {
      setError('Title and image URL are required.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      image_url: form.image_url,
      link_url: form.link_url || null,
      button_text: form.button_text || null,
      display_order: parseInt(form.display_order) || 1,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await apiFetch(`/banners/${editing.id}`, { method: 'PUT', body: payload });
      } else {
        await apiFetch(`/banners`, { method: 'POST', body: payload });
      }
      await fetchBanners();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save banner');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this banner?')) return;
    try {
      await apiFetch(`/banners/${id}`, { method: 'DELETE' });
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      return;
    }
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Banners</h1>
          <p className="text-neutral-500 text-sm">{banners.length} banners</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array(3)
            .fill(null)
            .map((_, i) => <div key={i} className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />)
        ) : banners.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">No banners yet.</div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex items-stretch"
            >
              <div className="w-48 flex-shrink-0">
                {b.image_url ? (
                  <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                    <ImageIcon size={24} className="text-neutral-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-neutral-900">{b.title}</h3>
                      {b.subtitle && <p className="text-sm text-neutral-500 mt-0.5">{b.subtitle}</p>}
                    </div>
                    <span
                      className={`badge flex-shrink-0 ${
                        b.is_active ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {b.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-neutral-400 flex-wrap">
                    {b.link_url && (
                      <span className="flex items-center gap-1">
                        <ExternalLink size={11} /> {b.link_url}
                      </span>
                    )}
                    {b.button_text && <span>CTA: {b.button_text}</span>}
                    <span>Order: {b.display_order}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error-600 border border-error-200 rounded-lg hover:bg-error-50 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center px-4 py-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up my-4 max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
              <h2 className="font-semibold text-neutral-900">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title *</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="New Season Collection"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Subtitle</label>
                <input
                  className="input"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Banner Image *</label>
                <div className="flex gap-2">
                  <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 cursor-pointer hover:border-primary-300 transition-colors text-sm font-medium text-neutral-700 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                    <Upload size={15} />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }}
                      disabled={uploading}
                    />
                  </label>
                  <div className="flex-1 relative">
                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      className="input pl-9"
                      value={form.image_url}
                      onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                {form.image_url && (
                  <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-lg mt-2" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Link URL</label>
                  <input
                    className="input"
                    value={form.link_url}
                    onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                    placeholder="/shop"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Button Text</label>
                  <input
                    className="input"
                    value={form.button_text}
                    onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    className="input"
                    value={form.display_order}
                    onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-neutral-700">Active</span>
                  </label>
                </div>
              </div>
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
