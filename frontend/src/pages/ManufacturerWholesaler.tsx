import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Factory,
  Building2,
  User,
  Mail,
  Phone,
  Package,
  Hash,
  MapPin,
  StickyNote,
  CheckCircle2,
  Loader2,
  Send,
  ArrowRight,
  Layers,
  Tags,
  Truck,
  ShieldCheck,
  Clock,
  TrendingUp,
  Users,
  Award,
  FileText,
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

const BUSINESS_TYPES = [
  'Retailer',
  'Wholesaler',
  'Distributor',
  'Boutique Owner',
  'E-commerce Seller',
  'Corporate / Organization',
  'Export House',
  'Other',
];

interface FormState {
  business_type: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  product_type: string;
  quantity: string;
  customization: string;
  delivery_location: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  business_type: '',
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  product_type: '',
  quantity: '',
  customization: '',
  delivery_location: '',
  notes: '',
};

const CAPABILITIES = [
  {
    Icon: Factory,
    title: 'In-House Manufacturing',
    desc: 'State-of-the-art production facility with 200+ skilled artisans and modern machinery for premium garment manufacturing.',
  },
  {
    Icon: Layers,
    title: 'Bulk Production Capacity',
    desc: 'From 25 to 50,000+ pieces per order. Flexible production lines that scale with your business needs and timelines.',
  },
  {
    Icon: Tags,
    title: 'Private Labeling & Branding',
    desc: 'Custom labels, tags, packaging, and branding solutions. Build your own fashion label with our white-label services.',
  },
  {
    Icon: ShieldCheck,
    title: 'Quality Assurance',
    desc: 'Multi-stage QC process — fabric inspection, stitching audit, and final finish check. ISO-grade quality on every batch.',
  },
  {
    Icon: Truck,
    title: 'Pan-India & Export Delivery',
    desc: 'Reliable logistics network across India and international shipping for export orders. Door-step delivery with tracking.',
  },
  {
    Icon: Clock,
    title: 'Fast Turnaround',
    desc: 'Standard orders dispatched in 7–14 days. Express production available for urgent requirements with priority scheduling.',
  },
];

const STATS = [
  { Icon: Users, value: '500+', label: 'B2B Partners' },
  { Icon: Package, value: '2M+', label: 'Pieces Produced' },
  { Icon: Award, value: '15+', label: 'Years Experience' },
  { Icon: TrendingUp, value: '98%', label: 'Repeat Order Rate' },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Submit Inquiry',
    desc: 'Share your requirements — product type, quantity, customization, and delivery details via the form below.',
  },
  {
    step: '02',
    title: 'Consultation & Quote',
    desc: 'Our B2B team reviews your needs and provides a detailed quotation within 24 hours, including timelines and pricing.',
  },
  {
    step: '03',
    title: 'Sample & Approval',
    desc: 'We produce a sample for your approval before mass production, ensuring every detail meets your expectations.',
  },
  {
    step: '04',
    title: 'Production & Delivery',
    desc: 'Once approved, we begin manufacturing with regular progress updates. Quality-checked and delivered to your doorstep.',
  },
];

