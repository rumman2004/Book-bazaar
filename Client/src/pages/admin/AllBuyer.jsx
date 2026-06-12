import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import AdminService from '../../services/AdminService.js';
import { formatDate } from '../../utils/formatters.js';

const AllBuyer = () => {
  const [buyers, setBuyers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadBuyers = async (page = pagination.page) => {
    setStatus('loading');
    setError('');
    try {
      const response = await AdminService.getAllBuyers({ page, limit: 20 });
      setBuyers(response.data || []);
      setPagination(response.pagination || { page, totalPages: 1 });
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load buyers.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadBuyers(1);
  }, []);

  const toggleBuyer = async (buyer) => {
    await AdminService.setUserStatus(buyer.id, !buyer.is_active);
    loadBuyers(pagination.page);
  };

  return (
    <section>
      <PageHeader eyebrow="Admin users" title="All buyers" description="Live buyer accounts and order counts." />
      {status === 'loading' && <LoadingState label="Loading buyers..." />}
      {status === 'error' && <ErrorState message={error} onRetry={() => loadBuyers(pagination.page)} />}
      {status === 'ready' && buyers.length === 0 && <EmptyState title="No buyers found" />}
      {status === 'ready' && buyers.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-parchment-100)] text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Contact Info</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {buyers.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                        {buyer.avatar_url ? (
                          <img src={buyer.avatar_url} alt={buyer.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <User size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--color-text-primary)]">{buyer.full_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">ID: {buyer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{buyer.email}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{buyer.phone || 'No phone'}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={buyer.default_shipping_address || 'No address'}>
                    <span className={buyer.default_shipping_address ? "" : "text-gray-400 italic"}>
                      {buyer.default_shipping_address || 'Not provided'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {buyer.order_count}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {formatDate(buyer.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={buyer.is_active ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleBuyer(buyer)}>
                      {buyer.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AllBuyer;
