import { NavLink } from 'react-router-dom';
import { BookOpen, Heart, Home, Package, ShoppingCart, User } from 'lucide-react';
import useCart from '../../../hooks/useCart.js';
import useAuth from '../../../hooks/useAuth.js';

const BuyerNav = () => {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  const links = [
    { to: '/buyer', label: 'Home', icon: Home },
    { to: '/buyer/books', label: 'Books', icon: BookOpen },
    { to: '/buyer/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/buyer/orders', label: 'Orders', icon: Package },
    { to: '/buyer/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/buyer" className="flex items-center gap-2 text-[var(--color-ink-900)]">
          <img src="/favicon.png" alt="Bibliobazar Logo" className="h-9 w-9 object-contain" />
          <span className="font-display text-lg font-semibold">Bibliobazar</span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
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
          <NavLink to="/buyer/cart" className="relative grid h-10 w-10 place-items-center rounded-sm bg-[var(--color-parchment-100)] text-[var(--color-ink-900)]">
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-rust-500)] px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </NavLink>
          <div className="hidden text-right sm:block">
            <p className="text-xs text-[var(--color-text-muted)]">Signed in as</p>
            <p className="max-w-32 truncate text-sm font-semibold text-[var(--color-text-primary)]">{user?.profile?.full_name || user?.email}</p>
          </div>
          <button type="button" onClick={logout} className="rounded-sm border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-parchment-100)]">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default BuyerNav;
