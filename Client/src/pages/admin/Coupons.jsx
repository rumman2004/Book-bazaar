import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import CouponService from '../../services/CouponService.js';
import toast from 'react-hot-toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [filterMode, setFilterMode] = useState('all');
  const [form, setForm] = useState({ code: '', discount_amount: '', valid_until: '' });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadCoupons = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await CouponService.getAllCoupons();
      // Axios returns { data: { success: true, data: [...] } }
      setCoupons(response.data?.data || []);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load coupons.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.code || !form.discount_amount) {
      toast.error('Code and discount amount are required.');
      return;
    }
    
    setStatus('saving');
    setError('');
    try {
      await CouponService.createCoupon({ 
        code: form.code, 
        discount_amount: form.discount_amount, 
        valid_until: form.valid_until || null 
      });
      setForm({ code: '', discount_amount: '', valid_until: '' });
      toast.success('Coupon created successfully!');
      loadCoupons();
    } catch (err) {
      toast.error(err.message || 'Could not create coupon.');
      setStatus('ready');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await CouponService.toggleCouponStatus(id);
      toast.success('Coupon status updated');
      loadCoupons();
    } catch (err) {
      toast.error(err.message || 'Could not update coupon.');
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    const isExpired = !coupon.is_active || (coupon.valid_until && new Date(coupon.valid_until) < new Date());
    if (filterMode === 'current') return !isExpired;
    if (filterMode === 'expired') return isExpired;
    return true;
  });

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        eyebrow="Admin catalog" 
        title="Discount Coupons" 
        description="Create and manage global discount codes for buyers to use during checkout. Keep past coupons for your records." 
      />
      
      {/* Create Form */}
      <form onSubmit={submit} className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--color-ink-900)] mb-4 flex items-center gap-2">
          <Plus size={18} /> Create New Coupon
        </h3>
        <div className="grid gap-5 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
          <Input 
            label="Coupon Code" 
            placeholder="e.g. SUMMER50"
            value={form.code} 
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} 
            required 
          />
          <Input 
            label="Discount (₹)" 
            type="number"
            min="1"
            placeholder="50"
            value={form.discount_amount} 
            onChange={(e) => setForm((prev) => ({ ...prev, discount_amount: e.target.value }))} 
            required 
          />
          <Input 
            label="Valid Until (Optional)" 
            type="date"
            value={form.valid_until} 
            onChange={(e) => setForm((prev) => ({ ...prev, valid_until: e.target.value }))} 
          />
          <Button type="submit" loading={status === 'saving'}>Create</Button>
        </div>
      </form>

      {error && <ErrorState message={error} />}
      {status === 'loading' && <LoadingState label="Loading coupons..." />}
      {status === 'error' && <ErrorState message={error} onRetry={loadCoupons} />}
      
      {status === 'ready' && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          {/* Header & Filter */}
          <div className="p-5 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <h3 className="text-lg font-bold text-[var(--color-ink-900)]">Coupon Repository</h3>
            <select 
              className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-ink-900)] shadow-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              id="coupon-filter"
            >
              <option value="all">All Coupons ({coupons.length})</option>
              <option value="current">Current / Active</option>
              <option value="expired">Expired / Inactive</option>
            </select>
          </div>

          {filteredCoupons.length === 0 ? (
            <div className="p-10">
              <EmptyState title={filterMode === 'all' ? "No coupons available" : `No ${filterMode} coupons found`} />
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]" id="coupon-list">
              {filteredCoupons.map((coupon) => {
                const isTimeExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
                const isEffectivelyExpired = !coupon.is_active || isTimeExpired;
                
                return (
                  <div key={coupon.id} className={`coupon-item flex flex-col sm:flex-row sm:items-center justify-between p-5 transition-colors hover:bg-gray-50 ${isEffectivelyExpired ? 'opacity-75' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${isEffectivelyExpired ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Tag size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-lg text-[var(--color-ink-900)] tracking-wide">
                            {coupon.code}
                          </p>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isEffectivelyExpired ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isEffectivelyExpired ? 'Inactive' : 'Active'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <p className="font-semibold text-emerald-700">
                            ₹{Number(coupon.discount_amount).toLocaleString('en-IN')} OFF
                          </p>
                          {coupon.valid_until && (
                            <p className={`${isTimeExpired ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                              {isTimeExpired ? 'Expired:' : 'Expires:'} {new Date(coupon.valid_until).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 flex items-center justify-end">
                      <button 
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                          coupon.is_active 
                            ? 'border-red-200 text-red-600 hover:bg-red-50' 
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                        onClick={() => toggleStatus(coupon.id)}
                      >
                        {coupon.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Coupons;
