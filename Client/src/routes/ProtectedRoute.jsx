import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

/**
 * ProtectedRoute — guards a route based on authentication and role.
 *
 * Usage:
 *   <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
 *     <Route path="/buyer" element={<BuyerHome />} />
 *   </Route>
 *
 * Props:
 *  - allowedRoles: string[] — e.g. ['buyer'], ['seller'], ['admin'], or ['buyer', 'seller']
 *                             If omitted, only checks for authentication.
 *  - children: ReactNode — rendered if authorized (alternative to <Outlet />)
 */
import { Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // Show nothing while auth state is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // Not logged in → redirect to login, preserving intended path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to appropriate dashboard or unauthorized
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard instead of a dead-end
    const roleDashboardMap = {
      admin: '/admin',
      seller: '/seller',
      buyer: '/buyer',
    };
    const dashboardPath = roleDashboardMap[role] || '/unauthorized';
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;