import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Check,
  CreditCard,
  Truck,
  Wallet,
  Loader2,
  ChevronLeft,
  ShoppingBag,
  StickyNote,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Address, AddressData } from '../types';

interface LocationState {
  couponCode?: string | null;
  discount?: number;
}

type PaymentMethod = 'cod' | 'debit_card' | 'credit_card' | 'upi' | 'net_banking';

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; description: string; icon: typeof Wallet }> = [
  { value: 'cod', label: 'COD', description: 'Pay on delivery', icon: Truck },
  { value: 'debit_card', label: 'Debit Card', description: 'Debit card payment', icon: CreditCard },
  { value: 'credit_card', label: 'Credit Card', description: 'Credit card payment', icon: CreditCard },
  { value: 'upi', label: 'UPI', description: 'Pay via UPI', icon: Wallet },
  { value: 'net_banking', label: 'Net Banking', description: 'Bank transfer', icon: Wallet },
];

const EMPTY_ADDRESS: AddressData = {
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function Checkout() {
  const { items, total, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const passedState = (location.state ?? {}) as LocationState;
  const couponCode = passedState.couponCode ?? null;
  const discount = passedState.discount ?? 0;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressData>(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [razorpayOrderData, setRazorpayOrderData] = useState<{
    orderId: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
    userEmail: string;
    userName: string;
  } | null>(null);

  const SHIPPING = total >= 999 || total === 0 ? 0 : 79;
  const grandTotal = Math.max(0, total - discount + SHIPPING);

  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;
      try {
        const response = await apiFetch<{ addresses: Address[] }>(`/addresses`);
        const addrs = response.addresses ?? [];
        setAddresses(addrs);
        if (addrs.length > 0) {
          const def = addrs.find((a) => a.is_default) ?? addrs[0];
          setSelectedAddressId(def.id);
        } else {
          setShowForm(true);
        }
      } catch (err) {
        console.error('Fetch addresses error:', err);
        setShowForm(true);
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, [user]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Redirect to cart if empty (but allow order placement flow to finish)
  useEffect(() => {
    if (!loadingAddresses && !cartLoading && items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, loadingAddresses, cartLoading, navigate]);

  function updateField(field: keyof AddressData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingAddress(true);
    setError('');
    try {
      const response = await apiFetch<{ address: Address }>(`/addresses`, {
        method: 'POST',
        body: {
          full_name: form.full_name,
          phone: form.phone,
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
          is_default: addresses.length === 0,
        },
      });
      const address = response.address;
      setAddresses((prev) => [...prev, address]);
      setSelectedAddressId(address.id);
      setShowForm(false);
      setForm(EMPTY_ADDRESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('Please sign in to place an order.');
      return;
    }

    if (selectedAddressId === 'new') {
      setError('Please add or select a shipping address.');
      return;
    }
    const addr = addresses.find((a) => a.id === selectedAddressId);
    if (!addr) {
      setError('Please select a valid shipping address.');
      return;
    }
    const addressData: AddressData = {
      full_name: addr.full_name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 ?? '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
    };

    const orderPayload = {
      items: items.map((i) => ({
        product_id: i.product_id,
        product_name: i.product?.name ?? '',
        product_image: i.product?.images?.[0]?.url ?? null,
        variant_size: i.variant?.size ?? null,
        variant_color: i.variant?.color ?? null,
        quantity: i.quantity,
        unit_price: i.product?.price ?? 0,
        total_price: (i.product?.price ?? 0) * i.quantity,
      })),
      shipping_address: addressData,
      payment_method: paymentMethod,
      coupon_code: couponCode,
      notes,
      subtotal: total,
      discount,
      shipping: SHIPPING,
      total: grandTotal,
    };

    setPlacing(true);
    try {
      if (paymentMethod === 'cod') {
        await apiFetch(`/orders`, {
          method: 'POST',
          body: orderPayload,
        });

        await clearCart();
        navigate('/account');
        return;
      }

      // For online payments, create Razorpay order
      const result = await apiFetch<{
        orderId: string;
        razorpayOrderId: string;
        razorpayKeyId: string;
        amount: number;
        currency: string;
        userEmail: string;
        userName: string;
      }>(`/payments/checkout`, {
        method: 'POST',
        body: orderPayload,
      });

      setRazorpayOrderData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setPlacing(false);
    }
  }

  function handleRazorpayPayment() {
    if (!razorpayOrderData) return;

    const options = {
      key: razorpayOrderData.razorpayKeyId,
      order_id: razorpayOrderData.razorpayOrderId,
      amount: razorpayOrderData.amount,
      currency: razorpayOrderData.currency,
      name: 'Surema Fashion',
      description: 'Complete your purchase',
      customer_notification: 1,
      prefill: {
        email: razorpayOrderData.userEmail,
        contact: '',
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // Verify payment on backend
          await apiFetch(`/payments/verify`, {
            method: 'POST',
            body: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: razorpayOrderData.orderId,
            },
          });

          await clearCart();
          setRazorpayOrderData(null);
          navigate('/account?payment=success');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Payment verification failed');
          setRazorpayOrderData(null);
        }
      },
      modal: {
        ondismiss: () => {
          setRazorpayOrderData(null);
          setPlacing(false);
        },
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }

  useEffect(() => {
    if (razorpayOrderData && !placing) {
      handleRazorpayPayment();
    }
  }, [razorpayOrderData, placing]);

  if (loadingAddresses) {
    return (
      <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Back to Cart
        </Link>

        <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-8">Checkout</h1>

        <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <section className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin size={20} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white">Shipping Address</h2>
              </div>

              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20'
                          : 'border-neutral-200 dark:border-primary-800/40 hover:border-neutral-300 dark:hover:border-primary-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            setShowForm(false);
                          }}
                          className="mt-1 accent-primary-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-neutral-900 dark:text-white">{addr.full_name}</span>
                            {addr.is_default && (
                              <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {addr.phone}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}
                          </p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <Check size={18} className="text-primary-600 dark:text-primary-400 shrink-0" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedAddressId('new');
                  setShowForm(true);
                }}
                className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                  showForm && selectedAddressId === 'new'
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-700 dark:hover:text-primary-400'
                }`}
              >
                <Plus size={16} /> Add new address
              </button>

              {showForm && selectedAddressId === 'new' && (
                <div className="mt-4 border border-neutral-200 dark:border-primary-800/40 rounded-xl p-5 bg-neutral-50/50 dark:bg-[#2e1547]/30">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={form.full_name}
                        onChange={(e) => updateField('full_name', e.target.value)}
                        className="input"
                        placeholder="Priya Sharma"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="input"
                        placeholder="9876543210"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Address Line 1</label>
                      <input
                        type="text"
                        required
                        value={form.line1}
                        onChange={(e) => updateField('line1', e.target.value)}
                        className="input"
                        placeholder="House / Flat no, Building"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Address Line 2 <span className="text-neutral-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.line2}
                        onChange={(e) => updateField('line2', e.target.value)}
                        className="input"
                        placeholder="Area, Landmark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">City</label>
                      <input
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="input"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">State</label>
                      <input
                        type="text"
                        required
                        value={form.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        className="input"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Pincode</label>
                      <input
                        type="text"
                        required
                        value={form.pincode}
                        onChange={(e) => updateField('pincode', e.target.value)}
                        className="input"
                        placeholder="400001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Country</label>
                      <input
                        type="text"
                        required
                        value={form.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={saveAddress}
                    disabled={savingAddress}
                    className="btn-secondary mt-4 inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {savingAddress ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Save Address
                  </button>
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={20} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white">Payment Method</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(({ value, label, description, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === value
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-primary-800/40 hover:border-neutral-300 dark:hover:border-primary-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                      className="accent-primary-600"
                    />
                    <Icon size={20} className="text-neutral-500 dark:text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{label}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Order Notes */}
            <section className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <StickyNote size={20} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white">Order Notes</h2>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Any special instructions for delivery? (optional)"
              />
            </section>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white mb-5">Order Summary</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-5 pr-1">
                {items.map((item) => {
                  const product = item.product;
                  const primaryImage = product?.images?.find((i) => i.is_primary) ?? product?.images?.[0];
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-[#2e1547] shrink-0">
                        {primaryImage ? (
                          <img src={primaryImage.url} alt={product?.name ?? ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={16} className="text-neutral-300 dark:text-neutral-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{product?.name}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {item.variant?.size ? `Size ${item.variant.size}` : ''} {item.variant?.color ? `· ${item.variant.color}` : ''} · Qty {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5">
                          ₹{((product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-neutral-100 dark:border-primary-900/40 pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                  <span className="font-medium text-neutral-900 dark:text-white">₹{total.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success-600 dark:text-success-400">Discount{couponCode ? ` (${couponCode})` : ''}</span>
                    <span className="font-medium text-success-600 dark:text-success-400">−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Shipping</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {SHIPPING === 0 ? 'Free' : `₹${SHIPPING}`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-t border-neutral-100 dark:border-primary-900/40 pt-4">
                  <span className="font-serif font-bold text-neutral-900 dark:text-white">Total</span>
                  <span className="font-serif font-bold text-xl text-neutral-900 dark:text-white">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-error-600 dark:text-error-400 text-sm bg-error-50 dark:bg-error-900/20 px-3 py-2 rounded-lg mt-4">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={placing || selectedAddressId === 'new'}
                className="btn-primary w-full justify-center mt-6 py-3.5 inline-flex items-center gap-2 disabled:opacity-60"
              >
                {placing ? (
                  <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order</>
                )}
              </button>

              <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-4">
                By placing your order, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
