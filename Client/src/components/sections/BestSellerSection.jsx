import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicService from '../../services/PublicService.js';

const fallbackBooks = [
  { id: 'best-1', title: 'The Midnight Library', author: 'Matt Haig', price: 320, condition: 'like_new', total_sold: 84, image_url: '' },
  { id: 'best-2', title: 'Atomic Habits', author: 'James Clear', price: 410, condition: 'new', total_sold: 72, image_url: '' },
  { id: 'best-3', title: 'The Alchemist', author: 'Paulo Coelho', price: 180, condition: 'good', total_sold: 65, image_url: '' },
  { id: 'best-4', title: 'Deep Work', author: 'Cal Newport', price: 360, condition: 'like_new', total_sold: 57, image_url: '' },
];

const conditionLabel = {
  new: 'NEW',
  like_new: 'LIKE NEW',
  good: 'GOOD',
  acceptable: 'ACCEPTABLE',
};

const BestSellerSection = () => {
  const [books, setBooks] = useState(fallbackBooks);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await PublicService.getBestSellers();
        if (mounted && res.data?.length) setBooks(res.data);
      } catch {
        // use fallback
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section id="bestseller" className="bg-[var(--color-ink-950)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="block h-px w-7 bg-[var(--color-amber-500)]" />
              <span className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-[var(--color-parchment-400)]">
                Reader Favorites
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white">
              Best{' '}
              <em className="font-display text-[var(--color-amber-500)]" style={{ fontStyle: 'italic' }}>
                sellers
              </em>
            </h2>
          </div>
          <a
            href="/collections"
            className="hidden sm:inline-flex items-center border border-white/20 px-5 py-2.5 text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white/10"
          >
            See All →
          </a>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/collections/${book.id}`}
              className="group flex flex-col"
            >
              {/* Cover */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-parchment-200)]">
                {book.image_url ? (
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-[var(--color-parchment-200)]" />
                )}
                {/* Sold badge */}
                {book.total_sold && (
                  <span className="absolute left-3 top-3 bg-[var(--color-amber-500)] px-3 py-1 text-[0.6rem] font-bold tracking-[0.12em] uppercase text-[var(--color-ink-900)]">
                    {book.total_sold} Sold
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 flex flex-col gap-0.5">
                <h3 className="font-display text-lg font-semibold text-white leading-snug group-hover:text-[var(--color-amber-400)] transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-[var(--color-parchment-400)]">{book.author}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-xl text-white">₹{book.price}</span>
                  <span className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-[var(--color-parchment-400)]">
                    {conditionLabel[book.condition] ?? book.condition}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BestSellerSection;