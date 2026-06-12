import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, Check, X, ShieldCheck, Truck } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import BuyerService from '../../services/BuyerService.js';
import CouponService from '../../services/CouponService.js';
import useCart from '../../hooks/useCart.js';
import { formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, fetchCart } = useCart();
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setStatus('loading');
      try {
        const [profile] = await Promise.all([BuyerService.getProfile(), fetchCart()]);
        setAddress(profile.data?.default_shipping_address || '');
        setStatus('ready');
      } catch (err) {
        setMessage(err.message || 'Could not load checkout.');
        setStatus('error');
      }
    };
    loadProfile();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    try {
      const response = await CouponService.validateCoupon(couponCode);
      setAppliedCoupon(response.data?.data);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid coupon code.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setStatus('saving');
    setMessage('');
    try {
      // The backend expects an object with shipping_address and optionally coupon_code
      await BuyerService.checkout({
        shipping_address: address,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined
      });
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate('/buyer/orders', { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Could not place order.');
      setStatus('ready');
      window.scrollTo(0, 0);
    }
  };

  // Calculate final totals
  const subtotal = Number(cartTotal) || 0;
  const discount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  if (status === 'loading') return <LoadingState label="Preparing checkout..." />;
  if (status === 'error') return <ErrorState message={message} />;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        eyebrow="Secure Checkout"
        title="Review & Pay"
        description="Confirm your delivery details to complete your order."
      />

      {!items.length ? (
        <EmptyState
          title="Nothing to checkout"
          description="Your cart is empty. Add some books before proceeding to checkout."
          action={<Link to="/buyer/books"><Button>Browse Marketplace</Button></Link>}
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start mt-6">

          {/* Left Column: Shipping & Payment Method */}
          <div className="space-y-6">
            {message && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <p className="text-sm font-medium text-red-800">{message}</p>
              </div>
            )}

            <form id="checkout-form" onSubmit={submitOrder} className="rounded-md border border-[var(--color-border)] bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink-900)] mb-4 flex items-center gap-2">
                <Truck className="text-[var(--color-sage-600)]" size={20} />
                Shipping Details
              </h2>
              <TextArea
                label="Delivery Address"
                placeholder="Enter your full street address, city, and zip code..."
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={4}
                required
              />

              <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                <h2 className="font-display text-xl font-semibold text-[var(--color-ink-900)] mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-[var(--color-sage-600)]" size={20} />
                  Payment Method
                </h2>

                {/* Simplified COD Selection */}
                <div className="relative flex items-center gap-3 p-4 rounded-lg border-2 border-[var(--color-sage-600)] bg-[var(--color-parchment-100)] cursor-pointer">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-[var(--color-sage-600)] bg-[var(--color-sage-600)]">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-ink-900)]">Cash on Delivery (COD)</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Pay safely when your books arrive at your doorstep.</p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary & Coupons */}
          <aside className="sticky top-24 rounded-md border border-[var(--color-border)] bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink-900)] border-b border-[var(--color-border)] pb-4 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-16 shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--color-ink-900)] line-clamp-2">{item.title}</p>
                      <p className="text-[var(--color-text-muted)] mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="border-t border-[var(--color-border)] pt-5">
              <h3 className="text-sm font-semibold text-[var(--color-ink-900)] mb-3 flex items-center gap-2">
                <Tag size={16} /> Have a coupon?
              </h3>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check size={16} />
                    <span className="font-bold tracking-wide">{appliedCoupon.code}</span>
                    <span className="text-sm">applied!</span>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-green-600 hover:text-green-900" title="Remove coupon">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 h-10"
                    disabled={validatingCoupon}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApplyCoupon}
                    loading={validatingCoupon}
                    disabled={!couponCode}
                    className="h-10 px-4"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {/* Totals Calculation */}
            <div className="border-t border-[var(--color-border)] pt-5 space-y-3">
              <div className="flex justify-between text-[var(--color-text-primary)]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>

              <div className="flex justify-between items-end border-t border-[var(--color-border)] pt-4 mt-2">
                <span className="font-semibold text-lg">Total</span>
                <div className="text-right">
                  {appliedCoupon && (
                    <span className="block text-sm text-[var(--color-text-muted)] line-through mb-1">
                      {formatCurrency(subtotal)}
                    </span>
                  )}
                  <span className="font-display text-3xl font-bold text-[var(--color-ink-900)]">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              loading={status === 'saving'}
              fullWidth
              size="lg"
              className="mt-6 shadow-md"
            >
              Complete Order
            </Button>

            <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
              By placing your order, you agree to Bibliobazar's terms and conditions.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
};

export default Checkout;
