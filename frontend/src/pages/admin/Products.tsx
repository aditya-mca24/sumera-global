import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, Upload, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Product, Category } from '../../types';

interface ProductForm {
  name: string;
  slug: string;
  category_id: string;
  description: string;
  price: string;
  compare_price: string;
  brand: string;
  sku: string;
  tags: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_active: boolean;
}

interface ProductImage {
  id?: string;
  url: string;
  file?: File;
  is_primary: boolean;
  existing?: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  price: '',
  compare_price: '',
  brand: 'Surema',
  sku: '',
  tags: '',
  is_featured: false,
  is_new_arrival: false,
  is_best_seller: false,
  is_active: true,
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminProducts() {
  const { profile, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showLocalInput, setShowLocalInput] = useState(false);
  const [localImagePath, setLocalImagePath] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await apiFetch<{ products: Product[] }>(`/products?all=true&limit=1000`);
      setProducts(res.products ?? []);
    } catch (err) {
      console.error('Fetch products error:', err);
      setProducts([]);
    }
    setLoading(false);
  }

  async function fetchCategories() {
    try {
      const res = await apiFetch<{ categories: Category[] }>(`/categories?all=true`);
      setCategories(res.categories ?? []);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setCategories([]);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setShowLocalInput(false);
    setLocalImagePath('');
    setError('');
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id ?? '',
      description: product.description ?? '',
      price: String(product.price),
      compare_price: product.compare_price ? String(product.compare_price) : '',
      brand: product.brand,
      sku: product.sku ?? '',
      tags: product.tags?.join(', ') ?? '',
      is_featured: product.is_featured,
      is_new_arrival: product.is_new_arrival,
      is_best_seller: product.is_best_seller,
      is_active: product.is_active,
    });
    setImages(
      product.images?.map((img) => ({
        id: img.id,
        url: img.url,
        is_primary: img.is_primary,
        existing: true,
      })) ?? []
    );
    setShowLocalInput(false);
    setLocalImagePath('');
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      setError('Name and price are required.');
      return;
    }
    setSaving(true);
    setError('');
    const slug = form.slug || slugify(form.name);
    const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const payload = {
      name: form.name,
      slug,
      category_id: form.category_id || null,
      description: form.description || null,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      brand: form.brand,
      sku: form.sku || null,
      tags,
      is_featured: form.is_featured,
      is_new_arrival: form.is_new_arrival,
      is_best_seller: form.is_best_seller,
      is_active: form.is_active,
    };

    try {
      if (images.some((img) => img.file)) {
        throw new Error('File uploads are not supported in this setup. Use image URLs or local paths instead.');
      }

      const imagePayload = images.map((i, idx) => ({
        id: i.id,
        url: i.url,
        is_primary: i.is_primary,
        display_order: idx,
      }));

      if (editing) {
        await apiFetch<{ product: Product }>(`/products/${editing.id}`, {
          method: 'PUT',
          body: { ...payload, images: imagePayload },
        });
      } else {
        await apiFetch<{ product: Product }>(`/products`, {
          method: 'POST',
          body: { ...payload, images: imagePayload },
        });
      }

      await fetchProducts();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      return;
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  const TOGGLES: { key: keyof ProductForm; label: string }[] = [
    { key: 'is_featured', label: 'Featured' },
    { key: 'is_new_arrival', label: 'New Arrival' },
    { key: 'is_best_seller', label: 'Best Seller' },
    { key: 'is_active', label: 'Active' },
  ];

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-500 text-sm">{products.length} total products</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input py-2.5 text-sm w-48"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-neutral-600">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Stock</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Labels</th>
                <th className="text-right px-4 py-3 font-semibold text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-6 bg-neutral-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-neutral-400 py-10">
                    No products found.
                  </td>
                </tr>
              ) : (
                paginated.map((product) => {
                  const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
                  const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
                  const inStock = !product.variants || product.variants.length === 0 ? null : totalStock > 0;
                  return (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                            {img ? (
                              <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={16} className="m-auto mt-3 text-neutral-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{product.name}</p>
                            <p className="text-xs text-neutral-400">SKU: {product.sku ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{product.category?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-semibold text-neutral-900">₹{Number(product.price).toLocaleString('en-IN')}</p>
                        {product.compare_price && (
                          <p className="text-xs text-neutral-400 line-through">
                            ₹{Number(product.compare_price).toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {inStock === null ? (
                          <span className="text-xs text-neutral-400">N/A</span>
                        ) : inStock ? (
                          <span className="badge bg-success-100 text-success-700">{totalStock} in stock</span>
                        ) : (
                          <span className="badge bg-error-100 text-error-600">Out of stock</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            product.is_active ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {product.is_featured && <span className="badge bg-primary-100 text-primary-700">Featured</span>}
                          {product.is_new_arrival && <span className="badge bg-accent-100 text-accent-700">New</span>}
                          {product.is_best_seller && <span className="badge bg-warning-100 text-warning-700">Best Seller</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 text-neutral-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-sm text-neutral-500">
              Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <span key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-2 text-neutral-400">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium ${
                        p === page
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center py-6 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Name *</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                    placeholder="e.g. Floral Crop Top"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Slug</label>
                  <input
                    className="input text-xs"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
                  <select
                    className="input"
                    value={form.category_id}
                    onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    className="input"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Compare Price (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={form.compare_price}
                    onChange={(e) => setForm((f) => ({ ...f, compare_price: e.target.value }))}
                    placeholder="1499"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Brand</label>
                  <input
                    className="input"
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">SKU</label>
                  <input
                    className="input"
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="e.g. SUR-001"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    className="input resize-none"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tags (comma-separated)</label>
                  <input
                    className="input"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="floral, casual, summer"
                  />
                </div>

                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Images</label>
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-neutral-200 relative">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X size={12} />
                          </button>
                          {img.is_primary && (
                            <span className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] text-center py-0.5">
                              Primary
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setImages((prev) =>
                              prev.map((i, iIdx) => ({ ...i, is_primary: iIdx === idx }))
                            )
                          }
                          className="mt-1 text-xs text-primary-600 hover:text-primary-700"
                        >
                          Set primary
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload size={20} className="text-neutral-400" />
                      <span className="text-xs text-neutral-400 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setImages((prev) => [
                                ...prev,
                                {
                                  url: ev.target?.result as string,
                                  file,
                                  is_primary: prev.length === 0,
                                },
                              ]);
                            };
                            reader.readAsDataURL(file);
                          });
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLocalInput(!showLocalInput)}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-400 flex flex-col items-center justify-center transition-colors"
                    >
                      <FolderOpen size={20} className="text-neutral-400" />
                      <span className="text-xs text-neutral-400 mt-1">Local</span>
                    </button>
                  </div>

                  {/* Local image path input */}
                  {showLocalInput && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                        Image path from project folder
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={localImagePath}
                          onChange={(e) => setLocalImagePath(e.target.value)}
                          placeholder="/images/products/your-image.jpg"
                          className="input flex-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (localImagePath.trim()) {
                              const path = localImagePath.trim();
                              setImages((prev) => [
                                ...prev,
                                {
                                  url: path,
                                  is_primary: prev.length === 0,
                                  existing: true,
                                },
                              ]);
                              setLocalImagePath('');
                              setShowLocalInput(false);
                            }
                          }}
                          className="btn-primary text-sm px-3"
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Place images in <code className="bg-neutral-100 px-1 rounded">public/images/products/</code> folder, then use path like <code className="bg-neutral-100 px-1 rounded">/images/products/image.jpg</code>
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-neutral-400 mt-1">Upload from computer or use local images from project folder.</p>
                </div>

                <div className="col-span-2 flex flex-wrap gap-4">
                  {TOGGLES.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[key] as boolean}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600"
                      />
                      <span className="text-sm text-neutral-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="text-error-600 text-sm bg-error-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
