import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute.jsx';
import useAuth from '../hooks/useAuth.js';

// ─── LAYOUTS ──────────────────────────────────────────────
import PublicLayout from '../components/layouts/PublicLayout.jsx';
import BuyerLayout from '../components/layouts/BuyerLayout.jsx';
import SellerLayout from '../components/layouts/SellerLayout.jsx';
import AdminLayout from '../components/layouts/AdminLayout.jsx';

// ─── PUBLIC PAGES ─────────────────────────────────────────
const LandingPage = lazy(() => import('../pages/public/LandingPage.jsx'));
const AuthPage = lazy(() => import('../pages/public/AuthPage.jsx'));
const NotFound = lazy(() => import('../pages/public/NotFound.jsx'));
const Unauthorized = lazy(() => import('../pages/public/Unauthorized.jsx'));
const Collection = lazy(() => import('../pages/public/Collection.jsx'));
const BookDetailes = lazy(() => import('../components/common/BookDetailes.jsx'));

// ─── BUYER PAGES ──────────────────────────────────────────
const BuyerHome = lazy(() => import('../pages/buyer/BuyerHome.jsx'));
const AllBooks = lazy(() => import('../pages/buyer/AllBooks.jsx'));
const BuyerProfile = lazy(() => import('../pages/buyer/BuyerProfile.jsx'));
const CartSection = lazy(() => import('../pages/buyer/CartSection.jsx'));
const Checkout = lazy(() => import('../pages/buyer/Checkout.jsx'));
const OrderHistory = lazy(() => import('../pages/buyer/OrderHistory.jsx'));
const Wishlist = lazy(() => import('../pages/buyer/Wishlist.jsx'));
const InterestedTypes = lazy(() => import('../pages/buyer/InterestedTypes.jsx'));

// ─── SELLER PAGES ─────────────────────────────────────────
const SellerDashboard = lazy(() => import('../pages/seller/SellerDashboard.jsx'));
const SellerProfile = lazy(() => import('../pages/seller/SellerProfile.jsx'));
const SellerAllProducts = lazy(() => import('../pages/seller/AllProducts.jsx'));
const AddProduct = lazy(() => import('../pages/seller/AddProduct.jsx'));
const EditProducts = lazy(() => import('../pages/seller/EditProducts.jsx'));
const Order = lazy(() => import('../pages/seller/Order.jsx'));
const Revenue = lazy(() => import('../pages/seller/Revinue.jsx'));
const SellerReviews = lazy(() => import('../pages/seller/SellerReviews.jsx'));

// ─── ADMIN PAGES ──────────────────────────────────────────
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'));
const AllBuyer = lazy(() => import('../pages/admin/AllBuyer.jsx'));
const AllSeller = lazy(() => import('../pages/admin/AllSeller.jsx'));
const AdminAllProducts = lazy(() => import('../pages/admin/AllProducts.jsx'));
const AdminOrders = lazy(() => import('../pages/admin/ActivityLog.jsx'));
const Leaderboard = lazy(() => import('../pages/admin/Leaderboard.jsx'));
const Coupons = lazy(() => import('../pages/admin/Coupons.jsx'));

// ─── FALLBACK LOADER ──────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
      <p className="text-sm text-stone-500 font-medium">Loading…</p>
    </div>
  </div>
);

/**
 * RoleRedirect — redirects logged-in users to their dashboard on accessing root '/'
 */
const RoleRedirect = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <LandingPage />;

  const dashboardMap = {
    admin: '/admin',
    seller: '/seller',
    buyer: '/buyer',
  };

  return <Navigate to={dashboardMap[role] || '/buyer'} replace />;
};

/**
 * AppRoutes — single source of truth for all application routes.
 *
 * Route hierarchy:
 *  /                     → Public layout (landing, auth pages)
 *  /buyer/*              → Protected: buyer only
 *  /seller/*             → Protected: seller only
 *  /admin/*              → Protected: admin only
 *  *                     → 404 Not Found
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── PUBLIC ROUTES ─────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/collections" element={<Collection />} />
          <Route path="/books/:id" element={<BookDetailes />} />
        </Route>

        {/* ── BUYER ROUTES ──────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
          <Route element={<BuyerLayout />}>
            <Route path="/buyer" element={<BuyerHome />} />
            <Route path="/buyer/books" element={<AllBooks />} />
            <Route path="/buyer/books/:id" element={<BookDetailes />} />
            <Route path="/buyer/profile" element={<BuyerProfile />} />
            <Route path="/buyer/cart" element={<CartSection />} />
            <Route path="/buyer/checkout" element={<Checkout />} />
            <Route path="/buyer/orders" element={<OrderHistory />} />
            <Route path="/buyer/wishlist" element={<Wishlist />} />
            <Route path="/buyer/interests" element={<InterestedTypes />} />
          </Route>
        </Route>

        {/* ── SELLER ROUTES ─────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/seller/profile" element={<SellerProfile />} />
            <Route path="/seller/books" element={<SellerAllProducts />} />
            <Route path="/seller/books/add" element={<AddProduct />} />
            <Route path="/seller/books/:id/edit" element={<EditProducts />} />
            <Route path="/seller/orders" element={<Order />} />
            <Route path="/seller/revenue" element={<Revenue />} />
            <Route path="/seller/reviews" element={<SellerReviews />} />
          </Route>
        </Route>

        {/* ── ADMIN ROUTES ──────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/buyers" element={<AllBuyer />} />
            <Route path="/admin/sellers" element={<AllSeller />} />
            <Route path="/admin/products" element={<AdminAllProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/leaderboard" element={<Leaderboard />} />
            <Route path="/admin/coupons" element={<Coupons />} />
          </Route>
        </Route>

        {/* ── 404 CATCH-ALL ─────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
