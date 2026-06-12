import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar, IndianRupee, Package, ShoppingBag, Clock, CheckCircle2, TrendingUp, Truck } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/PageStates.jsx';
import SellerService from '../../services/SellerService.js';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/formatters.js';

const Revenue = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('all'); // '7d', 'month', 'year', 'all'

  const loadRevenue = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await SellerService.getRevenue({ range: dateRange });
      setRevenueData(response.data);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load revenue.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadRevenue();
  }, [dateRange]);

  const summary = revenueData?.summary || {};
  const statusBreakdown = revenueData?.statusBreakdown || [];
  const timeseries = revenueData?.timeseries || [];
  const timeGroup = revenueData?.timeGroup || 'month';

  // Format timeseries for Recharts
  const chartData = timeseries.map((item) => ({
    name: timeGroup === 'day' ? formatDate(item.date).split(',')[0].slice(0, 6) : formatMonthYear(item.date),
    revenue: parseFloat(item.revenue),
  }));

  // Calculate status totals
  const getStatusTotal = (statusName) => {
    const item = statusBreakdown.find((s) => s.status === statusName);
    return item ? parseFloat(item.revenue) : 0;
  };

  const pendingRevenue = getStatusTotal('pending');
  const processingRevenue = getStatusTotal('processing');
  const shippedRevenue = getStatusTotal('shipped');
  const deliveredRevenue = getStatusTotal('delivered'); // completed/delivered

  const DateFilter = () => (
    <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-white p-1 shadow-sm">
      <Calendar size={16} className="text-[var(--color-text-muted)] ml-2" />
      <div className="flex">
        {[
          { label: '7D', value: '7d' },
          { label: 'Month', value: 'month' },
          { label: 'Year', value: 'year' },
          { label: 'All Time', value: 'all' },
        ].map((range) => (
          <button
            key={range.value}
            type="button"
            onClick={() => setDateRange(range.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
              dateRange === range.value
                ? 'bg-[var(--color-sage-100)] text-[var(--color-sage-800)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader eyebrow="Seller revenue" title="Revenue Dashboard" description="Track your store's earnings and performance." className="mb-0" />
        <DateFilter />
      </div>

      {status === 'loading' && <LoadingState label="Loading revenue data..." />}
      {status === 'error' && <ErrorState message={error} onRetry={loadRevenue} />}

      {status === 'ready' && (
        <>
          {/* ── Summary Stats ─────────────────────────────────── */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <StatCard label="Total revenue" value={formatCurrency(summary.total_revenue)} icon={IndianRupee} tone="rust" />
            <StatCard label="Total orders" value={summary.total_orders || 0} icon={ShoppingBag} tone="amber" />
            <StatCard label="Items sold" value={summary.total_items_sold || 0} icon={Package} tone="sage" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Status Breakdown (Left Column) ──────────────── */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] flex-1">
                <h2 className="text-xl font-display font-semibold text-[var(--color-ink-900)] mb-6">Revenue by Status</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-green-700">
                        <CheckCircle2 size={16} /> Completed
                      </span>
                      <span className="font-bold text-[var(--color-ink-900)]">{formatCurrency(deliveredRevenue)}</span>
                    </div>
                    <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: summary.total_revenue > 0 ? `${(deliveredRevenue / summary.total_revenue) * 100}%` : '0%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                        <Truck size={16} /> Shipped
                      </span>
                      <span className="font-bold text-[var(--color-ink-900)]">{formatCurrency(shippedRevenue)}</span>
                    </div>
                    <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: summary.total_revenue > 0 ? `${(shippedRevenue / summary.total_revenue) * 100}%` : '0%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                        <TrendingUp size={16} /> Processing
                      </span>
                      <span className="font-bold text-[var(--color-ink-900)]">{formatCurrency(processingRevenue)}</span>
                    </div>
                    <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: summary.total_revenue > 0 ? `${(processingRevenue / summary.total_revenue) * 100}%` : '0%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                        <Clock size={16} /> Pending
                      </span>
                      <span className="font-bold text-[var(--color-ink-900)]">{formatCurrency(pendingRevenue)}</span>
                    </div>
                    <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: summary.total_revenue > 0 ? `${(pendingRevenue / summary.total_revenue) * 100}%` : '0%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Revenue Chart (Right Column) ────────────────── */}
            <div className="lg:col-span-2">
              <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] h-full min-h-[350px] flex flex-col">
                <h2 className="text-xl font-display font-semibold text-[var(--color-ink-900)] mb-6">Revenue Trend</h2>
                
                {chartData.length > 0 ? (
                  <div className="flex-1 w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4a8c3f" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4a8c3f" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#737373' }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#737373' }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value), 'Revenue']}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#4a8c3f" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <EmptyState title="No data to graph" description="No revenue generated in the selected date range." />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Revenue;
