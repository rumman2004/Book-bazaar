import { useEffect, useState } from 'react';
import { Search, LayoutGrid, List, BookOpen } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import AdminService from '../../services/AdminService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', is_active: '' });
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadProducts = async (page = pagination.page) => {
    setStatus('loading');
    setError('');
    try {
      const response = await AdminService.getAllProducts({ page, limit: 20, ...filters });
      setProducts(response.data || []);
      setPagination(response.pagination || { page, totalPages: 1 });
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load products.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, [filters]);

  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFilters({ search: form.get('search') || '', is_active: form.get('is_active') || '' });
  };

  return (
    <section>
      <PageHeader eyebrow="Admin products" title="All products" description="Live platform inventory across all sellers." />
      
      <div className="mb-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <form onSubmit={submit} className="flex-1 grid gap-3 rounded-md border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)] w-full md:grid-cols-[1fr_180px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input name="search" defaultValue={filters.search} placeholder="Search title or author" className="h-11 w-full rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] pl-10 pr-3 text-sm focus:outline-none focus:border-[var(--color-ink-900)]" />
          </label>
          <select name="is_active" defaultValue={filters.is_active} className="h-11 rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-50)] px-3 text-sm focus:outline-none focus:border-[var(--color-ink-900)]">
            <option value="">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>

        <div className="flex bg-white rounded-md border border-[var(--color-border)] shadow-[var(--shadow-card)] p-1">
          <button 
            onClick={() => setViewMode('list')} 
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-[var(--color-parchment-100)] text-[var(--color-ink-900)]' : 'text-gray-400 hover:text-gray-600'}`}
            title="List View"
          >
            <List size={20} />
          </button>
          <button 
            onClick={() => setViewMode('grid')} 
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[var(--color-parchment-100)] text-[var(--color-ink-900)]' : 'text-gray-400 hover:text-gray-600'}`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {status === 'loading' && <LoadingState label="Loading products..." />}
      {status === 'error' && <ErrorState message={error} onRetry={() => loadProducts(pagination.page)} />}
      {status === 'ready' && products.length === 0 && <EmptyState title="No products found" />}
      
      {status === 'ready' && products.length > 0 && viewMode === 'list' && (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-parchment-100)] text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">{product.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{product.author}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.store_name || '-'}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">{product.stock_quantity}</td>
                  <td className="px-4 py-3"><StatusBadge value={product.is_active ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(product.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === 'ready' && products.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <article key={product.id} className="group flex flex-col overflow-hidden rounded-md border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <BookOpen size={48} className="text-gray-300" />
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge value={product.is_active ? 'active' : 'inactive'} />
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-[var(--color-text-primary)] line-clamp-1" title={product.title}>{product.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">{product.author}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">By {product.store_name || '-'}</p>
                
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="font-bold text-lg text-[var(--color-rust-600)]">{formatCurrency(product.price)}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AllProducts;
