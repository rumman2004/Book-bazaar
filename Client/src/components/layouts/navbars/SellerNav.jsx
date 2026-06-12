import { NavLink } from 'react-router-dom';
import { BarChart3, BookPlus, Boxes, Home, Package, Store, User, MessageSquare } from 'lucide-react';
import useAuth from '../../../hooks/useAuth.js';

const SellerNav = () => {
  const { user, logout } = useAuth();
  const links = [
    { to: '/seller', label: 'Dashboard', icon: Home },
    { to: '/seller/books', label: 'Products', icon: Boxes },
    { to: '/seller/orders', label: 'Orders', icon: Package },
    { to: '/seller/revenue', label: 'Revenue', icon: BarChart3 },
    { to: '/seller/reviews', label: 'Reviews', icon: MessageSquare },
    { to: '/seller/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/seller" className="flex items-center gap-2 text-[var(--color-ink-900)]">
          <img src="/favicon.png" alt="Seller Studio Logo" className="h-9 w-9 object-contain" />
          <span className="font-display text-lg font-semibold">Seller Studio</span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-[var(--color-parchment-100)] text-[var(--color-ink-900)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-parchment-100)] hover:text-[var(--color-ink-900)]'}`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <p className="hidden max-w-40 truncate text-sm font-semibold text-[var(--color-text-primary)] sm:block">
            {user?.profile?.store_name || user?.email}
          </p>
          <button type="button" onClick={logout} className="rounded-sm border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-parchment-100)]">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default SellerNav;
