import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './AuthContext';
import { WishlistItem, Product } from '../types';

interface WishlistContextType {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  loading: boolean;
  refetch: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);

    try {
      const response = await apiFetch<{ items: WishlistItem[] }>(`/wishlist`);
      setItems(response.items ?? []);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
      setItems([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  function isWishlisted(productId: string) {
    return items.some(i => i.product_id === productId);
  }

  async function toggle(product: Product) {
    if (!user) return;
    if (isWishlisted(product.id)) {
      await remove(product.id);
    } else {
      try {
        await apiFetch(`/wishlist`, {
          method: 'POST',
          body: { product_id: product.id },
        });
        await fetchWishlist();
      } catch (err) {
        console.error('Add to wishlist error:', err);
      }
    }
  }

  async function remove(productId: string) {
    if (!user) return;
    try {
      await apiFetch(`/wishlist/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
      setItems(prev => prev.filter(i => i.product_id !== productId));
    } catch (err) {
      console.error('Remove from wishlist error:', err);
    }
  }

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggle, remove, loading, refetch: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
