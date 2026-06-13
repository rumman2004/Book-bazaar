import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, User, Search, Star, ArrowRight } from 'lucide-react';
import { ErrorState, LoadingState } from '../../components/common/PageStates.jsx';
import PublicService from '../../services/PublicService.js';
import useAuth from '../../hooks/useAuth.js';
import { formatCurrency } from '../../utils/formatters.js';

const BuyerHome = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ books: [] });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadData = async () => {
    setStatus('loading');
    setError('');
    try {
      const booksResponse = await PublicService.getFeaturedBooks();
      setData({
        books: booksResponse.data || [],
      });
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load buyer dashboard.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (status === 'loading') return <LoadingState label="Loading storefront..." />;
  if (status === 'error') return <ErrorState message={error} onRetry={loadData} />;

  const featuredBooks = data.books.slice(0, 8);
  const bestsellers = [...data.books].reverse().slice(0, 8);
  const sponsored = data.books.filter((_, i) => i % 2 === 0).slice(0, 4);
  const suggestions = data.books.filter((_, i) => i % 3 === 0).slice(0, 3);
  
  const bookOfTheMonth = data.books.length > 0 ? data.books[0] : null;

  return (
    <div className="max-w-7xl mx-auto overflow-x-hidden bg-[var(--color-surface)] min-h-screen">
      
      {/* Hero Banner */}
      <section className="relative w-full h-[618px] flex items-center overflow-hidden mb-16 rounded-b-xl shadow-lg">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            alt="Hero background" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFWYDXHdMrCeF2grHbwbojjlBl_7Ft3IvMJj1WOwI1U5HfjFX9GFFve4IoQ39hDOnAeTVrMZOr1bMM6i7sNUf0M5J40Kvtuk_rwQOlcGXJDwNdcqEmg4ztS0QTLiQ94TQiKkBz45mG2JGTEZPuM3KET0dQjDfaAOMQ_4TQwzA8Iif4OW6YqPmpm9gaO86fbD_DnXCN6RK1xUqktBzZOKgSPEipcbL4ySo2Kf3wt9v2PrW6wlGW78BbZabSYBAkaZYIYelr5VA7Jt7y"
          />
          <div className="absolute inset-0 bg-[var(--color-ink-900)]/50"></div>
        </div>
        <div className="relative z-10 px-6 md:px-12 max-w-3xl">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 block">
            {`Welcome${user?.profile?.full_name ? `, ${user.profile.full_name}` : ''}`}
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-[var(--color-surface)] mb-6 leading-tight font-bold">
            Preserving the Soul of the Written Word
          </h2>
          <p className="text-lg text-[var(--color-surface)]/90 mb-10 max-w-xl">
            Explore our curated selection of literature, first editions, and literary artifacts sourced for discerning readers.
          </p>
          <div className="flex gap-4">
            <Link to="/buyer/books" className="bg-[var(--color-ink-900)] text-[var(--color-surface)] px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-ink-700)] transition-colors rounded-sm">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-2 relative group">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 block">
              Search our Archives
            </label>
            <div className="flex items-center border-b border-[var(--color-ink-900)] py-3">
              <input 
                className="bg-transparent border-none focus:ring-0 w-full text-base placeholder:text-[var(--color-text-muted)]/50 outline-none" 
                placeholder="Title, Author, or ISBN..." 
                type="text"
              />
              <Search className="text-[var(--color-ink-900)]" size={20} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <Link to="/buyer/profile" className="flex items-center justify-center gap-2 bg-[var(--color-surface-alt)] border border-[var(--color-border)] py-4 hover:bg-[var(--color-parchment-200)] transition-colors rounded-sm">
              <User size={18} className="text-[var(--color-ink-900)]" />
              <span className="text-sm font-semibold">Update Profile</span>
            </Link>
            <Link to="/buyer/cart" className="flex items-center justify-center gap-2 bg-[var(--color-surface-alt)] border border-[var(--color-border)] py-4 hover:bg-[var(--color-parchment-200)] transition-colors rounded-sm">
              <ShoppingCart size={18} className="text-[var(--color-ink-900)]" />
              <span className="text-sm font-semibold">My Cart</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mb-20 overflow-hidden">
        <div className="px-6 flex justify-between items-end mb-8">
          <div>
            <h3 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">Weekly Bestsellers</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Most coveted additions to contemporary libraries.</p>
          </div>
          <Link to="/buyer/books" className="text-sm font-semibold text-[var(--color-ink-900)] hover:text-[var(--color-accent)] hover:underline underline-offset-4 transition-colors">
            View All
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {bestsellers.map((book) => (
            <Link to={`/buyer/books/${book.id}`} key={book.id} className="min-w-[200px] md:min-w-[240px] group transition-transform duration-300 hover:-translate-y-2">
              <div className="aspect-[2/3] mb-4 overflow-hidden bg-[var(--color-parchment-200)] rounded-sm shadow-md">
                <img 
                  src={book.image_url || 'https://via.placeholder.com/240x360'} 
                  alt={book.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="font-display text-xl font-bold line-clamp-1 text-[var(--color-text-primary)]">{book.title}</h4>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">{book.author}</p>
              <p className="text-sm font-bold text-[var(--color-cta)]">{formatCurrency(book.price)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Books: Book of the Month */}
      {bookOfTheMonth && (
        <section className="px-6 mb-20">
          <div className="bg-[var(--color-parchment-100)] border border-[var(--color-border)] p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center rounded-sm">
            <div className="relative">
              <div className="absolute -top-4 -left-4 bg-[var(--color-accent)] text-white px-4 py-1 text-xs font-bold tracking-widest z-10 uppercase">
                Book of the Month
              </div>
              <div className="aspect-[3/4] overflow-hidden shadow-[var(--shadow-raised)] rounded-sm">
                <img 
                  src={bookOfTheMonth.image_url || 'https://via.placeholder.com/400x600'} 
                  alt={bookOfTheMonth.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="font-display text-3xl md:text-5xl font-bold mb-3 text-[var(--color-text-primary)]">{bookOfTheMonth.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-widest mb-6">By {bookOfTheMonth.author}</p>
              
              <div className="border-l-4 border-[var(--color-accent)] bg-[var(--color-accent)]/5 p-6 mb-6">
                <p className="italic font-display text-xl text-[var(--color-text-secondary)]">
                  "Knowledge is a slow poison, yet we drink it with the thirst of a desert traveler."
                </p>
              </div>
              
              <p className="text-base text-[var(--color-text-primary)] mb-8 leading-relaxed">
                {bookOfTheMonth.description || "A sweeping epic set in the literary heart of the world, exploring themes of history, knowledge, and the enduring power of the written word."}
              </p>
              
              <Link to={`/buyer/books/${bookOfTheMonth.id}`} className="inline-block w-full text-center md:w-auto bg-[var(--color-accent)] text-white px-10 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[var(--color-accent-hover)] transition-colors shadow-md hover:shadow-lg rounded-sm">
                View Details - {formatCurrency(bookOfTheMonth.price)}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Suggested for You */}
      <section className="px-6 mb-20">
        <div className="mb-8">
          <h3 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">Curated For You</h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Based on your recent browsing history.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suggestions.map((book) => (
            <Link to={`/buyer/books/${book.id}`} key={book.id} className="flex gap-4 items-start p-4 hover:bg-[var(--color-surface-alt)] border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer group rounded-sm">
              <div className="w-24 shrink-0 aspect-[2/3] bg-[var(--color-parchment-200)] shadow-sm">
                <img 
                  src={book.image_url || 'https://via.placeholder.com/96x144'} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">{book.title}</h4>
                <p className="text-sm text-[var(--color-text-muted)] mb-2">{book.author}</p>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">4.8</span>
                </div>
                <p className="text-sm font-bold text-[var(--color-cta)] mt-2">{formatCurrency(book.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsored Books */}
      <section className="px-6 mb-20">
        <div className="border-t border-[var(--color-border)] pt-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-6 block">
            Promoted by Our Partners
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sponsored.map((book) => (
              <Link to={`/buyer/books/${book.id}`} key={book.id} className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer block">
                <p className="text-base font-bold text-[var(--color-text-primary)] mb-1 line-clamp-1">{book.title}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{book.author}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default BuyerHome;
