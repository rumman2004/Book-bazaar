import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/common/PageStates.jsx';
import BuyerService from '../../services/BuyerService.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await BuyerService.getOrders();
      setOrders(response.data || []);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load orders.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <section>
      <PageHeader eyebrow="Orders" title="Order history" description="Live order records from your buyer account." />
      {status === 'loading' && <LoadingState label="Loading orders..." />}
      {status === 'error' && <ErrorState message={error} onRetry={loadOrders} />}
      {status === 'ready' && orders.length === 0 && <EmptyState title="No orders yet" description="Your completed checkouts will appear here." />}
      {status === 'ready' && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-col rounded-md border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
              
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-parchment-50)] px-5 py-3 gap-2">
                <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)] font-medium">
                  <div className="flex items-center gap-1.5 text-[var(--color-ink-900)]">
                    <Package size={16} /> <span>Order #{order.id}</span>
                  </div>
                  <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-[var(--color-border)]"></span>
                  <span className="text-xs">{formatDateTime(order.created_at)}</span>
                </div>
                <StatusBadge value={order.status} />
              </div>

              <div className="p-5 flex flex-col gap-6">
                {/* Items List */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="flex items-start gap-4 rounded-md border border-[var(--color-border)] bg-[var(--color-parchment-50)] p-4 transition-colors hover:bg-[var(--color-parchment-100)]">
                      {item.book_image ? (
                        <img src={item.book_image} alt={item.book_title} className="h-20 w-14 rounded-sm object-cover border border-[var(--color-border)] shadow-sm shrink-0" />
                      ) : (
                        <div className="h-20 w-14 rounded-sm bg-[var(--color-parchment-200)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                          <span className="text-[0.6rem] font-bold text-[var(--color-text-muted)] text-center px-1">NO COVER</span>
                        </div>
                      )}
                      
                      <div className="flex flex-1 flex-col justify-between h-full min-w-0">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-[var(--color-ink-900)] line-clamp-1" title={item.book_title}>{item.book_title}</h3>
                          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Sold by: {item.store_name || 'Independent Seller'}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-flex items-center justify-center bg-white border border-[var(--color-border)] text-[var(--color-ink-900)] font-bold text-xs rounded-full px-2 py-0.5 shadow-sm">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-bold text-[var(--color-text-primary)]">
                            {formatCurrency(item.price_at_purchase)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer / Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[var(--color-border)] pt-4 gap-4">
                  <div className="text-sm text-[var(--color-text-muted)]">
                    <span className="font-semibold text-[var(--color-text-secondary)]">Ship to: </span>
                    {order.shipping_address}
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Total</span>
                    <span className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrderHistory;
