import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Edit, LayoutGrid, List, Plus, Trash2 } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import SellerService from '../../services/SellerService.js';
import { formatCurrency } from '../../utils/formatters.js';

const AllProducts = () => {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const loadBooks = async (page = pagination.page) => {
    setStatus('loading');
    setError('');
    try {
      const response = await SellerService.getMyBooks({ page, limit: 12 });
      setBooks(response.data || []);
      setPagination(response.pagination || { page, totalPages: 1 });
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load products.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadBooks(1);
  }, []);

  const deleteBook = async (id) => {
    if (!confirm('Remove this product from your store?')) return;
    await SellerService.deleteBook(id);
    loadBooks(pagination.page);
  };

  // Header actions containing both the Add button and the View Toggles
  const headerActions = (
    <div className="flex items-center gap-3">
      {status === 'ready' && books.length > 0 && (
        <div className="flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-[var(--color-parchment-200)] text-[var(--color-ink-900)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]'
            }`}
            title="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-[var(--color-parchment-200)] text-[var(--color-ink-900)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]'
            }`}
            title="List view"
          >
            <List size={18} />
          </button>
        </div>
      )}
      <Link to="/seller/books/add">
        <Button leftIcon={<Plus size={16} />}>Add book</Button>
      </Link>
    </div>
  );

  return (
    <section className="pb-10">
      <PageHeader
        eyebrow="Seller products"
        title="Your books"
        description="Manage listings pulled directly from your seller inventory."
        action={headerActions}
      />
      
      {status === 'loading' && <LoadingState label="Loading products..." />}
      {status === 'error' && <ErrorState message={error} onRetry={() => loadBooks(pagination.page)} />}
      {status === 'ready' && books.length === 0 && (
        <EmptyState title="No products yet" description="Create your first book listing to start selling." action={<Link to="/seller/books/add"><Button>Add product</Button></Link>} />
      )}
      
      {status === 'ready' && books.length > 0 && (
        <div className="mt-6">
          {viewMode === 'grid' ? (
            /* ── GRID VIEW ─────────────────────────────────────── */
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <div key={book.id} className="group relative flex flex-col overflow-hidden rounded-md border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-md">
                  {/* Cover Image */}
                  <div className="aspect-[3/4] w-full overflow-hidden bg-[var(--color-parchment-100)] border-b border-[var(--color-border)] relative flex items-center justify-center">
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <BookOpen size={40} className="text-[var(--color-text-muted)]" />
                    )}
                    {/* Status badge overlaid on image */}
                    <div className="absolute top-3 left-3">
                      <StatusBadge value={book.is_active ? 'active' : 'inactive'} />
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)] line-clamp-2" title={book.title}>{book.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-1">{book.author}</p>
                    
                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        <p className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(book.price)}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          Stock: <span className={`font-semibold ${book.stock_quantity <= 5 ? 'text-red-600' : ''}`}>{book.stock_quantity}</span>
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/seller/books/${book.id}/edit`} className="grid h-8 w-8 place-items-center rounded-sm border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-parchment-100)] hover:text-[var(--color-ink-900)] transition-colors cursor-pointer" title="Edit book">
                          <Edit size={14} />
                        </Link>
                        <button onClick={() => deleteBook(book.id)} className="grid h-8 w-8 place-items-center rounded-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Delete book">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── LIST VIEW ─────────────────────────────────────── */
            <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--color-parchment-100)] text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                    <tr>
                      <th className="px-4 py-3">Book</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {books.map((book) => (
                      <tr key={book.id} className="hover:bg-[var(--color-parchment-50)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {book.image_url ? (
                              <img src={book.image_url} alt={book.title} className="h-12 w-9 rounded-sm object-cover border border-[var(--color-border)] shrink-0" />
                            ) : (
                              <div className="h-12 w-9 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-200)] flex items-center justify-center shrink-0">
                                <BookOpen size={14} className="text-[var(--color-text-muted)]" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-[var(--color-ink-900)] line-clamp-1">{book.title}</p>
                              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{formatCurrency(book.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`${book.stock_quantity <= 5 ? 'text-red-600 font-bold' : ''}`}>
                            {book.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge value={book.is_active ? 'active' : 'inactive'} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Link to={`/seller/books/${book.id}/edit`} className="grid h-8 w-8 place-items-center rounded-sm border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-parchment-100)] hover:text-[var(--color-ink-900)] transition-colors cursor-pointer" title="Edit book">
                              <Edit size={14} />
                            </Link>
                            <button onClick={() => deleteBook(book.id)} className="grid h-8 w-8 place-items-center rounded-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Delete book">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {status === 'ready' && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" disabled={pagination.page <= 1} onClick={() => loadBooks(pagination.page - 1)}>Previous</Button>
          <span className="self-center text-sm font-medium text-[var(--color-text-muted)]">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => loadBooks(pagination.page + 1)}>Next</Button>
        </div>
      )}
    </section>
  );
};

export default AllProducts;
