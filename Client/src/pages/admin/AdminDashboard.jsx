import { useEffect, useState } from 'react';
import { BookOpen, IndianRupee, ShoppingBag, Store, UserCheck, CheckCircle } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard, StatusBadge } from '../../components/common/PageStates.jsx';
import AdminService from '../../services/AdminService.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

const COLORS = ['#8b9d83', '#d97757']; // Sage and Rust from our design system

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await AdminService.getDashboard();
      setDashboard(response.data);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load admin dashboard.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (status === 'loading') return <LoadingState label="Loading admin dashboard..." />;
  if (status === 'error') return <ErrorState message={error} onRetry={loadDashboard} />;

  const stats = dashboard.stats || {};
  
  const pieData = [
    { name: 'Buyers', value: stats.total_buyers },
    { name: 'Sellers', value: stats.total_sellers }
  ];

  return (
    <section>
      <PageHeader eyebrow="Admin dashboard" title="Marketplace overview" description="Live platform metrics and visual analytics." />
      
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Buyers" value={stats.total_buyers} icon={UserCheck} tone="sage" />
        <StatCard label="Sellers" value={stats.total_sellers} icon={Store} tone="amber" />
        <StatCard label="Listed Books" value={stats.total_books} icon={BookOpen} tone="rust" />
        <StatCard label="Total Orders" value={stats.total_orders} icon={ShoppingBag} tone="slate" />
        <StatCard label="Completed" value={stats.completed_orders || 0} icon={CheckCircle} tone="sage" />
        <StatCard label="Total Revenue" value={formatCurrency(stats.total_revenue)} icon={IndianRupee} tone="rust" />
      </div>

      {/* Visuals Section */}
      <div className="grid gap-6 lg:grid-cols-3 mt-8">
        
        {/* Revenue Chart */}
        <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <h2 className="text-xl font-semibold text-[var(--color-ink-900)] mb-4">Daily Revenue (Last 7 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.sales_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97757" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d97757" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `₹${value}`} dx={-10} />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d97757" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users Demographics */}
        <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold text-[var(--color-ink-900)] mb-4">User Demographics</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Users']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-2xl text-[var(--color-text-primary)] mb-4">Recent orders</h2>
        {dashboard.recent_orders?.length ? (
          <div className="divide-y divide-[var(--color-border)]">
            {dashboard.recent_orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Order #{order.id} · {order.buyer_name || 'Unknown buyer'}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                  <StatusBadge value={order.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No orders yet" />
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