export default function ManufacturerWholesaler() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ message: string; id: string } | null>(null);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate(): string | null {
    if (!form.business_type) return 'Please select your business type';
    if (!form.company_name.trim()) return 'Company/Business name is required';
    if (!form.contact_name.trim()) return 'Contact name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
    if (!form.product_type) return 'Please select a product type';
    if (!form.quantity || Number(form.quantity) < 1) return 'Please enter a valid quantity';
    if (Number(form.quantity) < 50) return 'Minimum wholesale order quantity is 50 pieces';
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
          company_name: form.company_name.trim(),
          contact_name: form.contact_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          product_type: form.product_type,
          quantity: Number(form.quantity),
          customization: form.customization.trim() || null,
          delivery_location: form.delivery_location.trim(),
          notes: `Business Type: ${form.business_type}. ${form.notes.trim() || ''}`.trim() || null,
        },
      });

      setSuccess({
        message: 'Your wholesale inquiry has been submitted successfully. Our B2B team will contact you within 24 hours with a detailed quotation.',
        id: response.id ?? '',
      });
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit inquiry');
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
              Inquiry Submitted!
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mb-2">{success.message}</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-8">
              Your reference ID is <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">#{success.id.slice(0, 8).toUpperCase()}</span>
              <br />
              Our B2B team will reach out within 24 hours with a custom quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setSuccess(null)}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                Submit Another Inquiry
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
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-accent-900 dark:from-primary-800 dark:via-primary-900 dark:to-accent-950 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-medium mb-4 border border-white/10">
              <Factory size={12} /> Manufacturer & Wholesaler
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold mb-4 leading-tight">
              Manufacturing & Wholesale Partnership
            </h1>
            <p className="text-primary-100 text-base sm:text-lg leading-relaxed mb-6">
              We're a manufacturing-integrated fashion brand offering factory-direct pricing,
              private labeling, and bulk production for retailers, wholesalers, and businesses.
              Partner with us for quality garments at unbeatable margins.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#inquiry" className="btn-primary text-base px-8 py-4 rounded-xl">
                Get a Wholesale Quote <ArrowRight size={18} />
              </a>
              <a
                href="tel:+919598603602"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/40 text-white font-medium text-base hover:bg-white/10 transition-all duration-200"
              >
                <Phone size={18} /> Call to Discuss
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {STATS.map(({ Icon, value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <Icon size={24} className="text-secondary-300 mb-2" />
                <p className="text-2xl sm:text-3xl font-serif font-bold text-white">{value}</p>
                <p className="text-sm text-primary-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-eyebrow">Our Capabilities</p>
            <h2 className="section-title">Why Partner With Surema?</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-3 max-w-2xl mx-auto">
              From design to delivery, we handle every step of the manufacturing process in-house,
              ensuring premium quality and competitive pricing for your business.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAPABILITIES.map(({ Icon, title, desc }) => (
              <div key={title} className="card p-6 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon size={22} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-serif font-bold text-neutral-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-primary-50/50 to-white dark:from-[#241038] dark:to-[#1a0a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-eyebrow">How It Works</p>
            <h2 className="section-title">Our Partnership Process</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                <div className="card p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl font-serif font-bold text-gradient">{step}</span>
                    <FileText size={18} className="text-primary-400" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-neutral-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-primary-300 dark:bg-primary-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-eyebrow">Get Started</p>
            <h2 className="section-title">Wholesale Inquiry Form</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-3">
              Fill out the form below and our B2B team will get back to you within 24 hours with a custom quote.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 sm:p-10 space-y-6">
            {/* Business Information */}
            <div>
              <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white mb-4">
                Business Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Business Type <span className="text-error-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <select
                      required
                      value={form.business_type}
                      onChange={(e) => updateField('business_type', e.target.value)}
                      className="input pl-10 appearance-none"
                    >
                      <option value="">Select business type</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Company / Business Name <span className="text-error-500">*</span>
                  </label>
                  <div className="relative">
                    <Factory size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={form.company_name}
                      onChange={(e) => updateField('company_name', e.target.value)}
                      className="input pl-10"
                      placeholder="Acme Retail Pvt. Ltd."
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
                <div className="sm:col-span-2">
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
              </div>
            </div>

            {/* Order Details */}
            <div className="border-t border-neutral-100 dark:border-primary-900/40 pt-6">
              <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white mb-4">
                Order Details
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
                      min={50}
                      required
                      value={form.quantity}
                      onChange={(e) => updateField('quantity', e.target.value)}
                      className="input pl-10"
                      placeholder="500"
                    />
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Minimum 50 pieces for wholesale</p>
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Customization Requirements <span className="text-neutral-400">(optional)</span>
                </label>
                <textarea
                  value={form.customization}
                  onChange={(e) => updateField('customization', e.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder="e.g. Custom branding, logo embroidery, specific fabric, color matching, private labeling..."
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
                      placeholder="Delivery timeline, packaging requirements, budget, GST details, etc."
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
                <><Send size={18} /> Submit Wholesale Inquiry</>
              )}
            </button>

            <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
              Our B2B team will review your inquiry and respond within 24 hours with a detailed quotation.
            </p>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 dark:from-primary-950 dark:via-primary-900 dark:to-accent-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            Ready to Scale Your Fashion Business?
          </h2>
          <p className="text-primary-100 text-lg mb-8 leading-relaxed">
            Join 500+ retailers and wholesalers who trust Surema for premium quality garments
            at factory-direct prices. Let's build something great together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#inquiry" className="btn-primary text-base px-8 py-4 rounded-xl">
              Start Your Inquiry <ArrowRight size={18} />
            </a>
            <Link to="/bulk-order" className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200">
              Looking for Smaller Bulk Orders?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
