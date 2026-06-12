import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, Clock, IndianRupee, Package, TrendingUp, ChevronRight } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import SellerService from '../../services/SellerService.js';
import { formatCurrency } from '../../utils/formatters.js';

const OrderStatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
};

const SellerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await SellerService.getDashboard();
      setDashboard(response.data);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load seller dashboard.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (status === 'loading') return <LoadingState label="Loading seller dashboard..." />;
  if (status === 'error') return <ErrorState message={error} onRetry={loadDashboard} />;

  return (
    <section className="pb-10">
      <PageHeader
        eyebrow="Seller dashboard"
        title="Store overview"
        description="Live metrics from your products, orders, and revenue."
        action={<Link to="/seller/books/add"><Button>Add product</Button></Link>}
      />
      
      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active books" value={dashboard.total_books} icon={BookOpen} tone="sage" />
        <StatCard label="Active orders" value={dashboard.active_orders} icon={Package} tone="amber" />
        <StatCard label="Revenue" value={formatCurrency(dashboard.total_revenue)} icon={IndianRupee} tone="rust" />
        <StatCard label="Low stock" value={dashboard.low_stock_books?.length || 0} icon={AlertTriangle} tone="slate" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ── Left Column: Orders ──────────────────────────── */}
        <div className="flex flex-col gap-6">
          
          {/* Pending Orders */}
          <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold text-[var(--color-ink-900)] flex items-center gap-2">
                <Clock size={20} className="text-amber-500" /> Action Required (Pending)
              </h2>
              <Link to="/seller/orders?status=pending" className="text-sm font-medium text-[var(--color-sage-600)] hover:text-[var(--color-sage-700)] flex items-center">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            
            {dashboard.pending_orders?.length ? (
              <div className="divide-y divide-[var(--color-border)]">
                {dashboard.pending_orders.map((order) => (
                  <div key={order.order_item_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-ink-900)] line-clamp-1">{order.book_title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        Order #{order.order_id} • {new Date(order.created_at).toLocaleDateString()} • {order.buyer_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">{order.quantity}x</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="All caught up" description="No pending orders require your attention right now." />
            )}
          </div>

          {/* Recent Orders */}
          <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold text-[var(--color-ink-900)] flex items-center gap-2">
                <Package size={20} className="text-blue-500" /> Recent Orders
              </h2>
              <Link to="/seller/orders" className="text-sm font-medium text-[var(--color-sage-600)] hover:text-[var(--color-sage-700)] flex items-center">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            
            {dashboard.recent_orders?.length ? (
              <div className="divide-y divide-[var(--color-border)]">
                {dashboard.recent_orders.map((order) => (
                  <div key={order.order_item_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-ink-900)] line-clamp-1">{order.book_title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {order.quantity} unit(s) • {formatCurrency(order.item_total)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No orders yet" description="Your recent orders will appear here once customers start buying." />
            )}
          </div>

        </div>

        {/* ── Right Column: Books & Stock ──────────────────── */}
        <div className="flex flex-col gap-6">
          
          {/* Top Sellers (Popular Books) */}
          <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-display font-semibold text-[var(--color-ink-900)] flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-emerald-500" /> Top Selling Books
            </h2>
            
            {dashboard.popular_books?.length ? (
              <div className="divide-y divide-[var(--color-border)]">
                {dashboard.popular_books.map((book, index) => (
                  <div key={book.id} className="py-3 flex items-center gap-4">
                    <span className="text-lg font-bold text-[var(--color-text-muted)] w-4">{index + 1}</span>
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.title} className="h-12 w-10 object-cover rounded-sm border border-[var(--color-border)]" />
                    ) : (
                      <div className="h-12 w-10 bg-[var(--color-parchment-100)] rounded-sm border border-[var(--color-border)] flex items-center justify-center">
                        <BookOpen size={16} className="text-[var(--color-text-muted)]" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[var(--color-ink-900)] line-clamp-2">{book.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center justify-center bg-[var(--color-parchment-100)] text-[var(--color-ink-900)] font-bold text-xs rounded-full h-8 px-3">
                        {book.total_sold} sold
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No sales data" description="You haven't sold any books yet. Keep adding inventory!" />
            )}
          </div>

          {/* Low Stock Books */}
          <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold text-[var(--color-ink-900)] flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" /> Low Stock Alerts
              </h2>
              <Link to="/seller/books" className="text-sm font-medium text-[var(--color-sage-600)] hover:text-[var(--color-sage-700)] flex items-center">
                Manage <ChevronRight size={16} />
              </Link>
            </div>
            
            {dashboard.low_stock_books?.length ? (
              <div className="divide-y divide-[var(--color-border)]">
                {dashboard.low_stock_books.map((book) => (
                  <div key={book.id} className="flex items-center justify-between py-3">
                    <p className="font-semibold text-sm line-clamp-1 flex-1 pr-4">{book.title}</p>
                    <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-700 shrink-0">
                      {book.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Stock looks healthy" description="No active books are under the low-stock threshold (≤ 5 units)." />
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default SellerDashboard;
