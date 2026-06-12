import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, ClipboardList, Gift, LayoutDashboard, Store, Trophy, Users, X } from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/buyers', label: 'Buyers', icon: Users },
    { to: '/admin/sellers', label: 'Sellers', icon: Store },
    { to: '/admin/products', label: 'Products', icon: BookOpen },
    { to: '/admin/orders', label: 'Activity', icon: ClipboardList },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/admin/coupons', label: 'Coupons', icon: Gift },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 transform border-r border-[var(--color-ink-800)] bg-[var(--color-ink-950)] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--color-ink-800)]">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="Bibliobazar Logo" className="h-8 w-8 object-contain" />
          <span className="font-display text-lg font-semibold tracking-wide">Bibliobazar</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-[var(--color-parchment-300)] hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-600)]">
          Management
        </div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-[var(--color-amber-600)] text-white shadow-md' 
                  : 'text-[var(--color-parchment-300)] hover:bg-[var(--color-ink-800)] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-white' : 'text-[var(--color-parchment-400)]'} /> 
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--color-ink-800)]">
        <div className="rounded-lg bg-[var(--color-ink-800)] p-4 text-center">
          <p className="text-xs text-[var(--color-parchment-300)] mb-2">Need help?</p>
          <a href="#" className="text-sm font-semibold text-[var(--color-amber-500)] hover:underline">Contact Support</a>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
