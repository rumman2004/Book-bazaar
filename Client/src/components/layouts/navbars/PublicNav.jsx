import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import useAuth from '../../../hooks/useAuth.js';

const PublicNav = () => {
  const { isAuthenticated, role } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboard = role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : '/buyer';

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive
        ? 'text-[var(--color-ink-900)]'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]'
    }`;

  const scrollTo = (id) => {
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setOpen(false);
  };

  const baseLinkClass = "text-sm font-medium tracking-wide transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-parchment-50)]/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-[var(--color-ink-900)]">
          <img src="/favicon.png" alt="Bibliobazar Logo" className="h-8 w-8 object-contain" />
          <span className="font-display text-xl font-semibold tracking-tight">Bibliobazar</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <button onClick={() => scrollTo('featured')} className={baseLinkClass}>Featured</button>
          <NavLink to="/collections" className={navLinkClass}>Collection</NavLink>
          <button onClick={() => scrollTo('bestseller')} className={baseLinkClass}>Bestsellers</button>
          <button onClick={() => scrollTo('seller')} className={baseLinkClass}>Sell</button>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1 md:flex">
          {isAuthenticated ? (
            <Link
              to={dashboard}
              className="rounded-sm bg-[var(--color-ink-900)] px-5 py-2 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[var(--color-ink-700)]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium tracking-widest text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-ink-900)] uppercase"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="ml-2 rounded-sm bg-[var(--color-ink-900)] px-5 py-2 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[var(--color-ink-700)]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-sm text-[var(--color-ink-900)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-parchment-50)] px-4 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink to="/" onClick={() => setOpen(false)} className={navLinkClass}>Home</NavLink>
            <button onClick={() => scrollTo('featured')} className={`text-left ${baseLinkClass}`}>Featured</button>
            <NavLink to="/collections" onClick={() => setOpen(false)} className={navLinkClass}>Collection</NavLink>
            <button onClick={() => scrollTo('bestseller')} className={`text-left ${baseLinkClass}`}>Bestsellers</button>
            <button onClick={() => scrollTo('seller')} className={`text-left ${baseLinkClass}`}>Sell with us</button>
            
            <a
              href="/book-detail"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[var(--color-text-muted)]"
            >
              Book Detail
            </a>
            <div className="mt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to={dashboard}
                  onClick={() => setOpen(false)}
                  className="rounded-sm bg-[var(--color-ink-900)] px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-sm border border-[var(--color-border-strong)] px-4 py-2.5 text-center text-sm font-medium text-[var(--color-ink-900)]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-sm bg-[var(--color-ink-900)] px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNav;