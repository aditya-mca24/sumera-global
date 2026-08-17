import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  MapPin,
  Mail,
  Phone,
  Plus,
  Pencil,
  Trash2,
  Check,
  Loader2,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Address, AddressData, Order } from '../types';

type Tab = 'profile' | 'orders' | 'addresses';

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

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-neutral-100 text-neutral-600 dark:bg-[#2e1547] dark:text-neutral-300',
  confirmed: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  processing: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  shipped: 'bg-info-100 text-info-700 dark:bg-info-900/40 dark:text-info-300',
  delivered: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  cancelled: 'bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300',
  returned: 'bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300',
};

export default function Account() {
  const { user, refreshProfile } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState<Tab>('profile');
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      setPaymentNotice('Payment successful. Your order has been placed successfully.');
      setTab('orders');
    } else if (paymentStatus === 'cancelled') {
      setPaymentNotice('Payment was cancelled. You can try again or choose a different payment method.');
    } else {
      setPaymentNotice(null);
    }
  }, [location.search]);

  // Profile
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', avatar_url: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<AddressData>(EMPTY_ADDRESS);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name ?? '',
        phone: user.phone ?? '',
        avatar_url: user.avatar_url ?? '',
      });
    }
  }, [user]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const response = await apiFetch<{ orders: Order[] }>(`/orders`);
        setOrders(response.orders ?? []);
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [user]);

  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;
      try {
        const response = await apiFetch<{ addresses: Address[] }>(`/addresses`);
        setAddresses(response.addresses ?? []);
      } catch (err) {
        console.error('Fetch addresses error:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      await apiFetch<{ user: any }>(`/auth/me`, {
        method: 'PUT',
        body: {
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          avatar_url: profileForm.avatar_url,
        },
      });
      await refreshProfile();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSavingProfile(false);
    }
  }

  function startNewAddress() {
    setEditingAddrId(null);
    setAddrForm(EMPTY_ADDRESS);
    setShowAddrForm(true);
  }

  function startEditAddress(addr: Address) {
    setEditingAddrId(addr.id);
    setAddrForm({
      full_name: addr.full_name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 ?? '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
    });
    setShowAddrForm(true);
  }

  function updateAddrField(field: keyof AddressData, value: string) {
    setAddrForm((f) => ({ ...f, [field]: value }));
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingAddr(true);
    try {
      if (editingAddrId) {
        const response = await apiFetch<{ address: Address }>(`/addresses/${editingAddrId}`, {
          method: 'PUT',
          body: {
            full_name: addrForm.full_name,
            phone: addrForm.phone,
            line1: addrForm.line1,
            line2: addrForm.line2,
            city: addrForm.city,
            state: addrForm.state,
            pincode: addrForm.pincode,
            country: addrForm.country,
            is_default: addresses.length === 0,
          },
        });
        const updated = response.address;
        setAddresses((prev) => prev.map((a) => (a.id === editingAddrId ? updated : a)));
      } else {
        const response = await apiFetch<{ address: Address }>(`/addresses`, {
          method: 'POST',
          body: {
            full_name: addrForm.full_name,
            phone: addrForm.phone,
            line1: addrForm.line1,
            line2: addrForm.line2,
            city: addrForm.city,
            state: addrForm.state,
            pincode: addrForm.pincode,
            country: addrForm.country,
            is_default: addresses.length === 0,
          },
        });
        const created = response.address;
        setAddresses((prev) => [...prev, created]);
      }
      setShowAddrForm(false);
      setEditingAddrId(null);
      setAddrForm(EMPTY_ADDRESS);
    } catch (err) {
      console.error('Save address error:', err);
    } finally {
      setSavingAddr(false);
    }
  }

  async function deleteAddress(id: string) {
    if (!user) return;
    if (!confirm('Delete this address?')) return;
    try {
      await apiFetch(`/addresses/${id}`, { method: 'DELETE' });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Delete address error:', err);
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  return (
    <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {paymentNotice && (
          <div className="mb-6 rounded-xl border border-success-200 bg-success-50 text-success-700 dark:border-success-800 dark:bg-success-900/20 dark:text-success-300 px-4 py-3 text-sm font-medium">
            {paymentNotice}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">My Account</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Welcome back, {user?.full_name || user?.email}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <aside className="lg:col-span-1">
            <nav className="card p-2 flex lg:flex-col gap-1 overflow-x-auto">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      tab === t.id
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#2e1547]'
                    }`}
                  >
                    <Icon size={18} /> {t.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {tab === 'profile' && (
              <section className="card p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <UserIcon size={20} className="text-primary-600 dark:text-primary-400" />
                  <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">Profile Information</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-[#2e1547]/50">
                    <Mail size={18} className="text-neutral-400" />
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">Email</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-[#2e1547]/50">
                    <Phone size={18} className="text-neutral-400" />
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">Phone</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {user?.phone || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                    Edit Profile
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                        className="input"
                        placeholder="Priya Sharma"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                        className="input"
                        placeholder="9876543210"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Avatar URL <span className="text-neutral-400">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={profileForm.avatar_url}
                        onChange={(e) => setProfileForm((f) => ({ ...f, avatar_url: e.target.value }))}
                        className="input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Save Changes
                    </button>
                    {profileSaved && (
                      <span className="text-sm text-success-600 dark:text-success-400 inline-flex items-center gap-1">
                        <Check size={16} /> Saved!
                      </span>
                    )}
                  </div>
                </form>
              </section>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
              <section className="card p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Package size={20} className="text-primary-600 dark:text-primary-400" />
                  <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">Order History</h2>
                </div>

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-primary-600" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-[#2e1547] flex items-center justify-center mb-4">
                      <ShoppingBag size={32} className="text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="btn-primary">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-neutral-200 dark:border-primary-800/40 rounded-xl overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-neutral-50 dark:bg-[#2e1547]/50">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-neutral-400 dark:text-neutral-500">Order ID</p>
                              <p className="text-sm font-medium text-neutral-900 dark:text-white font-mono">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400 dark:text-neutral-500">Placed on</p>
                              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                              {order.status}
                            </span>
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                              ₹{order.total.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          {order.items && order.items.length > 0 ? (
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-neutral-100 dark:bg-[#2e1547] shrink-0">
                                    {item.product_image ? (
                                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag size={14} className="text-neutral-300 dark:text-neutral-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{item.product_name}</p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                      {item.variant_size ? `Size ${item.variant_size}` : ''}
                                      {item.variant_color ? ` · ${item.variant_color}` : ''} · Qty {item.quantity}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                    ₹{item.total_price.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-neutral-400 dark:text-neutral-500">No item details available.</p>
                          )}
                          {order.shipping_address && (
                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-primary-900/40 flex items-start gap-2">
                              <MapPin size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {order.shipping_address.full_name}, {order.shipping_address.line1}
                                {order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''},{' '}
                                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Addresses Tab */}
            {tab === 'addresses' && (
              <section className="card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-primary-600 dark:text-primary-400" />
                    <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">Saved Addresses</h2>
                  </div>
                  {!showAddrForm && (
                    <button
                      onClick={startNewAddress}
                      className="btn-secondary inline-flex items-center gap-2 text-sm"
                    >
                      <Plus size={16} /> Add Address
                    </button>
                  )}
                </div>

                {showAddrForm && (
                  <form onSubmit={saveAddress} className="mb-6 border border-neutral-200 dark:border-primary-800/40 rounded-xl p-5 bg-neutral-50/50 dark:bg-[#2e1547]/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {editingAddrId ? 'Edit Address' : 'New Address'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => { setShowAddrForm(false); setEditingAddrId(null); setAddrForm(EMPTY_ADDRESS); }}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
                        <input type="text" required value={addrForm.full_name} onChange={(e) => updateAddrField('full_name', e.target.value)} className="input" placeholder="Priya Sharma" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Phone</label>
                        <input type="tel" required value={addrForm.phone} onChange={(e) => updateAddrField('phone', e.target.value)} className="input" placeholder="9876543210" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Address Line 1</label>
                        <input type="text" required value={addrForm.line1} onChange={(e) => updateAddrField('line1', e.target.value)} className="input" placeholder="House / Flat no, Building" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Address Line 2 <span className="text-neutral-400">(optional)</span></label>
                        <input type="text" value={addrForm.line2} onChange={(e) => updateAddrField('line2', e.target.value)} className="input" placeholder="Area, Landmark" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">City</label>
                        <input type="text" required value={addrForm.city} onChange={(e) => updateAddrField('city', e.target.value)} className="input" placeholder="Mumbai" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">State</label>
                        <input type="text" required value={addrForm.state} onChange={(e) => updateAddrField('state', e.target.value)} className="input" placeholder="Maharashtra" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Pincode</label>
                        <input type="text" required value={addrForm.pincode} onChange={(e) => updateAddrField('pincode', e.target.value)} className="input" placeholder="400001" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Country</label>
                        <input type="text" required value={addrForm.country} onChange={(e) => updateAddrField('country', e.target.value)} className="input" />
                      </div>
                    </div>
                    <button type="submit" disabled={savingAddr} className="btn-primary mt-4 inline-flex items-center gap-2 disabled:opacity-60">
                      {savingAddr ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {editingAddrId ? 'Update Address' : 'Save Address'}
                    </button>
                  </form>
                )}

                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-primary-600" />
                  </div>
                ) : addresses.length === 0 && !showAddrForm ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-[#2e1547] flex items-center justify-center mb-4">
                      <MapPin size={32} className="text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">No saved addresses yet.</p>
                    <button onClick={startNewAddress} className="btn-primary inline-flex items-center gap-2">
                      <Plus size={16} /> Add Address
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-neutral-200 dark:border-primary-800/40 rounded-xl p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-white">{addr.full_name}</span>
                            {addr.is_default && (
                              <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">Default</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditAddress(addr)}
                              className="p-1.5 text-neutral-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                              aria-label="Edit address"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="p-1.5 text-neutral-400 hover:text-error-600 dark:hover:text-error-400 transition-colors"
                              aria-label="Delete address"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{addr.phone}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
