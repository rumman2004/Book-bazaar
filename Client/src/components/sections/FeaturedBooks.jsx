import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicService from '../../services/PublicService.js';

const fallbackBooks = [
  { id: 'sample-1', title: 'The Midnight Library', author: 'Matt Haig', price: 320, condition: 'good', tag: "EDITOR'S PICK" },
  { id: 'sample-2', title: 'Atomic Habits', author: 'James Clear', price: 410, condition: 'like_new', tag: 'NEW ARRIVAL' },
  { id: 'sample-3', title: 'Deep Work', author: 'Cal Newport', price: 360, condition: 'like_new', tag: 'BEST SELLER' },
  { id: 'sample-4', title: 'The Alchemist', author: 'Paulo Coelho', price: 180, condition: 'good', tag: 'NEW ARRIVAL' },
  { id: 'sample-5', title: 'Psychology of Money', author: 'Morgan Housel', price: 290, condition: 'good', tag: 'BEST SELLER' },
];

const ConditionLabel = ({ condition }) => {
  const map = { new: 'NEW', like_new: 'LIKE NEW', good: 'GOOD', acceptable: 'ACCEPTABLE' };
  return (
    <span className="text-[0.6rem] font-bold tracking-[0.15em] uppercase text-[var(--color-text-muted)]">
      {map[condition] ?? condition}
    </span>
  );
};

const FeaturedBooks = () => {
  const [books, setBooks] = useState(fallbackBooks);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await PublicService.getFeaturedBooks();
        if (mounted && res.data?.length) {
          // Merge real books into the fallback array so we always have exactly 5 items
          // This keeps the design from breaking if the DB has fewer than 5 books
          const mergedBooks = [...fallbackBooks];
          res.data.slice(0, 5).forEach((realBook, idx) => {
            mergedBooks[idx] = { ...mergedBooks[idx], ...realBook };
          });
          setBooks(mergedBooks);
        }
      } catch {
        // use fallback
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const [featured, ...grid] = books;
  // We want 4 grid items
  const gridBooks = grid.slice(0, 4);

  return (
    <section id="featured" className="bg-[var(--color-parchment-100)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="block h-px w-7 bg-[var(--color-amber-500)]" />
              <span className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-[var(--color-amber-600)]">
                This Week's Picks
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-ink-900)]">
              Featured{' '}
              <em className="font-display text-[var(--color-amber-500)]" style={{ fontStyle: 'italic' }}>
                books
              </em>
            </h2>
          </div>
          <a
            href="/collections"
            className="hidden sm:inline-flex items-center gap-2 border border-[var(--color-border-strong)] px-5 py-2.5 text-xs font-bold tracking-[0.14em] uppercase text-[var(--color-ink-900)] transition-colors hover:bg-[var(--color-ink-900)] hover:text-white"
          >
            View All →
          </a>
        </div>

        {isLoading ? (
          <div className="grid gap-0 lg:grid-cols-[2fr_1fr_1fr] h-[480px]">
            <div className="skeleton" />
            <div className="grid grid-rows-2 gap-0">
              <div className="skeleton m-px" />
              <div className="skeleton m-px" />
            </div>
            <div className="grid grid-rows-2 gap-0">
              <div className="skeleton m-px" />
              <div className="skeleton m-px" />
            </div>
          </div>
        ) : (
          <div className="border border-[var(--color-parchment-300)] overflow-hidden grid lg:grid-cols-[2fr_1fr_1fr]" style={{ minHeight: 480 }}>

            {/* Featured hero card */}
            {featured && (
              <Link
                to={`/books/${featured.id}`}
                className="relative flex flex-col justify-center bg-[#18181b] overflow-hidden group min-h-[400px] lg:min-h-0 p-8 sm:p-10"
              >
                {/* Glowing backdrop */}
                <div className="absolute top-1/2 left-[30%] -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--color-amber-500)]/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                
                <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-8 sm:gap-10">
                  {/* Crisp book cover */}
                  <div className="relative shrink-0 perspective-[1000px]">
                    {featured.image_url ? (
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                        className="w-36 h-56 sm:w-48 sm:h-72 object-cover rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transform transition-all duration-700 group-hover:scale-105 group-hover:-rotate-2 group-hover:-translate-y-2"
                      />
                    ) : (
                      <div className="w-36 h-56 sm:w-48 sm:h-72 bg-white/5 rounded-md items-center justify-center ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex">
                        <span className="text-[0.6rem] font-bold text-white/30 tracking-wider">NO COVER</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left z-10">
                    <span className="inline-flex items-center justify-center sm:justify-start gap-2 text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[var(--color-amber-400)] mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber-400)]" /> {featured.tag ?? "Editor's Pick"}
                    </span>
                    <h3 className="font-display text-4xl sm:text-5xl font-semibold text-white leading-tight line-clamp-3 tracking-tight">
                      {featured.title}
                    </h3>
                    <p className="mt-3 font-display text-lg italic text-white/60">
                      by {featured.author}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-5">
                      <button className="inline-flex items-center justify-center gap-2 bg-[var(--color-amber-500)] px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-[var(--color-ink-900)] transition-transform hover:scale-105 shadow-lg shadow-amber-500/20">
                        View Book →
                      </button>
                      <span className="text-2xl font-display text-white">₹{featured.price}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* 2×2 grid */}
            <div className="col-span-1 lg:col-span-2 grid grid-cols-2 grid-rows-2">
              {gridBooks.map((book, i) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className={`group flex flex-col justify-between p-6 border-[var(--color-parchment-300)] transition-colors hover:bg-[var(--color-parchment-200)] relative overflow-hidden ${
                    i % 2 === 0 ? 'border-r' : ''
                  } ${i < 2 ? 'border-b' : ''} border-l-0 border-t-0`}
                  style={{ borderColor: 'var(--color-parchment-300)' }}
                >
                  <div className="flex gap-4 z-10 relative">
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.title} className="w-16 h-24 object-cover rounded-sm shadow-[var(--shadow-card)] shrink-0" />
                    ) : (
                      <div className="w-16 h-24 bg-[var(--color-parchment-300)] rounded-sm flex items-center justify-center shrink-0 border border-[var(--color-border)] shadow-sm">
                        <span className="text-[0.5rem] font-bold text-[var(--color-text-muted)] tracking-wider">NO COVER</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-[var(--color-amber-600)]">
                        {book.tag ?? (i % 2 === 0 ? 'New Arrival' : 'Best Seller')}
                      </span>
                      <h3 className="mt-1.5 font-display text-lg sm:text-xl font-semibold text-[var(--color-ink-900)] leading-tight group-hover:text-[var(--color-amber-600)] transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="mt-1 font-display text-xs sm:text-sm italic text-[var(--color-text-muted)] line-clamp-1">
                        by {book.author}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 font-display text-2xl text-[var(--color-ink-900)] z-10 relative text-right">₹{book.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-6 sm:hidden">
          <a
            href="/collections"
            className="flex w-full items-center justify-center border border-[var(--color-border-strong)] py-3 text-xs font-bold tracking-[0.14em] uppercase text-[var(--color-ink-900)]"
          >
            View All →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;