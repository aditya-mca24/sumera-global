import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Phone,
  Package,
  Hash,
  Palette,
  Shirt,
  MapPin,
  StickyNote,
  CheckCircle2,
  Loader2,
  Send,
  ArrowRight,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const PRODUCT_TYPES = [
  'T-Shirts',
  'Polos',
  'Shirts',
  'Kurtis',
  'Co-ord Sets',
  'Dresses',
  'Hoodies',
  'Jackets',
  'Uniforms',
  'Other',
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const COLOR_OPTIONS = ['Black', 'White', 'Navy', 'Grey', 'Red', 'Blue', 'Green', 'Maroon', 'Beige', 'Custom'];

interface FormState {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  product_type: string;
  quantity: string;
  sizes: string[];
  colors: string[];
  customization: string;
  delivery_location: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  product_type: '',
  quantity: '',
  sizes: [],
  colors: [],
  customization: '',
  delivery_location: '',
  notes: '',
};

export default function BulkOrder() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ message: string; id: string } | null>(null);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleArrayItem(field: 'sizes' | 'colors', value: string) {
    setForm((f) => {
      const arr = f[field];
      return {
        ...f,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function validate(): string | null {
    if (!form.contact_name.trim()) return 'Contact name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
    if (!form.product_type) return 'Please select a product type';
    if (!form.quantity || Number(form.quantity) < 1) return 'Please enter a valid quantity';
    if (Number(form.quantity) < 25) return 'Minimum bulk order quantity is 25';
    if (form.sizes.length === 0) return 'Please select at least one size';
    if (form.colors.length === 0) return 'Please select at least one color';
    if (!form.delivery_location.trim()) return 'Delivery location is required';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiFetch<{ id: string }>(`/bulk-orders`, {
        method: 'POST',
        body: {
          company_name: form.company_name.trim() || null,
          contact_name: form.contact_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          product_type: form.product_type,
          quantity: Number(form.quantity),
          sizes: form.sizes,
          colors: form.colors,
          customization: form.customization.trim() || null,
          delivery_location: form.delivery_location.trim(),
          notes: form.notes.trim() || null,
        },
      });

      setSuccess({
        message: 'Your bulk order request has been submitted successfully. Our team will contact you within 24 hours with a quotation.',
        id: response.id ?? '',
      });
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bulk order request');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          <div className="card p-8 sm:p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-success-600 dark:text-success-400" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-3">
              Request Submitted!
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mb-2">{success.message}</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-8">
              Your request ID is <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">#{success.id.slice(0, 8).toUpperCase()}</span>
              <br />
              Our team will reach out within 24 hours with a custom quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setSuccess(null)}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                Submit Another Request
              </button>
              <Link to="/shop" className="btn-primary inline-flex items-center justify-center gap-2">
                Browse Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-medium mb-4">
              Bulk & Wholesale Orders
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Bulk Order Inquiry
            </h1>
            <p className="text-primary-100 text-base sm:text-lg leading-relaxed">
              Planning a large order for your team, boutique, or event? Get custom pricing,
              dedicated support, and quality you can trust. Minimum order: 25 pieces.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <form onSubmit={handleSubmit} className="card p-6 sm:p-10 space-y-6">
          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Company Name <span className="text-neutral-400">(optional)</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    className="input pl-10"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Contact Name <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={form.contact_name}
                    onChange={(e) => updateField('contact_name', e.target.value)}
                    className="input pl-10"
                    placeholder="Priya Sharma"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="input pl-10"
                    placeholder="priya@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Phone <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="input pl-10"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t border-neutral-100 dark:border-primary-900/40 pt-6">
            <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white mb-4">
              Product Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Product Type <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <select
                    required
                    value={form.product_type}
                    onChange={(e) => updateField('product_type', e.target.value)}
                    className="input pl-10 appearance-none"
                  >
                    <option value="">Select product type</option>
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Quantity <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="number"
                    min={25}
                    required
                    value={form.quantity}
                    onChange={(e) => updateField('quantity', e.target.value)}
                    className="input pl-10"
                    placeholder="100"
                  />
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Minimum 25 pieces</p>
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Shirt size={14} className="inline mr-1.5 -mt-0.5" />
                Sizes <span className="text-error-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleArrayItem('sizes', size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      form.sizes.includes(size)
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-neutral-200 dark:border-primary-800/40 text-neutral-600 dark:text-neutral-300 hover:border-primary-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Palette size={14} className="inline mr-1.5 -mt-0.5" />
                Colors <span className="text-error-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleArrayItem('colors', color)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      form.colors.includes(color)
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-neutral-200 dark:border-primary-800/40 text-neutral-600 dark:text-neutral-300 hover:border-primary-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Customization */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Customization Requirements <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                value={form.customization}
                onChange={(e) => updateField('customization', e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="e.g. Logo embroidery, custom tags, specific fabric, color matching..."
              />
            </div>
          </div>

          {/* Delivery & Notes */}
          <div className="border-t border-neutral-100 dark:border-primary-900/40 pt-6">
            <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white mb-4">
              Delivery & Notes
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Delivery Location <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={form.delivery_location}
                    onChange={(e) => updateField('delivery_location', e.target.value)}
                    className="input pl-10"
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Additional Notes <span className="text-neutral-400">(optional)</span>
                </label>
                <div className="relative">
                  <StickyNote size={16} className="absolute left-3 top-3 text-neutral-400" />
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="input pl-10 resize-none"
                    placeholder="Delivery timeline, packaging requirements, budget, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-error-600 dark:text-error-400 text-sm bg-error-50 dark:bg-error-900/20 px-4 py-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center py-3.5 inline-flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              <><Send size={18} /> Submit Bulk Order Request</>
            )}
          </button>

          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
            Our team will review your request and respond within 24 hours with a custom quote.
          </p>
        </form>
      </div>
    </div>
  );
}
