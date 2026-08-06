import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Grid, List, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Product, Category } from '../types';
import ProductCard from '../components/shop/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const LIMIT = 12;
const DEFAULT_MAX_PRICE = 10000;

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingFilter, setPendingFilter] = useState<string>('');
  const [pendingMinPrice, setPendingMinPrice] = useState<string>('');
  const [pendingMaxPrice, setPendingMaxPrice] = useState<string>('');

  const categorySlug = params.get('category') ?? '';
  const searchQuery = params.get('search') ?? '';
  const filter = params.get('filter') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const minPrice = Number(params.get('min_price') ?? 0);
  const maxPrice = Number(params.get('max_price') ?? DEFAULT_MAX_PRICE);
  const page = Number(params.get('page') ?? 1);
  const scrollRestore = useRef<number | null>(null);

  useEffect(() => {
    const originalScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = originalScrollRestoration;
    };
  }, []);

  useEffect(() => {
   
    const targetScroll = scrollRestore.current;
    scrollRestore.current = null;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: targetScroll, behavior: 'auto' });
    });
  }, [params]);

  // Fetch categories once
  useEffect(() => {
    apiFetch<{ categories: Category[] }>(`/categories`)
      .then((res) => setCategories(res.categories ?? []))
      .catch((err) => {
        console.error('Fetch categories error:', err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    setPendingFilter(filter);
    setPendingMinPrice(minPrice > 0 ? String(minPrice) : '');
    setPendingMaxPrice(maxPrice < DEFAULT_MAX_PRICE ? String(maxPrice) : '');
  }, [filter, minPrice, maxPrice]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categorySlug) params.set('category', categorySlug);
      if (searchQuery) params.set('q', searchQuery);
      if (filter) params.set('filter', filter);
      if (sort) params.set('sort', sort);
      if (minPrice > 0) params.set('min', String(minPrice));
      if (maxPrice < DEFAULT_MAX_PRICE) params.set('max', String(maxPrice));
      params.set('page', String(page));
      params.set('limit', String(LIMIT));

      const response = await apiFetch<{ products: Product[]; total: number; totalPages: number }>(`/products?${params.toString()}`);

      setProducts(response.products ?? []);
      setTotal(response.total ?? 0);
      setTotalPages(response.totalPages ?? 0);
    } catch (err) {
      console.error('Fetch products error:', err);
      setProducts([]);
      setTotal(0);
      setTotalPages(0);
    }
    setLoading(false);
  }, [categorySlug, searchQuery, filter, sort, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function setParam(key: string, value: string, preserveScroll = false) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    // Changing a filter resets pagination, but navigating pages should not clear itself
    if (key !== 'page') next.delete('page');
    if (preserveScroll) scrollRestore.current = window.scrollY;
    setParams(next);
  }

  function handleCategorySelect(slug: string) {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set('category', slug); else next.delete('category');
    next.delete('page');
    navigate({ pathname: '/shop', search: `?${next.toString()}` });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function applyFilters() {
    const next = new URLSearchParams(params.toString());
    if (pendingFilter) next.set('filter', pendingFilter); else next.delete('filter');
    if (pendingMinPrice) next.set('min_price', pendingMinPrice); else next.delete('min_price');
    if (pendingMaxPrice) next.set('max_price', pendingMaxPrice); else next.delete('max_price');
    next.delete('page');
    navigate({ pathname: '/shop', search: `?${next.toString()}` });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearFilters() {
    const next = new URLSearchParams(params.toString());
    next.delete('filter');
    next.delete('min_price');
    next.delete('max_price');
    next.delete('page');
    navigate({ pathname: '/shop', search: `?${next.toString()}` });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Build pagination range (show up to 5 pages around current)
  const pageNumbers: number[] = [];
  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#1a0a2e] pt-16">
      {/* Header */}
      <div className="bg-white dark:bg-[#241038] border-b border-neutral-100 dark:border-primary-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            <Link to="/" className="hover:text-neutral-800 dark:hover:text-neutral-200">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-800 dark:text-neutral-200">Shop</span>
            {categorySlug && <><span className="mx-2">/</span><span className="text-neutral-800 dark:text-neutral-200 capitalize">{categorySlug.replace(/-/g, ' ')}</span></>}
          </nav>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">
                {searchQuery ? `Results for "${searchQuery}"` : categorySlug ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All Products'}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">{loading ? '...' : `${total} products found`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2e1547] border border-neutral-200 dark:border-primary-800/40 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            {/* Active filters */}
            {categorySlug && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium capitalize">
                {categorySlug.replace(/-/g, ' ')}
                <button onClick={() => setParam('category', '')}><X size={12} /></button>
              </span>
            )}
            {filter && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium capitalize">
                {filter === 'bestseller' ? 'Best Sellers' : filter === 'new' ? 'New Arrivals' : 'Featured'}
                <button onClick={() => setParam('filter', '')}><X size={12} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium">
                "{searchQuery}"
                <button onClick={() => setParam('search', '')}><X size={12} /></button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
              className="text-sm border border-neutral-200 dark:border-primary-800/40 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 bg-white dark:bg-[#2e1547] dark:text-neutral-200"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex bg-white dark:bg-[#2e1547] border border-neutral-200 dark:border-primary-800/40 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-neutral-100 dark:bg-[#3a1d5c] text-neutral-900 dark:text-white' : 'text-neutral-400'}`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-neutral-100 dark:bg-[#3a1d5c] text-neutral-900 dark:text-white' : 'text-neutral-400'}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${filterOpen ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="card p-5 sticky top-20 space-y-6">
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3 text-sm">Categories</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleCategorySelect('')}
                    type="button"
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!categorySlug ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#2e1547]'}`}
                  >
                    All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      type="button"
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${categorySlug === cat.slug ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#2e1547]'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3 text-sm">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={pendingMinPrice}
                    onChange={e => setPendingMinPrice(e.target.value)}
                    className="input text-xs py-2 px-3"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={pendingMaxPrice}
                    onChange={e => setPendingMaxPrice(e.target.value)}
                    className="input text-xs py-2 px-3"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3 text-sm">Filter</h3>
                <div className="space-y-1.5">
                  {[
                    { value: 'new', label: 'New Arrivals' },
                    { value: 'bestseller', label: 'Best Sellers' },
                    { value: 'featured', label: 'Featured' },
                  ].map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setPendingFilter(filter === f.value ? '' : f.value)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${pendingFilter === f.value ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#2e1547]'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full text-sm bg-primary-600 text-white rounded-lg px-3 py-2 hover:bg-primary-700 transition-colors"
                >
                  Apply filters
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors py-2"
                >
                  Reset filters
                </button>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                {Array(12).fill(null).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-neutral-100 dark:bg-[#2e1547] animate-pulse">
                    <div className="aspect-[3/4] bg-neutral-200 dark:bg-[#3a1d5c] rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-neutral-200 dark:bg-[#3a1d5c] rounded w-3/4" />
                      <div className="h-3 bg-neutral-200 dark:bg-[#3a1d5c] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-neutral-400 dark:text-neutral-500 text-lg mb-4">No products found</p>
                <button onClick={() => setParams(new URLSearchParams())} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setParam('page', String(page - 1))}
                  disabled={page <= 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-[#2e1547] border border-neutral-200 dark:border-primary-800/40 text-neutral-700 dark:text-neutral-200 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                {startPage > 1 && (
                  <>
                    <button onClick={() => setParam('page', '1')} className="w-10 h-10 rounded-lg text-sm font-medium bg-white dark:bg-[#2e1547] border border-neutral-200 dark:border-primary-800/40 text-neutral-700 dark:text-neutral-200 hover:border-primary-300 transition-colors">1</button>
                    {startPage > 2 && <span className="text-neutral-400 px-1">…</span>}
                  </>
                )}
                {pageNumbers.map(p => (
                  <button
                    key={p}
                    onClick={() => setParam('page', String(p))}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? 'bg-primary-600 text-white' : 'bg-white dark:bg-[#2e1547] border border-neutral-200 dark:border-primary-800/40 text-neutral-700 dark:text-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && <span className="text-neutral-400 px-1">…</span>}
                    <button onClick={() => setParam('page', String(totalPages))} className="w-10 h-10 rounded-lg text-sm font-medium bg-white dark:bg-[#2e1547] border border-neutral-200 dark:border-primary-800/40 text-neutral-700 dark:text-neutral-200 hover:border-primary-300 transition-colors">{totalPages}</button>
                  </>
                )}
                <button
                  onClick={() => setParam('page', String(page + 1))}
                  disabled={page >= totalPages}
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-[#2e1547] border border-neutral-200 dark:border-primary-800/40 text-neutral-700 dark:text-neutral-200 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

