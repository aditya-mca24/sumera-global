import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, Minus, Plus, Check, Truck, RotateCcw, Shield } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Product, ProductVariant, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/shop/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'size' | 'reviews'>('description');

  // Review submission form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      try {
        const productId = encodeURIComponent(slug ?? '');
        const response = await apiFetch<{ product: Product }>(`/products/${productId}`);
        const p = response.product;
        if (!p) {
          setLoading(false);
          return;
        }

        if (cancelled) return;
        setProduct(p);

        if (p.images && p.images.length > 0) {
          const primary = p.images.findIndex(i => i.is_primary);
          setSelectedImage(primary >= 0 ? primary : 0);
        }

        const [reviewsRes, relatedRes] = await Promise.all([
          apiFetch<{ reviews: Review[] }>(`/reviews/product/${encodeURIComponent(p.id)}`),
          p.category?.slug
            ? apiFetch<{ products: Product[] }>(`/products?category=${encodeURIComponent(p.category.slug)}&limit=4`)
            : Promise.resolve({ products: [] }),
        ]);

        if (cancelled) return;
        setReviews(reviewsRes.reviews ?? []);
        setRelated(relatedRes.products ?? []);
      } catch (err) {
        console.error('Fetch product error:', err);
      }
      if (!cancelled) setLoading(false);
    }

    fetchProduct();
    return () => { cancelled = true; };
  }, [slug]);

  async function handleAddToCart() {
    if (!user) { navigate('/login'); return; }
    await addToCart(product!, selectedVariant, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  async function handleBuyNow() {
    if (!user) { navigate('/login'); return; }
    await addToCart(product!, selectedVariant, quantity);
    navigate('/checkout');
  }

  async function handleSubmitReview(e: FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);
    try {
      await apiFetch(`/reviews`, {
        method: 'POST',
        body: {
          product_id: product.id,
          rating: reviewRating,
          title: reviewTitle.trim() || null,
          body: reviewBody.trim() || null,
        },
      });

      setReviewSuccess(true);
      setReviewTitle('');
      setReviewBody('');
      setReviewRating(5);

      const refreshed = await apiFetch<{ reviews: Review[] }>(`/reviews/product/${encodeURIComponent(product.id)}`);
      setReviews(refreshed.reviews ?? reviews);

      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <div className="min-h-screen pt-16 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!product) return <div className="min-h-screen pt-16 flex items-center justify-center"><p className="text-neutral-500">Product not found.</p></div>;

  const images = product.images ?? [];
  const variants = product.variants ?? [];
  const sizes = [...new Set(variants.map(v => v.size))];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const wishlisted = isWishlisted(product.id);

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
  const selectedVariantStock = selectedVariant?.stock ?? null;

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map(star => reviews.filter(r => r.rating === star).length);
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : product.rating;

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-[#1a0a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          <Link to="/" className="hover:text-neutral-800 dark:hover:text-neutral-200">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-neutral-800 dark:hover:text-neutral-200">Shop</Link>
          {product.category && (
            <><span className="mx-2">/</span>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-neutral-800 dark:hover:text-neutral-200">{product.category.name}</Link></>
          )}
          <span className="mx-2">/</span>
          <span className="text-neutral-800 dark:text-neutral-200">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#2e1547] group">
              {sortedImages[selectedImage] && (
                <img
                  src={sortedImages[selectedImage].url}
                  alt={sortedImages[selectedImage].alt_text ?? product.name}
                  className="w-full h-full object-cover"
                />
              )}
              {sortedImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => (i - 1 + sortedImages.length) % sortedImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-[#2e1547]/80 hover:bg-white dark:hover:bg-[#3a1d5c] shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => (i + 1) % sortedImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-[#2e1547]/80 hover:bg-white dark:hover:bg-[#3a1d5c] shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {sortedImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary-500' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt={img.alt_text ?? ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <Link to={`/shop?category=${product.category.slug}`} className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">
                {product.category.name}
              </Link>
            )}
            <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mt-1 mb-3">{product.name}</h1>

            {product.brand && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">by <span className="font-medium text-neutral-700 dark:text-neutral-300">{product.brand}</span></p>
            )}

            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-0.5">
                {Array(5).fill(null).map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-warning-500 fill-warning-500' : 'text-neutral-200 dark:text-neutral-700 fill-neutral-200 dark:fill-neutral-700'} />
                ))}
              </div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{Math.round(avgRating*10)/10} ({totalReviews} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
              {product.compare_price && <span className="text-xl text-neutral-400 dark:text-neutral-500 line-through">₹{product.compare_price.toLocaleString('en-IN')}</span>}
              {discount && <span className="badge bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400">{discount}% off</span>}
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Color: <span className="text-neutral-500 dark:text-neutral-400">{selectedVariant?.color ?? 'Select'}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[...new Map(variants.filter(v => v.color && v.color_hex).map(v => [v.color, v])).values()].map(v => (
                    <button
                      key={v.color}
                      onClick={() => setSelectedVariant(prev => prev?.color === v.color ? null : v)}
                      title={v.color!}
                      style={{ backgroundColor: v.color_hex! }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedVariant?.color === v.color ? 'border-neutral-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Size: <span className="text-neutral-500 dark:text-neutral-400">{selectedVariant?.size ?? 'Select'}</span>
                  </p>
                  <button
                    onClick={() => setActiveTab('size')}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 underline"
                  >
                    Size Chart
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map(size => {
                    const v = variants.find(vv => vv.size === size && (!selectedVariant?.color || vv.color === selectedVariant.color));
                    const isSelected = selectedVariant?.size === size;
                    const outOfStock = v ? v.stock === 0 : false;
                    return (
                      <button
                        key={size}
                        onClick={() => v && !outOfStock && setSelectedVariant(v)}
                        disabled={outOfStock}
                        className={`min-w-[44px] h-10 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                          isSelected ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' :
                          outOfStock ? 'border-neutral-100 dark:border-primary-900/40 text-neutral-300 dark:text-neutral-600 cursor-not-allowed line-through' :
                          'border-neutral-200 dark:border-primary-800/40 text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-500'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {selectedVariantStock !== null && (
                  <p className={`mt-2 text-xs ${selectedVariantStock > 5 ? 'text-success-600' : selectedVariantStock > 0 ? 'text-warning-600' : 'text-error-600'}`}>
                    {selectedVariantStock > 5 ? `In Stock (${selectedVariantStock} left)` : selectedVariantStock > 0 ? `Only ${selectedVariantStock} left!` : 'Out of Stock'}
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-200 dark:border-primary-800/40 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-[#2e1547] transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2.5 font-medium text-sm min-w-[40px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-[#2e1547] transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  addedToCart
                    ? 'bg-success-600 text-white'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95'
                }`}
              >
                {addedToCart ? <><Check size={18} /> Added!</> : <><ShoppingBag size={18} /> Add to Cart</>}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 btn-primary py-3.5 rounded-xl text-sm justify-center"
              >
                Buy Now
              </button>
              <button
                onClick={() => user ? toggle(product) : navigate('/login')}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  wishlisted ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'border-neutral-200 dark:border-primary-800/40 text-neutral-600 dark:text-neutral-300 hover:border-primary-300'
                }`}
              >
                <Heart size={20} className={wishlisted ? 'fill-primary-600' : ''} />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="border border-neutral-100 dark:border-primary-900/40 rounded-xl p-4 space-y-3">
              {[
                { Icon: Truck, text: 'Free delivery on orders above ₹999' },
                { Icon: RotateCcw, text: '7-day easy return policy' },
                { Icon: Shield, text: 'Secure checkout with encrypted payments' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <Icon size={16} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-neutral-100 dark:bg-[#2e1547] text-neutral-600 dark:text-neutral-400 text-xs rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-neutral-200 dark:border-primary-900/40">
            <div className="flex gap-8">
              {(['description', 'size', 'reviews'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-primary-700 dark:text-primary-400' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
                >
                  {tab === 'reviews' ? `Reviews (${totalReviews})` : tab === 'size' ? 'Size Chart' : 'Description'}
                </button>
              ))}
            </div>
          </div>
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <p>{product.description}</p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-sm">
                  <li>Brand: {product.brand}</li>
                  {product.sku && <li>SKU: {product.sku}</li>}
                  <li>Category: {product.category?.name}</li>
                </ul>
              </div>
            )}
            {activeTab === 'size' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#2e1547]">
                      {['Size', 'Chest (in)', 'Waist (in)', 'Hips (in)', 'Length (in)'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-primary-800/40">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[['XS','30-32','24-26','34-36','24'],['S','32-34','26-28','36-38','25'],['M','34-36','28-30','38-40','26'],['L','36-38','30-32','40-42','27'],['XL','38-40','32-34','42-44','28'],['XXL','40-42','34-36','44-46','29']].map(row => (
                      <tr key={row[0]} className="hover:bg-neutral-50 dark:hover:bg-[#2e1547]">
                        {row.map((cell, i) => (
                          <td key={i} className="px-4 py-3 border border-neutral-200 dark:border-primary-800/40 text-neutral-600 dark:text-neutral-400">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">Measurements are approximate. For assistance, contact us.</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Rating breakdown */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center md:text-left">
                    <p className="text-5xl font-bold text-neutral-900 dark:text-white">{Math.round(avgRating*10)/10}</p>
                    <div className="flex gap-0.5 justify-center md:justify-start mt-2">
                      {Array(5).fill(null).map((_, i) => (
                        <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-warning-500 fill-warning-500' : 'text-neutral-200 dark:text-neutral-700 fill-neutral-200 dark:fill-neutral-700'} />
                      ))}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">{totalReviews} review{totalReviews === 1 ? '' : 's'}</p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    {[5, 4, 3, 2, 1].map((star, i) => {
                      const count = ratingCounts[i];
                      const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="w-12 text-neutral-600 dark:text-neutral-400 flex items-center gap-1">{star} <Star size={12} className="text-warning-500 fill-warning-500" /></span>
                          <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-[#2e1547] overflow-hidden">
                            <div className="h-full bg-warning-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-neutral-500 dark:text-neutral-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review submission form (logged-in users only) */}
                {user ? (
                  <form onSubmit={handleSubmitReview} className="card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Write a Review</h3>
                    {reviewSuccess && (
                      <p className="text-sm text-success-600 bg-success-50 dark:bg-success-900/20 px-3 py-2 rounded-lg">Review submitted! It will appear once approved.</p>
                    )}
                    {reviewError && (
                      <p className="text-sm text-error-600 bg-error-50 dark:bg-error-900/20 px-3 py-2 rounded-lg">{reviewError}</p>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1"
                            aria-label={`${star} star${star === 1 ? '' : 's'}`}
                          >
                            <Star size={24} className={star <= reviewRating ? 'text-warning-500 fill-warning-500' : 'text-neutral-200 dark:text-neutral-700 fill-neutral-200 dark:fill-neutral-700'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Title (optional)</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={e => setReviewTitle(e.target.value)}
                        maxLength={120}
                        className="input"
                        placeholder="Summarize your experience"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Review (optional)</label>
                      <textarea
                        value={reviewBody}
                        onChange={e => setReviewBody(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        className="input"
                        placeholder="What did you like or dislike?"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
                    >
                      {submittingReview ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="card p-6 text-center">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link> to write a review.
                    </p>
                  </div>
                )}

                {/* Reviews list */}
                <div className="space-y-4">
                  {totalReviews === 0 ? (
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map(r => (
                      <div key={r.id} className="card p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">{r.user_name}</p>
                            <div className="flex gap-0.5 mt-1">
                              {Array(5).fill(null).map((_, i) => (
                                <Star key={i} size={12} className={i < r.rating ? 'text-warning-500 fill-warning-500' : 'text-neutral-200 dark:text-neutral-700 fill-neutral-200 dark:fill-neutral-700'} />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                        {r.title && <p className="font-medium text-sm text-neutral-700 dark:text-neutral-300 mb-1">{r.title}</p>}
                        {r.body && <p className="text-sm text-neutral-600 dark:text-neutral-400">{r.body}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
