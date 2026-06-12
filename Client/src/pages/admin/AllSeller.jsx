import { useEffect, useState } from 'react';
import { Store as StoreIcon } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import AdminService from '../../services/AdminService.js';

const AllSeller = () => {
  const [sellers, setSellers] = useState([]);
  const [verified, setVerified] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadSellers = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await AdminService.getAllSellers({ page: 1, limit: 50, ...(verified ? { verified } : {}) });
      setSellers(response.data || []);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load sellers.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadSellers();
  }, [verified]);

  const setVerification = async (seller, isVerified) => {
    await AdminService.verifySeller(seller.id, isVerified);
    loadSellers();
  };

  const toggleStatus = async (seller) => {
    await AdminService.setUserStatus(seller.id, !seller.is_active);
    loadSellers();
  };

  return (
    <section>
      <PageHeader eyebrow="Admin users" title="All sellers" description="Verify stores and manage seller access." />
      <select value={verified} onChange={(event) => setVerified(event.target.value)} className="mb-5 h-11 rounded-sm border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-ink-900)]">
        <option value="">All sellers</option>
        <option value="true">Verified only</option>
        <option value="false">Pending verification</option>
      </select>
      {status === 'loading' && <LoadingState label="Loading sellers..." />}
      {status === 'error' && <ErrorState message={error} onRetry={loadSellers} />}
      {status === 'ready' && sellers.length === 0 && <EmptyState title="No sellers found" />}
      {status === 'ready' && sellers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {sellers.map((seller) => (
            <article key={seller.id} className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] hover:border-gray-300 transition-colors">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                
                {/* Seller Info Section */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 mt-1">
                    {seller.avatar_url ? (
                      <img src={seller.avatar_url} alt={seller.store_name} className="h-full w-full object-cover" />
                    ) : (
                      <StoreIcon size={28} className="text-gray-400" />
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        {seller.store_name}
                      </h2>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        <strong>Contact:</strong> {seller.contact_person}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-[var(--color-text-primary)]">
                      <p><strong>Email:</strong> {seller.email}</p>
                      <p><strong>Phone:</strong> {seller.phone}</p>
                      <p><strong>GSTIN:</strong> {seller.gstin || 'Not provided'}</p>
                      <p><strong>Active Books:</strong> {seller.book_count}</p>
                    </div>

                    <div className="text-sm text-[var(--color-text-primary)]">
                      <p><strong>Address:</strong> {seller.business_address}</p>
                    </div>
                  </div>
                </div>

                {/* Actions & Badges */}
                <div className="flex flex-col items-start lg:items-end gap-4 min-w-[200px]">
                  <div className="flex gap-2">
                    <StatusBadge value={seller.is_verified ? 'verified' : 'pending'} />
                    <StatusBadge value={seller.is_active ? 'active' : 'inactive'} />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full lg:w-auto mt-auto">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 lg:flex-none"
                      onClick={() => setVerification(seller, !seller.is_verified)}
                    >
                      {seller.is_verified ? 'Revoke Verify' : 'Verify Seller'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={seller.is_active ? "outline" : "primary"} 
                      className="flex-1 lg:flex-none"
                      onClick={() => toggleStatus(seller)}
                    >
                      {seller.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
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

export default AllSeller;
