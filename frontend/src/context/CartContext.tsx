import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './AuthContext';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  addToCart: (product: Product, variant: ProductVariant | null, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchCart() {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const response = await apiFetch<{ items: CartItem[] }>(`/cart`);
      setItems(response.items ?? []);
    } catch (err) {
      console.error('Fetch cart error:', err);
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchCart(); }, [user]);

  async function addToCart(product: Product, variant: ProductVariant | null, quantity = 1) {
    if (!user) return;
    try {
      await apiFetch(`/cart`, {
        method: 'POST',
        body: {
          product_id: product.id,
          variant_id: variant?.id ?? null,
          quantity,
        },
      });
      await fetchCart();
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  }

  async function removeFromCart(itemId: string) {
    try {
      await apiFetch(`/cart/${itemId}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error('Remove from cart error:', err);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) { await removeFromCart(itemId); return; }
    try {
      await apiFetch(`/cart/${itemId}`, {
        method: 'PUT',
        body: { quantity },
      });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    } catch (err) {
      console.error('Update quantity error:', err);
    }
  }

  async function clearCart() {
    if (!user) return;
    try {
      await apiFetch(`/cart`, { method: 'DELETE' });
      setItems([]);
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const price = i.product?.price ?? 0;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, count, total, loading, addToCart, removeFromCart, updateQuantity, clearCart, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
