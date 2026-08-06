import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Tag, GripVertical, Upload, Link2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Category } from '../../types';

interface CatForm {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order: string;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const EMPTY: CatForm = { name: '', slug: '', description: '', image_url: '', is_active: true, display_order: '0' };

export default function AdminCategories() {
  const { profile, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CatForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      void file;
      throw new Error('File uploads are not supported. Please provide an image URL.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
    setUploading(false);
  }

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await apiFetch<{ categories: Category[] }>(`/categories?all=true`);
      setCategories(res.categories ?? []);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setCategories([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      image_url: c.image_url ?? '',
      is_active: c.is_active,
      display_order: String(c.display_order),
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    const slug = form.slug || slugify(form.name);
    const payload = {
      name: form.name,
      slug,
      description: form.description || null,
      image_url: form.image_url || null,
      is_active: form.is_active,
      display_order: parseInt(form.display_order) || 0,
    };

    try {
      if (editing) {
        await apiFetch(`/categories/${editing.id}`, { method: 'PUT', body: payload });
      } else {
        await apiFetch(`/categories`, { method: 'POST', body: payload });
      }
      await fetchCategories();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Products in this category will be uncategorized.')) return;
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== id));
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
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Categories</h1>
          <p className="text-neutral-500 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600 w-10"></th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Description</th>
                <th className="text-center px-4 py-3 font-semibold text-neutral-600">Order</th>
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
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-neutral-400 py-10">
                    No categories yet.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-neutral-300">
                      <GripVertical size={14} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.image_url ? (
                          <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <Tag size={14} className="text-neutral-400" />
                          </div>
                        )}
                        <span className="font-medium text-neutral-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{c.slug}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">{c.description ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-neutral-600">{c.display_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          c.is_active ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Inactive'}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center px-4 py-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up my-4 max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="e.g. Crop Tops"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Slug</label>
                <input
                  className="input font-mono text-xs"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category Image</label>
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
                  <img src={form.image_url} alt="" className="w-full h-24 object-cover rounded-lg mt-2" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  className="input resize-none"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    className="input"
                    value={form.display_order}
                    onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                  />
                </div>
                <label className="flex items-center gap-2 mt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-neutral-700">Active</span>
                </label>
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
