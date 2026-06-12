import { Link } from 'react-router-dom';
import { BookOpen, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-ink-900)] text-[var(--color-parchment-100)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="Bibliobazar Logo" className="h-9 w-9 object-contain" />
            <span className="font-display text-xl font-semibold">Bibliobazar</span>
          </Link>
          <p className="mt-4 max-w-md text-sm text-[var(--color-parchment-300)]">
            A marketplace for new and pre-loved books, built for readers, independent sellers, and campus communities.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-parchment-50)]">Explore</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--color-parchment-300)]">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="hover:text-white">Become a seller</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-parchment-50)]">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--color-parchment-300)]">
            <p className="flex items-center gap-2"><Mail size={15} /> support@bibliobazar.local</p>
            <p className="flex items-center gap-2"><Phone size={15} /> +91 98765 43210</p>
            <p className="flex items-center gap-2"><MapPin size={15} /> India</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-[var(--color-parchment-300)]">
        © 2026 Bibliobazar. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
