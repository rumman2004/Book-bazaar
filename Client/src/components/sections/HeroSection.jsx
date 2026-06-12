import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const TICKER_ITEMS = [
  'SECOND-HAND BOOKS', 'RARE FINDS', 'ACADEMIC TEXTS', 'LITERARY FICTION',
  'EXAM PREP', 'INDEPENDENT SELLERS', 'VERIFIED LISTINGS', 'NEW ARRIVALS',
];

const HeroSection = ({ categories = [] }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = inputRef.current?.value?.trim();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    navigate(`/collections?${params.toString()}`);
  };

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative isolate min-h-[88vh] overflow-hidden bg-[var(--color-ink-950)] flex flex-col justify-center">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <span className="block h-px w-8 bg-[var(--color-amber-500)]" />
            <span className="text-xs font-semibold tracking-[0.22em] uppercase text-[var(--color-parchment-300)]">
              India's Reader-First Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(3.2rem,8vw,7rem)] font-semibold leading-[1.05] text-white max-w-3xl">
            Every great<br />
            read,{' '}
            <em className="not-italic text-[var(--color-amber-500)] font-display" style={{ fontStyle: 'italic' }}>
              found
            </em>
            <br />
            here.
          </h1>

          {/* Subheading */}
          <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-[var(--color-parchment-300)] font-light italic">
            New books, beloved second-hand editions, academic essentials — all from independent sellers who love books as much as you do.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-10 flex max-w-xl">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search title, author, or ISBN..."
              className="flex-1 bg-[#1e1a14] border border-[#3a3026] px-5 py-4 text-sm text-[var(--color-parchment-100)] placeholder:text-[var(--color-ink-600)] outline-none focus:border-[var(--color-amber-500)] transition-colors"
            />
            <button
              type="submit"
              className="bg-[var(--color-amber-500)] px-7 py-4 text-xs font-bold tracking-[0.15em] uppercase text-[var(--color-ink-900)] transition-colors hover:bg-[var(--color-amber-600)] whitespace-nowrap"
            >
              Search →
            </button>
          </form>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/collections"
              className="inline-flex items-center gap-2 border border-white bg-white px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-[var(--color-ink-900)] transition-colors hover:bg-[var(--color-parchment-100)]"
            >
              Browse Collection →
            </a>
            <a
              href="#seller"
              className="inline-flex items-center gap-2 border border-white/25 px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white/10"
            >
              Sell your books
            </a>
          </div>
        </div>

        {/* ── Stats strip ───────────────────────────────────────────── */}
        <div className="relative border-t border-white/10 bg-[#161109]">
          <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/10 px-4 sm:px-6 lg:px-8">
            {[
              { num: '12,400+', label: 'Books Listed' },
              { num: '1,200+', label: 'Active Sellers' },
              { num: '98%', label: 'Verified Listings' },
            ].map(({ num, label }) => (
              <div key={label} className="px-6 py-8 first:pl-0 last:pr-0">
                <p className="font-display text-4xl font-semibold text-white">{num}</p>
                <p className="mt-1 text-xs font-semibold tracking-[0.16em] uppercase text-[var(--color-parchment-400)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Amber ticker ─────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-[var(--color-amber-500)] py-3">
        <div
          className="flex gap-0 whitespace-nowrap"
          style={{
            animation: 'ticker-scroll 28s linear infinite',
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 px-6 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--color-ink-900)]"
            >
              {item}
              <span className="text-[var(--color-ink-700)] opacity-50">•</span>
            </span>
          ))}
        </div>
        <style>{`
          @keyframes ticker-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </>
  );
};

export default HeroSection;