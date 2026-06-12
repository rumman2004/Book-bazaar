import { useEffect, useMemo, useState } from 'react';
import { Grid2X2, List, Search } from 'lucide-react';
import BookCard from '../../components/common/BookCard.jsx';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import PublicService from '../../services/PublicService.js';
import useCart from '../../hooks/useCart.js';
import { SORT_OPTIONS } from '../../utils/constant.js';

const flattenCategories = (items = [], depth = 0) =>
  items.flatMap((item) => [{ id: item.id, name: item.name, depth }, ...flattenCategories(item.children || [], depth + 1)]);

const AllBooks = () => {
  const { addToCart, isInCart } = useCart();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', category_id: '', sort: 'newest', page: 1 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [view, setView] = useState('grid');
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  const loadBooks = async () => {
    setStatus('loading');
    setError('');
    try {
      const [booksResponse, categoriesResponse] = await Promise.all([
        PublicService.getBooks({ ...filters, limit: 12 }),
        PublicService.getCategories(),
      ]);
      setBooks(booksResponse.data || []);
      setPagination(booksResponse.pagination || { page: filters.page, totalPages: 1, total: 0 });
      setCategories(categoriesResponse.data || []);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load books.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFilters({
      search: form.get('search') || '',
      category_id: form.get('category_id') || '',
      sort: form.get('sort') || 'newest',
      page: 1,
    });
  };

  const handleAdd = async (book) => {
    if (!isInCart(book.id)) await addToCart(book.id, 1);
  };

  return (
    <section>
      <PageHeader eyebrow="Marketplace" title="All books" description="Search the live catalogue and add available books to your cart." />

      <form onSubmit={handleSubmit} className="rounded-md border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
            <input name="search" defaultValue={filters.search} placeholder="Title, author, ISBN" className="h-11 w-full rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] pl-10 pr-3 text-sm outline-none focus:border-[var(--color-amber-400)]" />
          </label>
          <select name="category_id" defaultValue={filters.category_id} className="h-11 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] px-3 text-sm">
            <option value="">All categories</option>
            {flatCategories.map((category) => <option key={category.id} value={category.id}>{`${'-- '.repeat(category.depth)}${category.name}`}</option>)}
          </select>
          <select name="sort" defaultValue={filters.sort} className="h-11 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] px-3 text-sm">
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <Button type="submit">Search</Button>
        </div>
      </form>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">{pagination.total || 0} book(s) found</p>
        <div className="inline-flex rounded-sm border border-[var(--color-border)] bg-white p-1">
          <button onClick={() => setView('grid')} className={`grid h-9 w-9 place-items-center rounded-sm ${view === 'grid' ? 'bg-[var(--color-parchment-100)]' : ''}`}><Grid2X2 size={17} /></button>
          <button onClick={() => setView('list')} className={`grid h-9 w-9 place-items-center rounded-sm ${view === 'list' ? 'bg-[var(--color-parchment-100)]' : ''}`}><List size={18} /></button>
        </div>
      </div>

      <div className="mt-5">
        {status === 'loading' && <LoadingState label="Loading books..." />}
        {status === 'error' && <ErrorState message={error} onRetry={loadBooks} />}
        {status === 'ready' && books.length === 0 && <EmptyState title="No books found" description="Try a different search or category." />}
        {status === 'ready' && books.length > 0 && (
          <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-4' : 'grid gap-4'}>
            {books.map((book) => <BookCard key={book.id} book={book} layout={view} showSeller onAddToCart={handleAdd} />)}
          </div>
        )}
      </div>

      {status === 'ready' && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" disabled={pagination.page <= 1} onClick={() => setFilters((value) => ({ ...value, page: value.page - 1 }))}>Previous</Button>
          <span className="self-center text-sm text-[var(--color-text-muted)]">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters((value) => ({ ...value, page: value.page + 1 }))}>Next</Button>
        </div>
      )}
    </section>
  );
};

export default AllBooks;
