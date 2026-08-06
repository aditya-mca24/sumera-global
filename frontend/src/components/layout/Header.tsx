import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronDown, Settings, Sun, Moon, Crown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Bulk Orders', href: '/bulk-order' },
  { label: 'Manufacturer & Wholesaler', href: '/manufacturer-wholesaler' },
];

const CATEGORIES = [
  'Western Tops', 'Crop Tops', 'Cord Sets', 'T-Shirts', 'Jeans', 'Kurtis', 'Dresses','Hoodies',
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopDropdown, setShopDropdown] = useState(false);
  const { count } = useCart();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location]);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const headerBg = 'bg-[#241038]/95 backdrop-blur-lg shadow-md border-b border-primary-900/50';
  const textColor = 'text-white';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <Link to="/" className="flex items-center gap-3 font-serif font-bold tracking-wide transition-colors text-white">
              <img src="/images/f_logo-removebg-preview.png" alt="Surema logo" className="h-14 w-auto rounded-md" />
              {/* <span className="hidden xl:inline-block text-lg sm:text-xl">SUREMA</span> */}
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                link.label === 'Shop' ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setShopDropdown(true)}
                    onMouseLeave={() => setShopDropdown(false)}
                  >
                    <Link
                      to="/shop"
                      className={`flex items-center gap-1 text-sm font-medium hover:text-primary-500 transition-colors ${textColor}`}
                    >
                      Shop <ChevronDown size={14} />
                    </Link>
                    {shopDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-[#2e1547] rounded-xl shadow-lg border border-primary-900/40 py-2 animate-fade-in">
                        <Link to="/shop" className="block px-4 py-2 text-sm text-neutral-100 hover:bg-[#351e5c] hover:text-white transition-colors font-medium">
                          All Products
                        </Link>
                        <div className="border-t border-primary-900/40 my-1" />
                        {CATEGORIES.map(cat => (
                          <Link
                            key={cat}
                            to={`/shop?category=${cat.toLowerCase().replace(/\s+/g, '-').replace(/['-]/g, '').replace('--', '-')}`}
                            className="block px-4 py-2 text-sm text-neutral-100 hover:bg-[#351e5c] hover:text-white transition-colors"
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`text-sm font-medium hover:text-primary-500 transition-colors ${textColor}`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2.5 rounded-full hover:bg-white/10 transition-colors ${textColor}`}
              >
                <Search size={20} />
              </button>
              <Link
                to="/wishlist"
                className={`p-2.5 rounded-full hover:bg-white/10 transition-colors ${textColor}`}
              >
                <Heart size={20} />
              </Link>
              <Link
                to="/cart"
                className={`relative p-2.5 rounded-full hover:bg-white/10 transition-colors ${textColor}`}
              >
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-gradient-to-r from-primary-600 to-accent-500 text-white text-xs rounded-full font-medium">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className={`p-2.5 rounded-full hover:bg-white/10 transition-colors ${textColor}`}>
                    <User size={20} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#2e1547] rounded-xl shadow-lg border border-primary-900/40 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 border-b border-primary-900/40">
                      <p className="text-xs text-neutral-300">Signed in as</p>
                      <p className="text-sm font-medium text-neutral-100 truncate">{profile?.full_name || user.email}</p>
                    </div>
                    <Link to="/account" className="block px-4 py-2 text-sm text-neutral-100 hover:bg-[#351e5c] hover:text-white transition-colors">My Account</Link>
                    <Link to="/account" className="block px-4 py-2 text-sm text-neutral-100 hover:bg-[#351e5c] hover:text-white transition-colors">My Orders</Link>
                    {profile?.is_admin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-100 hover:bg-[#351e5c] hover:text-white transition-colors">
                        {profile?.role === 'super_admin' ? <Crown size={14} /> : <Settings size={14} />}
                        {profile?.role === 'super_admin' ? 'Super Admin Panel' : 'Admin Panel'}
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#351e5c] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-white text-white transition-all duration-200 hover:bg-white hover:text-neutral-900"
                >
                  Sign In
                </Link>
              )}

              <button
                className={`lg:hidden p-2.5 rounded-full hover:bg-white/10 transition-colors ${textColor}`}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-[#241038] border-t border-primary-900/40 shadow-lg animate-slide-down">
            <nav className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block px-4 py-3 text-neutral-100 font-medium rounded-lg hover:bg-[#2d1440] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-neutral-100 dark:border-primary-900/40">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat}
                    to={`/shop?category=${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-[#2e1547] transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
              {!user && (
                <div className="pt-2 border-t border-neutral-100 dark:border-primary-900/40 flex gap-2">
                  <Link to="/login" className="flex-1 btn-primary justify-center text-sm py-2.5">Sign In</Link>
                  <Link to="/register" className="flex-1 btn-secondary justify-center text-sm py-2.5">Register</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center pt-20 px-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#2e1547] rounded-2xl shadow-2xl p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for tops, jeans, dresses..."
                className="input flex-1"
              />
              <button type="submit" className="btn-primary px-5 py-3 rounded-lg">
                <Search size={18} />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Crop Tops', 'Jeans', 'Dresses', 'Co-ord Sets', 'Kurtis'].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    navigate(`/shop?search=${encodeURIComponent(term)}`);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 text-sm bg-neutral-100 dark:bg-[#3a1d5c] text-neutral-600 dark:text-neutral-300 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/40 hover:text-primary-700 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
