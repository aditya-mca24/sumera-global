import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, X, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../lib/api';
import { Coupon, Product } from '../types';

export default function Cart() {
  const { items, count, total, removeFromCart, updateQuantity, loading: cartLoading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const SHIPPING = total >= 999 || total === 0 ? 0 : 79;
  const grandTotal = Math.max(0, total - appliedDiscount + SHIPPING);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError('');
    try {
      const response = await apiFetch<{ coupon: Coupon; discount: number }>(`/coupons/validate`, {
        method: 'POST',
        body: { code: couponCode.trim().toUpperCase(), subtotal: total },
      });

      setAppliedCoupon(response.coupon);
      setAppliedDiscount(Math.round(response.discount));
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon code');
      setAppliedCoupon(null);
      setAppliedDiscount(0);
    } finally {
      setApplying(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setAppliedDiscount(0);
    setCouponCode('');
    setCouponError('');
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e] flex items-center justify-center px-4">
        <Loader2 size={40} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-[#2e1547] flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-neutral-300 dark:text-neutral-600" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-2">Your cart is empty</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Let's find something you'll love.
        </p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">
            Shopping Cart
          </h1>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product as Product;
              const primaryImage = product?.images?.find((i) => i.is_primary) ?? product?.images?.[0];
              const variant = item.variant;
              return (
                <div
                  key={item.id}
                  className="card p-4 sm:p-5 flex gap-4 sm:gap-6"
                >
                  {/* Image */}
                  <Link
                    to={`/product/${product?.slug}`}
                    className="shrink-0 w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#2e1547]"
                  >
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={primaryImage.alt_text ?? product?.name ?? ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={24} className="text-neutral-300 dark:text-neutral-600" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${product?.slug}`}
                          className="font-medium text-neutral-900 dark:text-white hover:text-primary-700 dark:hover:text-primary-400 transition-colors line-clamp-2"
                        >
                          {product?.name}
                        </Link>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {product?.brand}
                        </p>
                        {(variant?.size || variant?.color) && (
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {variant?.size && (
                              <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-[#2e1547] text-neutral-600 dark:text-neutral-300">
                                Size: {variant.size}
                              </span>
                            )}
                            {variant?.color && (
                              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-[#2e1547] text-neutral-600 dark:text-neutral-300">
                                {variant.color_hex && (
                                  <span
                                    className="w-3 h-3 rounded-full border border-neutral-300 dark:border-neutral-600"
                                    style={{ backgroundColor: variant.color_hex }}
                                  />
                                )}
                                {variant.color}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="shrink-0 p-2 -mt-1 -mr-1 text-neutral-400 hover:text-error-600 dark:hover:text-error-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quantity + Price */}
                    <div className="flex items-end justify-between mt-auto pt-4">
                      <div className="inline-flex items-center border border-neutral-200 dark:border-primary-800/40 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-primary-700 dark:hover:text-primary-400 disabled:opacity-40"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-neutral-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-primary-700 dark:hover:text-primary-400"
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          ₹{((product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                        </p>
                        {product?.price && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-500">
                            ₹{product.price.toLocaleString('en-IN')} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowRight size={16} className="rotate-180" /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white mb-5">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Have a coupon?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag size={16} className="text-success-600 dark:text-success-400 shrink-0" />
                      <span className="text-sm font-medium text-success-700 dark:text-success-300 truncate">
                        {appliedCoupon.code}
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="shrink-0 text-success-600 dark:text-success-400 hover:text-success-800 dark:hover:text-success-200"
                      aria-label="Remove coupon"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="input flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={applying || !couponCode.trim()}
                        className="btn-secondary px-4 disabled:opacity-60 inline-flex items-center justify-center"
                      >
                        {applying ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-error-600 dark:text-error-400 text-xs mt-1.5">{couponError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-neutral-100 dark:border-primary-900/40 pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                  <span className="font-medium text-neutral-900 dark:text-white">₹{total.toLocaleString('en-IN')}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success-600 dark:text-success-400">Discount</span>
                    <span className="font-medium text-success-600 dark:text-success-400">−₹{appliedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Shipping</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {SHIPPING === 0 ? 'Free' : `₹${SHIPPING}`}
                  </span>
                </div>
                {SHIPPING > 0 && total < 999 && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Add ₹{(999 - total).toLocaleString('en-IN')} more for free shipping
                  </p>
                )}
                <div className="flex justify-between items-baseline border-t border-neutral-100 dark:border-primary-900/40 pt-4">
                  <span className="font-serif font-bold text-neutral-900 dark:text-white">Total</span>
                  <span className="font-serif font-bold text-xl text-neutral-900 dark:text-white">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                state={{ couponCode: appliedCoupon?.code ?? null, discount: appliedDiscount }}
                className="btn-primary w-full justify-center mt-6 py-3.5 inline-flex items-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-4">
                Secure checkout · Free returns within 7 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
