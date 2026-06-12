import { useEffect, useState, useMemo } from 'react';
import { Mail, MapPin, Phone, User, Package, Calendar } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import SellerService from '../../services/SellerService.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

const nextStatuses = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await SellerService.getMyOrders(filter ? { status: filter } : {});
      setOrders(response.data || []);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load orders.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const updateStatus = async (orderId, nextStatus) => {
    await SellerService.updateOrderStatus(orderId, nextStatus);
    loadOrders();
  };

  // Helper to extract initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Group orders by order_id so multiple items in the same order appear in one card
  const groupedOrders = useMemo(() => {
    const map = new Map();
    orders.forEach(item => {
      if (!map.has(item.order_id)) {
        map.set(item.order_id, {
          order_id: item.order_id,
          order_status: item.order_status,
          order_date: item.order_date,
          shipping_address: item.shipping_address,
          buyer_name: item.buyer_name,
          buyer_avatar: item.buyer_avatar,
          buyer_phone: item.buyer_phone,
          buyer_email: item.buyer_email,
          items: []
        });
      }
      map.get(item.order_id).items.push(item);
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
  }, [orders]);

  return (
    <section className="pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
        <PageHeader eyebrow="Seller orders" title="Order Management" description="Track and manage live orders containing your books." className="mb-0" />
        
        <div className="flex flex-col gap-1.5 shrink-0">
          <label htmlFor="status-filter" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Filter by Status
          </label>
          <div className="relative">
            <select 
              id="status-filter"
              value={filter} 
              onChange={(event) => setFilter(event.target.value)} 
              className="h-10 w-40 sm:w-48 appearance-none rounded-sm border border-[var(--color-border)] bg-white pl-3 pr-10 text-sm font-medium focus:border-[var(--color-sage-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-sage-500)]"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {status === 'loading' && <LoadingState label="Loading orders..." />}
      {status === 'error' && <ErrorState message={error} onRetry={loadOrders} />}
      {status === 'ready' && orders.length === 0 && <EmptyState title="No orders found" description={filter ? `You have no ${filter} orders right now.` : "Orders will appear when buyers purchase your books."} />}
      
      {status === 'ready' && groupedOrders.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {groupedOrders.map((order) => (
            <article key={order.order_id} className="flex flex-col rounded-md border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-parchment-50)] px-5 py-3">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] font-medium">
                  <Package size={16} /> <span>Order #{order.order_id}</span>
                </div>
                <StatusBadge value={order.order_status} />
              </div>

              <div className="flex flex-col p-5 gap-6 flex-1">
                {/* Book Details */}
                <div className="flex flex-col gap-4">
                  {order.items.map(item => (
                    <div key={item.order_item_id} className="flex items-start gap-4">
                      {item.book_image ? (
                        <img src={item.book_image} alt={item.book_title} className="h-20 w-14 rounded-sm object-cover border border-[var(--color-border)] shadow-sm shrink-0" />
                      ) : (
                        <div className="h-20 w-14 rounded-sm bg-[var(--color-parchment-200)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                          <span className="text-xs text-[var(--color-text-muted)] text-center px-1">No cover</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-lg text-[var(--color-ink-900)] line-clamp-1" title={item.book_title}>{item.book_title}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                          <Calendar size={14} /> <span>{formatDateTime(order.order_date)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="inline-flex items-center justify-center bg-[var(--color-parchment-100)] text-[var(--color-ink-900)] font-bold text-xs rounded-full px-2 py-0.5">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-bold text-[var(--color-text-primary)]">
                            {formatCurrency(item.item_total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buyer Profile Block */}
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-parchment-50)] p-4 mt-auto">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 flex items-center gap-1.5">
                    <User size={14} /> Buyer Information
                  </h4>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] bg-white flex items-center justify-center shadow-sm">
                      {order.buyer_avatar ? (
                        <img src={order.buyer_avatar} alt={order.buyer_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-[var(--color-sage-700)]">{getInitials(order.buyer_name)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-ink-900)] leading-tight">{order.buyer_name || 'Guest User'}</p>
                      {order.buyer_email && (
                        <a href={`mailto:${order.buyer_email}`} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-sage-600)] transition-colors flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {order.buyer_email}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm">
                    {order.buyer_phone && (
                      <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                        <Phone size={16} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                        <span>{order.buyer_phone}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                      <MapPin size={16} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                      <span className="line-clamp-2" title={order.shipping_address}>{order.shipping_address || 'No shipping address provided.'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[var(--color-border)] bg-[var(--color-parchment-50)] p-4">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {(nextStatuses[order.order_status] || []).length === 0 ? (
                    <span className="text-sm font-medium text-[var(--color-text-muted)] italic">
                      No further actions available.
                    </span>
                  ) : (
                    (nextStatuses[order.order_status] || []).map((next) => (
                      <Button 
                        key={next} 
                        size="sm" 
                        variant={next === 'cancelled' ? 'danger' : 'outline'} 
                        onClick={() => updateStatus(order.order_id, next)}
                      >
                        {next === 'processing' && 'Accept Order'}
                        {next === 'shipped' && 'Mark as Shipped'}
                        {next === 'delivered' && 'Mark as Delivered'}
                        {next === 'cancelled' && 'Cancel Order'}
                      </Button>
                    ))
                  )}
                </div>
              </div>

            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Order;
