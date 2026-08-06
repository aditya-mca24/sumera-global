import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  RotateCcw,
  ShieldCheck,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Banner, Product, Category } from '../types';
import ProductCard from '../components/shop/ProductCard';

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Fashion Blogger', rating: 5, text: 'Surema never disappoints! The quality of their co-ord sets is unmatched. Soft fabric, perfect stitching — worth every rupee.' },
  { name: 'Anjali Verma', role: 'Regular Customer', rating: 5, text: 'Ordered a bulk set of kurtis for my boutique. The production quality was amazing and delivery was on time. Highly recommended!' },
  { name: 'Sneha Patel', role: 'Influencer', rating: 5, text: 'The wrap dress I got is absolutely stunning. Got hundreds of compliments at the event. Will definitely shop again!' },
  { name: 'Meera Joshi', role: 'Entrepreneur', rating: 5, text: 'Their bulk order service is a game-changer for small boutique owners. Great communication, great quality.' },
];

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          bannersRes,
          featuredRes,
          bestSellersRes,
          newArrivalsRes,
          categoriesRes,
          latestRes,
        ] = await Promise.all([
          apiFetch<{ banners: Banner[] }>(`/banners`),
          apiFetch<{ products: Product[] }>(`/products?filter=featured&limit=8`),
          apiFetch<{ products: Product[] }>(`/products?filter=bestseller&limit=8`),
          apiFetch<{ products: Product[] }>(`/products?filter=new&limit=8`),
          apiFetch<{ categories: Category[] }>(`/categories`),
          apiFetch<{ products: Product[] }>(`/products?page=1&limit=4&sort=newest`),
        ]);

        setBanners(bannersRes.banners ?? []);
        setFeaturedProducts(featuredRes.products ?? []);
        setBestSellers(bestSellersRes.products ?? []);
        setNewArrivals(newArrivalsRes.products ?? []);
        setCategories(categoriesRes.categories ?? []);
        setLatestProducts(latestRes.products ?? []);
      } catch (err) {
        console.error('Fetch home data error:', err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Auto-rotate hero carousel
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setCurrentBanner(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners]);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      await apiFetch(`/newsletter`, {
        method: 'POST',
        body: { email },
      });
    } catch {
      // ignore duplicate / network errors — still show success
    }
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  }

  return (
    <div>
      {/* Hero Banner Carousel */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {banners.length === 0 ? (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-neutral-900 to-accent-900" />
        ) : (
          banners.map((banner, i) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === currentBanner ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            </div>
          ))
        )}

        {banners.length > 0 && (
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl animate-slide-up">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-500/80 to-accent-500/80 text-white text-xs font-medium rounded-full mb-4 tracking-wider uppercase border border-white/10">
                  New Collection
                </span>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-4">
                  {banners[currentBanner]?.title}
                </h1>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  {banners[currentBanner]?.subtitle}
                </p>
                <div className="flex gap-4">
                  <Link
                    to={banners[currentBanner]?.link_url ?? '/shop'}
                    className="btn-primary text-base px-8 py-4 rounded-xl"
                  >
                    {banners[currentBanner]?.button_text ?? 'Shop Now'} <ArrowRight size={18} />
                  </Link>
                  <Link to="/bulk-order" className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/40 text-white font-medium text-base hover:bg-white/10 transition-all duration-200">
                    Bulk Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banner Nav Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${i === currentBanner ? 'bg-white w-8 h-2.5' : 'bg-white/40 w-2.5 h-2.5'}`}
              />
            ))}
          </div>
        )}

        {/* Carousel Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentBanner(i => (i - 1 + banners.length) % banners.length)}
              aria-label="Previous banner"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentBanner(i => (i + 1) % banners.length)}
              aria-label="Next banner"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </section>

      {/* Trust Badges */}
      <section className="bg-gradient-to-r from-primary-50 via-white to-accent-50 dark:from-[#241038] dark:via-[#241038] dark:to-[#241038] border-y border-primary-100 dark:border-primary-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Truck, label: 'Free Delivery', sub: 'On orders above ₹999' },
              { Icon: RotateCcw, label: 'Easy Returns', sub: '7-day return policy' },
              { Icon: ShieldCheck, label: 'Secure Payments', sub: '100% safe & encrypted' },
              { Icon: Package, label: 'Bulk Orders', sub: 'Factory-direct pricing' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <Icon size={18} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{label}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {(featuredProducts.length > 0 || loading) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-primary-600 dark:text-primary-400 text-sm font-medium tracking-wider uppercase mb-1">Handpicked</p>
                <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">Featured Products</h2>
              </div>
              <Link to="/shop?filter=featured" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {loading
                ? Array(8).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
                : featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 bg-gradient-to-b from-primary-50/50 to-white dark:from-[#241038] dark:to-[#1a0a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary-600 dark:text-primary-400 text-sm font-medium tracking-wider uppercase mb-1">Browse</p>
              <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">Shop by Category</h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
              All Categories <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {(categories.length > 0 ? categories : Array(7).fill(null)).map((cat, i) => (
              <Link
                key={cat?.id ?? i}
                to={cat ? `/shop?category=${cat.slug}` : '#'}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-neutral-200 dark:bg-[#2e1547]"
              >
                {cat?.image_url && (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-xs sm:text-sm font-semibold leading-tight">{cat?.name ?? '...'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {(bestSellers.length > 0 || loading) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-primary-600 dark:text-primary-400 text-sm font-medium tracking-wider uppercase mb-1">Popular</p>
                <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">Best Sellers</h2>
              </div>
              <Link to="/shop?filter=bestseller" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {loading
                ? Array(8).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
                : bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Offer Banner */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-accent-800 to-primary-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 text-xs font-semibold rounded-full mb-5 tracking-wider uppercase border border-primary-500/30">
                Limited Time
              </span>
              <h2 className="text-4xl font-serif font-bold text-white mb-4">
                Get 20% Off Your First Order
              </h2>
              <p className="text-primary-100 mb-7 leading-relaxed">
                Use code <span className="text-white font-semibold bg-white/10 px-2 py-0.5 rounded">WELCOME10</span> at checkout. Valid on all products. Don't miss this exclusive welcome offer!
              </p>
              <Link to="/shop" className="btn-primary text-base px-8 py-4 rounded-xl">
                Shop Now <ArrowRight size={18} />
              </Link>
            </div>
            <div className="relative">
              <img
                src="img13.png"
                alt="Offer"
                className="rounded-2xl w-full h-85 object-cover shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg">
                <span className="text-2xl font-bold">10%</span>
                <span className="text-xs">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {(newArrivals.length > 0 || loading) && (
        <section className="py-16 bg-gradient-to-b from-primary-50/50 to-white dark:from-[#241038] dark:to-[#1a0a2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-primary-600 dark:text-primary-400 text-sm font-medium tracking-wider uppercase mb-1">Fresh</p>
                <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">New Arrivals</h2>
              </div>
              <Link to="/shop?filter=new" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {loading
                ? Array(8).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
                : newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-b from-white to-primary-50/30 dark:from-[#1a0a2e] dark:to-[#241038]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 dark:text-primary-400 text-sm font-medium tracking-wider uppercase mb-2">Reviews</p>
            <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array(5).fill(null).map((_, j) => (
                    <Star key={j} size={14} className={j < t.rating ? 'text-warning-500 fill-warning-500' : 'text-neutral-200 dark:text-neutral-700 fill-neutral-200 dark:fill-neutral-700'} />
                  ))}
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{t.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      {(latestProducts.length > 0 || loading) && (
        <section className="py-16 bg-gradient-to-b from-primary-50/50 to-white dark:from-[#241038] dark:to-[#1a0a2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-primary-600 dark:text-primary-400 text-sm font-medium tracking-wider uppercase mb-1">Just In</p>
                <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">Latest Products</h2>
              </div>
              <Link to="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {loading
                ? Array(4).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
                : latestProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-300/20 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Mail size={28} className="text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">
            Join Our Newsletter
          </h2>
          <p className="text-primary-100 text-lg mb-8 leading-relaxed">
            Subscribe to get the latest updates on new collections, exclusive offers, and styling tips delivered straight to your inbox.
          </p>
          {subscribed ? (
            <div className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-4 rounded-xl shadow-lg">
              <CheckCircle2 size={20} />
              Thanks for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-5 py-4 rounded-xl border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-neutral-800 placeholder:text-neutral-400"
              />
              <button
                type="submit"
                className="bg-white hover:bg-neutral-100 text-primary-700 font-semibold px-8 py-4 rounded-xl transition-all duration-200 whitespace-nowrap shadow-lg hover:shadow-xl active:scale-95"
              >
                Subscribe
              </button>
            </form>
          )}
          <p className="text-primary-200 text-xs mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Bulk Order CTA */}
      <section className="py-20 bg-gradient-to-br from-neutral-900 via-primary-950 to-neutral-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            Need Bulk Orders for Your Business?
          </h2>
          <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
            We're a manufacturing-integrated fashion brand. Place custom bulk orders with your specifications, sizes, colors, and branding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/bulk-order" className="btn-primary text-base px-8 py-4 rounded-xl">
              Request a Quotation <ArrowRight size={18} />
            </Link>
            <a href="tel:+919876543210" className="border-2 border-neutral-700 text-white font-semibold px-8 py-4 rounded-xl hover:bg-neutral-800 hover:border-primary-500 transition-all duration-200">
              Call Us Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#2e1547] animate-pulse">
      <div className="aspect-[3/4] bg-neutral-200 dark:bg-[#3a1d5c]" />
      <div className="p-4">
        <div className="h-4 bg-neutral-200 dark:bg-[#3a1d5c] rounded w-3/4 mb-2" />
        <div className="h-3 bg-neutral-200 dark:bg-[#3a1d5c] rounded w-1/2" />
      </div>
    </div>
  );
}
