import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, History, BookOpen, ShoppingCart } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import useCart from '../../hooks/useCart.js';
import BuyerService from '../../services/BuyerService.js';
import PublicService from '../../services/PublicService.js';
import { formatCurrency } from '../../utils/formatters.js';

const CartSection = () => {
  const { items, cartTotal, itemCount, isLoading: isCartLoading, error: cartError, updateCartItem, removeFromCart, clearCart } = useCart();
  
  const [data, setData] = useState({ orders: [], recommended: [] });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsDataLoading(true);
      try {
        const [ordersResponse, booksResponse] = await Promise.all([
          BuyerService.getOrders(),
          PublicService.getFeaturedBooks(),
        ]);
        setData({
          orders: ordersResponse.data || [],
          recommended: booksResponse.data || [],
        });
      } catch (err) {
        setDataError(err.message || 'Could not load dashboard stats.');
      } finally {
        setIsDataLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isCartLoading) return <LoadingState label="Loading cart..." />;

  return (
    <section>
      <PageHeader eyebrow="Buyer cart" title="Shopping cart" description="Review quantities and proceed to checkout when ready." />
      
      {/* Stats Section moved from Home */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Cart items" value={itemCount} icon={ShoppingCart} tone="amber" />
        <StatCard label="Cart value" value={formatCurrency(cartTotal)} icon={ShoppingCart} tone="sage" />
        <StatCard label="Orders" value={isDataLoading ? '...' : data.orders.length} icon={History} tone="rust" />
        <StatCard label="Recommended" value={isDataLoading ? '...' : data.recommended.length} icon={BookOpen} tone="slate" />
      </div>

      {(cartError || dataError) && <ErrorState message={cartError || dataError} />}
      
      {!items.length ? (
        <EmptyState title="Your cart is empty" description="Add a few books from the marketplace." action={<Link to="/buyer/books"><Button>Browse books</Button></Link>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-md border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
                <div className="h-28 w-20 overflow-hidden rounded-sm bg-[var(--color-parchment-100)]">
                  {item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl text-[var(--color-text-primary)]">{item.title}</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">by {item.author} · {item.store_name}</p>
                  <p className="mt-2 font-semibold">{formatCurrency(item.price)}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button className="grid h-9 w-9 place-items-center rounded-sm border border-[var(--color-border)]" onClick={() => updateCartItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={15} /></button>
                    <span className="grid h-9 min-w-10 place-items-center rounded-sm border border-[var(--color-border)] px-3 text-sm font-semibold">{item.quantity}</span>
                    <button className="grid h-9 w-9 place-items-center rounded-sm border border-[var(--color-border)]" onClick={() => updateCartItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock_quantity}><Plus size={15} /></button>
                    <button className="ml-auto inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={() => removeFromCart(item.id)}><Trash2 size={15} /> Remove</button>
                  </div>
                </div>
                <p className="hidden text-right font-semibold sm:block">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl text-[var(--color-text-primary)]">Summary</h2>
            <div className="mt-4 flex justify-between border-t border-[var(--color-border)] pt-4">
              <span className="text-[var(--color-text-muted)]">Total</span>
              <span className="font-display text-2xl font-semibold">{formatCurrency(cartTotal)}</span>
            </div>
            <Link to="/buyer/checkout" className="mt-5 block"><Button fullWidth>Checkout</Button></Link>
            <Button className="mt-3" variant="ghost" fullWidth onClick={clearCart}>Clear cart</Button>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartSection;
