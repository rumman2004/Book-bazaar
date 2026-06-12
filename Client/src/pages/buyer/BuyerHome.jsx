import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, User } from 'lucide-react';
import { ErrorState, LoadingState } from '../../components/common/PageStates.jsx';
import HeroCarousel from '../../components/home/HeroCarousel.jsx';
import BookRow from '../../components/home/BookRow.jsx';
import PublicService from '../../services/PublicService.js';
import useAuth from '../../hooks/useAuth.js';

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

  // Mocking different sections using the fetched featured books
  // In a real app, these would be separate API calls or query params
  const featuredBooks = data.books.slice(0, 8);
  const bestsellers = [...data.books].reverse().slice(0, 8);
  const sponsored = data.books.filter((_, i) => i % 2 === 0).slice(0, 8);
  const suggestions = data.books.filter((_, i) => i % 3 === 0).slice(0, 8);

  return (
    <section className="pb-10">
      {/* Welcome Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)]">
            {`Welcome${user?.profile?.full_name ? `, ${user.profile.full_name}` : ''}`}
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">Explore our marketplace and find your next read.</p>
        </div>
      </div>

      <HeroCarousel />

      <BookRow title="Sponsored" books={sponsored} />
      
      <BookRow title="Bestsellers" books={bestsellers} />
      
      <BookRow title="Featured Books" books={featuredBooks} />
      
      <BookRow title="Suggested for You" books={suggestions} />

      {/* Quick Actions */}
      <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-2xl font-display text-[var(--color-text-primary)]">Quick actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link to="/buyer/profile" className="flex items-center gap-3 rounded-md border border-[var(--color-border)] p-4 hover:bg-[var(--color-parchment-50)] transition-colors">
            <User size={18} className="text-[var(--color-amber-600)]" /> 
            <span className="font-medium">Update profile and shipping address</span>
          </Link>
          <Link to="/buyer/cart" className="flex items-center gap-3 rounded-md border border-[var(--color-border)] p-4 hover:bg-[var(--color-parchment-50)] transition-colors">
            <ShoppingCart size={18} className="text-[var(--color-amber-600)]" /> 
            <span className="font-medium">Review cart and checkout</span>
          </Link>
          <Link to="/buyer/books" className="flex items-center gap-3 rounded-md border border-[var(--color-border)] p-4 hover:bg-[var(--color-parchment-50)] transition-colors">
            <BookOpen size={18} className="text-[var(--color-amber-600)]" /> 
            <span className="font-medium">Search all available books</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BuyerHome;
