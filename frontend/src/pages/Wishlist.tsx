import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import ProductCard from '../components/shop/ProductCard';

export default function Wishlist() {
  const { items, remove, loading } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#1a0a2e] px-4">
        <Heart size={64} className="text-neutral-300 dark:text-neutral-700 mb-4" />
        <h2 className="text-2xl font-serif font-bold text-neutral-800 dark:text-neutral-200 mb-2">Your wishlist is empty</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-center">Sign in to save your favorite items.</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-8">
          My Wishlist {items.length > 0 && <span className="text-xl text-neutral-400 dark:text-neutral-500">({items.length})</span>}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <Heart size={64} className="text-neutral-300 dark:text-neutral-700 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-6">You haven't saved anything yet.</p>
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <ProductCard product={item.product as Product} />
                {/* Remove button */}
                <button
                  onClick={() => remove(item.product_id)}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white dark:bg-[#2e1547] shadow flex items-center justify-center text-neutral-400 hover:text-error-600 dark:hover:text-error-400 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
                {/* Add to Cart button */}
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    await addToCart(item.product as Product, null, 1);
                  }}
                  className="mt-3 w-full btn-secondary inline-flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag size={16} /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
