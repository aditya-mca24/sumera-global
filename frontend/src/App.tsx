import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './lib/ScrollToTop';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import { AnimatedPage } from './components/motion';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import BulkOrder from './pages/BulkOrder';
import ManufacturerWholesaler from './pages/ManufacturerWholesaler';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminCoupons from './pages/admin/Coupons';
import AdminBanners from './pages/admin/Banners';
import AdminBulkOrders from './pages/admin/BulkOrders';
import AdminReviews from './pages/admin/Reviews';
import AdminReports from './pages/admin/Reports';
import AdminCustomers from './pages/admin/Customers';
import SuperAdmin from './pages/admin/SuperAdmin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!user || (!(profile?.is_admin) && profile?.role !== 'super_admin')) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="/shop" element={<AnimatedPage><Shop /></AnimatedPage>} />
          <Route path="/product/:slug" element={<AnimatedPage><ProductDetail /></AnimatedPage>} />
          <Route path="/cart" element={<AnimatedPage><Cart /></AnimatedPage>} />
          <Route path="/wishlist" element={<AnimatedPage><Wishlist /></AnimatedPage>} />
          <Route path="/bulk-order" element={<AnimatedPage><BulkOrder /></AnimatedPage>} />
          <Route path="/booking" element={<Navigate to="/bulk-order" replace />} />
          <Route path="/manufacturer-wholesaler" element={<AnimatedPage><ManufacturerWholesaler /></AnimatedPage>} />
          <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
          <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
          <Route path="/verify-email" element={<AnimatedPage><VerifyEmail /></AnimatedPage>} />
          <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
          <Route path="/reset-password" element={<AnimatedPage><ResetPassword /></AnimatedPage>} />
          <Route path="/checkout" element={<ProtectedRoute><AnimatedPage><Checkout /></AnimatedPage></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AnimatedPage><Account /></AnimatedPage></ProtectedRoute>} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
          <Route path="products" element={<AnimatedPage><AdminProducts /></AnimatedPage>} />
          <Route path="categories" element={<AnimatedPage><AdminCategories /></AnimatedPage>} />
          <Route path="orders" element={<AnimatedPage><AdminOrders /></AnimatedPage>} />
          <Route path="coupons" element={<AnimatedPage><AdminCoupons /></AnimatedPage>} />
          <Route path="banners" element={<AnimatedPage><AdminBanners /></AnimatedPage>} />
          <Route path="bulk-orders" element={<AnimatedPage><AdminBulkOrders /></AnimatedPage>} />
          <Route path="reviews" element={<AnimatedPage><AdminReviews /></AnimatedPage>} />
          <Route path="reports" element={<AnimatedPage><AdminReports /></AnimatedPage>} />
          <Route path="customers" element={<AnimatedPage><AdminCustomers /></AnimatedPage>} />
          <Route path="super-admin" element={<AnimatedPage><SuperAdmin /></AnimatedPage>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppRoutes />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
