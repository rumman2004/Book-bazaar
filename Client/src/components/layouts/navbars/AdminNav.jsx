import { Bell, Menu, Search, UserCircle } from 'lucide-react';
import useAuth from '../../../hooks/useAuth.js';

const AdminNav = ({ setIsSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-parchment-100)] lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search orders, buyers..." 
              className="h-9 w-64 rounded-full border border-[var(--color-border)] bg-[var(--color-parchment-50)] pl-10 pr-4 text-sm focus:border-[var(--color-amber-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-amber-500)]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications */}
        <button className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-rust-500)] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="h-6 w-px bg-[var(--color-border)]"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Admin</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user?.email || 'admin@bibliobazar.com'}</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-parchment-200)] text-[var(--color-amber-700)] overflow-hidden">
            <UserCircle size={36} strokeWidth={1} />
          </button>
          
          <button 
            onClick={logout} 
            className="hidden sm:block ml-2 text-xs font-medium text-[var(--color-rust-500)] hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNav;
