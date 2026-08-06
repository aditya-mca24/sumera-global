import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Percent, Image,
  Star, FileText, BarChart2, LogOut, ChevronLeft, Menu, Factory, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/categories', label: 'Categories', Icon: Tag },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
  { href: '/admin/bulk-orders', label: 'Bulk Orders', Icon: Factory },
  { href: '/admin/customers', label: 'Customers', Icon: Users },
  { href: '/admin/coupons', label: 'Coupons', Icon: Percent },
  { href: '/admin/banners', label: 'Banners', Icon: Image },
  { href: '/admin/reviews', label: 'Reviews', Icon: Star },
  { href: '/admin/reports', label: 'Reports', Icon: BarChart2 },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    return exact ? location.pathname === href : location.pathname.startsWith(href);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'px-5'} py-5 border-b border-neutral-800`}>
        {!collapsed && <Link to="/" className="font-serif text-xl font-bold text-white">SUREMA</Link>}
        <button onClick={() => setCollapsed(!collapsed)} className={`text-neutral-400 hover:text-white transition-colors ${collapsed ? '' : 'ml-auto'}`}>
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-5 py-3 border-b border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Logged in as</p>
          <p className="text-sm text-white font-medium truncate">{profile?.full_name ?? 'Admin'}</p>
          <span className={`badge mt-1 ${profile?.role === 'super_admin' ? 'bg-accent-600/20 text-accent-400' : 'bg-primary-600/20 text-primary-400'}`}>
            {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>
      )}

      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto scrollbar-hide ${collapsed ? 'px-2' : 'px-3'}`}>
            {NAV.map(({ href, label, Icon, exact }) => (
          <Link
            key={href}
            to={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive(href, exact)
                ? 'bg-primary-600 text-white'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && label}
          </Link>
        ))}

            {profile?.role === 'super_admin' && (
              <Link
                to="/admin/super-admin"
                title={collapsed ? 'Super Admin' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive('/admin/super-admin')
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Shield size={18} className="flex-shrink-0" />
                {!collapsed && 'Super Admin'}
              </Link>
            )}
      </nav>

      <div className={`border-t border-neutral-800 p-3 space-y-1`}>
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <FileText size={18} className="flex-shrink-0" />
          {!collapsed && 'View Store'}
        </Link>
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-error-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-[#1a0a2e] overflow-hidden">
      <aside className={`hidden lg:flex flex-col bg-neutral-900 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-neutral-900 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-[#241038] border-b border-neutral-200 dark:border-primary-900/40 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Admin Panel</span>
            <span className="badge bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400">Live</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
