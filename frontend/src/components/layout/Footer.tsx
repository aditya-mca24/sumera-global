import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await apiFetch('/newsletter', {
        method: 'POST',
        body: { email: email.trim() },
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
    setEmail('');
    setTimeout(() => setStatus('idle'), 4000);
  }

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-primary-950 to-neutral-900 dark:from-black dark:via-primary-950 dark:to-black text-neutral-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="font-serif text-2xl font-bold tracking-wide text-gradient">SUREMA GLOBAL FASHION</Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Fashion-forward clothing straight from the factory floor. Quality you can feel, style you can trust.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-neutral-800 dark:bg-[#241038] flex items-center justify-center text-neutral-400 hover:bg-gradient-to-br hover:from-primary-500 hover:to-accent-500 hover:text-white hover:scale-110 transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Shop', href: '/shop' },
                { label: 'Bulk Orders', href: '/bulk-order' },
                { label: 'Manufacturer & Wholesaler', href: '/manufacturer-wholesaler' },
                { label: 'My Account', href: '/account' },
                { label: 'Track Order', href: '/account' },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {['Western Tops', 'Crop Tops', 'Cord Sets', 'T-Shirts', 'Jeans', 'Kurtis', 'Dresses'].map(cat => (
                <li key={cat}>
                  <Link
                    to={`/shop?category=${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Connected</h4>
            <ul className="space-y-3 mb-5">
              <li className="flex items-start gap-2.5 text-sm text-neutral-400">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-primary-400" />
                New Delhi
              </li>
              <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                <Phone size={14} className="flex-shrink-0 text-primary-400" />
                +91 9598603602 , +91 7897264494
              </li>
              <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                <Mail size={14} className="flex-shrink-0 text-primary-400" />
                suremafashion@gmail.com
              </li>
            </ul>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-neutral-800 dark:bg-[#241038] border border-neutral-700 dark:border-primary-900/40 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button type="submit" className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white p-2 rounded-xl transition-all duration-200 shadow-md">
                <ArrowRight size={18} />
              </button>
            </form>
            {status === 'success' && <p className="mt-2 text-xs text-success-500">Subscribed successfully!</p>}
            {status === 'error' && <p className="mt-2 text-xs text-error-500">Something went wrong. Try again.</p>}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-neutral-800 dark:border-primary-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">&copy; {new Date().getFullYear()} Surema Global Fashion Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-primary-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-300 transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
