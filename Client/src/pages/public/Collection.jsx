import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid2X2, List, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import BookCard from '../../components/common/BookCard.jsx';
import Button from '../../components/ui/Button.jsx';
import PublicService from '../../services/PublicService.js';
import { BOOK_CONDITION_LABELS, DEFAULT_PAGE_LIMIT, SORT_OPTIONS } from '../../utils/constant.js';

const flattenCategories = (items = [], depth = 0) =>
  items.flatMap((item) => [
    { id: item.id, name: item.name, depth },
    ...flattenCategories(item.children || [], depth + 1),
  ]);

const getParam = (searchParams, key, fallback = '') => searchParams.get(key) || fallback;

const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: DEFAULT_PAGE_LIMIT, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid');

  const filters = useMemo(() => ({
    search: getParam(searchParams, 'search'),
    category_id: getParam(searchParams, 'category_id'),
    condition: getParam(searchParams, 'condition'),
    min_price: getParam(searchParams, 'min_price'),
    max_price: getParam(searchParams, 'max_price'),
    sort: getParam(searchParams, 'sort', 'newest'),
    page: Number(getParam(searchParams, 'page', '1')) || 1,
  }), [searchParams]);

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const response = await PublicService.getCategories();
        if (mounted) setCategories(response.data || []);
      } catch {
        if (mounted) setCategories([]);
      }
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadBooks = async () => {
      setIsLoading(true);
      setError('');

      const params = {
        page: filters.page,
        limit: DEFAULT_PAGE_LIMIT,
        sort: filters.sort,
      };

      ['search', 'category_id', 'condition', 'min_price', 'max_price'].forEach((key) => {
        if (filters[key]) params[key] = filters[key];
      });

      try {
        const response = await PublicService.getBooks(params);
        if (mounted) {
          setBooks(response.data || []);
          setPagination(response.pagination || { total: 0, page: filters.page, limit: DEFAULT_PAGE_LIMIT, totalPages: 1 });
        }
      } catch (err) {
        if (mounted) {
          setBooks([]);
          setPagination({ total: 0, page: filters.page, limit: DEFAULT_PAGE_LIMIT, totalPages: 1 });
          setError(err.message || 'Could not load books. Please make sure the server is running.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadBooks();
    return () => {
      mounted = false;
    };
  }, [filters]);

  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    if (!Object.prototype.hasOwnProperty.call(patch, 'page')) {
      next.delete('page');
    }

    setSearchParams(next);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateFilters({
      search: formData.get('search')?.trim() || '',
      category_id: formData.get('category_id') || '',
      condition: formData.get('condition') || '',
      min_price: formData.get('min_price') || '',
      max_price: formData.get('max_price') || '',
      sort: formData.get('sort') || 'newest',
    });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const resultLabel = pagination.total === 1 ? '1 book' : `${pagination.total} books`;

  return (
    <main className="bg-[var(--color-surface)]">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-ink-900)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-parchment-300)]">Public collection</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl">Explore all books</h1>
              <p className="mt-3 max-w-2xl text-[var(--color-parchment-200)]">
                Search the full marketplace catalogue and narrow it by category, condition, price, and freshness.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur">
              <Filter size={17} /> {isLoading ? 'Loading books' : resultLabel}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="rounded-md border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_0.8fr_0.7fr_0.7fr_0.9fr_auto]">
            <label className="relative">
              <span className="sr-only">Search books</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
              <input
                name="search"
                defaultValue={filters.search}
                placeholder="Search title, author, or ISBN"
                className="h-11 w-full rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] pl-10 pr-3 text-sm outline-none transition focus:border-[var(--color-amber-400)] focus:ring-2 focus:ring-[var(--color-amber-400)]/20"
              />
            </label>

            <select
              name="category_id"
              defaultValue={filters.category_id}
              className="h-11 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] px-3 text-sm text-[var(--color-text-secondary)] outline-none transition focus:border-[var(--color-amber-400)]"
              aria-label="Category"
            >
              <option value="">All categories</option>
              {flatCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {`${'-- '.repeat(category.depth)}${category.name}`}
                </option>
              ))}
            </select>

            <select
              name="condition"
              defaultValue={filters.condition}
              className="h-11 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] px-3 text-sm text-[var(--color-text-secondary)] outline-none transition focus:border-[var(--color-amber-400)]"
              aria-label="Condition"
            >
              <option value="">All conditions</option>
              {Object.entries(BOOK_CONDITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <input
              name="min_price"
              type="number"
              min="0"
              defaultValue={filters.min_price}
              placeholder="Min ₹"
              className="h-11 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] px-3 text-sm outline-none transition focus:border-[var(--color-amber-400)]"
            />

            <input
              name="max_price"
              type="number"
              min="0"
              defaultValue={filters.max_price}
              placeholder="Max ₹"
              className="h-11 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] px-3 text-sm outline-none transition focus:border-[var(--color-amber-400)]"
            />

            <select
              name="sort"
              defaultValue={filters.sort}
              className="h-11 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] px-3 text-sm text-[var(--color-text-secondary)] outline-none transition focus:border-[var(--color-amber-400)]"
              aria-label="Sort books"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <Button type="submit" className="h-11" leftIcon={<SlidersHorizontal size={16} />}>
              Apply
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]"
            >
              <RotateCcw size={15} /> Clear filters
            </button>
            <div className="inline-flex rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] p-1">
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`grid h-9 w-9 place-items-center rounded-sm ${view === 'grid' ? 'bg-white text-[var(--color-ink-900)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
                aria-label="Grid view"
              >
                <Grid2X2 size={17} />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={`grid h-9 w-9 place-items-center rounded-sm ${view === 'list' ? 'bg-white text-[var(--color-ink-900)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-[3/5] rounded-md skeleton" />
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-4' : 'grid gap-4'}>
              {books.map((book) => (
                <BookCard key={book.id} book={book} layout={view} showSeller />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-[var(--color-border)] bg-white px-6 py-16 text-center shadow-[var(--shadow-card)]">
              <h2 className="text-2xl text-[var(--color-text-primary)]">No books found</h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">Try removing a filter or searching with a different keyword.</p>
              <Button onClick={clearFilters} className="mt-6" variant="outline">Reset collection</Button>
            </div>
          )}
        </div>

        {!isLoading && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => updateFilters({ page: String(pagination.page - 1) })}
            >
              Previous
            </Button>
            <span className="px-3 text-sm font-medium text-[var(--color-text-muted)]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateFilters({ page: String(pagination.page + 1) })}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Collection;
