import { useEffect, useState } from 'react';
import { User, ShoppingBag, Star, Settings, AlertTriangle, Clock } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/PageStates.jsx';
import AdminService from '../../services/AdminService.js';
import { formatDateTime } from '../../utils/formatters.js';

const getActivityIcon = (type) => {
  switch (type) {
    case 'auth':
      return <User size={20} className="text-blue-500" />;
    case 'order':
      return <ShoppingBag size={20} className="text-emerald-500" />;
    case 'review':
      return <Star size={20} className="text-amber-500" />;
    case 'error':
      return <AlertTriangle size={20} className="text-red-500" />;
    case 'system':
    default:
      return <Settings size={20} className="text-gray-500" />;
  }
};

const getActivityBg = (type) => {
  switch (type) {
    case 'auth':
      return 'bg-blue-50 border-blue-100';
    case 'order':
      return 'bg-emerald-50 border-emerald-100';
    case 'review':
      return 'bg-amber-50 border-amber-100';
    case 'error':
      return 'bg-red-50 border-red-100';
    case 'system':
    default:
      return 'bg-gray-50 border-gray-100';
  }
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await AdminService.getActivityLogs({ 
        page: 1, 
        limit: 100, 
        ...(typeFilter ? { type: typeFilter } : {}) 
      });
      setLogs(response.data || []);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load activity logs.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadLogs();
  }, [typeFilter]);

  return (
    <section className="max-w-4xl">
      <PageHeader eyebrow="Admin tools" title="System Activity Log" description="Live feed of platform-wide events, orders, auth, and errors." />
      
      <div className="mb-6 flex overflow-x-auto gap-2 pb-2">
        <button 
          onClick={() => setTypeFilter('')} 
          className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${typeFilter === '' ? 'bg-[var(--color-ink-900)] text-white border-[var(--color-ink-900)]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          All Activity
        </button>
        <button 
          onClick={() => setTypeFilter('auth')} 
          className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${typeFilter === 'auth' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          Auth Events
        </button>
        <button 
          onClick={() => setTypeFilter('order')} 
          className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${typeFilter === 'order' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          Orders
        </button>
        <button 
          onClick={() => setTypeFilter('review')} 
          className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${typeFilter === 'review' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          Reviews
        </button>
        <button 
          onClick={() => setTypeFilter('error')} 
          className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${typeFilter === 'error' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          Errors
        </button>
      </div>

      {status === 'loading' && <LoadingState label="Loading activity logs..." />}
      {status === 'error' && <ErrorState message={error} onRetry={loadLogs} />}
      {status === 'ready' && logs.length === 0 && <EmptyState title="No activity recorded" />}
      
      {status === 'ready' && logs.length > 0 && (
        <div className="relative border-l-2 border-[var(--color-border)] ml-6 space-y-6 pb-6">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-8">
              {/* Timeline dot/icon */}
              <div className={`absolute -left-[21px] top-1 h-10 w-10 rounded-full border-4 border-[var(--color-background)] bg-white shadow-sm flex items-center justify-center z-10 ${getActivityBg(log.type)}`}>
                {getActivityIcon(log.type)}
              </div>
              
              {/* Log Content Card */}
              <div className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                    {log.action}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100 self-start sm:self-auto">
                    <Clock size={12} className="mr-1.5" />
                    {formatDateTime(log.created_at)}
                  </div>
                </div>
                
                <div className="text-sm text-[var(--color-text-primary)] bg-gray-50/50 rounded p-3 mb-3 border border-gray-100">
                  {log.details || 'No additional details provided.'}
                </div>
                
                {log.user_email && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                    <div className="h-6 w-6 rounded-full bg-[var(--color-parchment-200)] flex items-center justify-center text-xs font-bold text-[var(--color-ink-900)] uppercase">
                      {log.user_role ? log.user_role[0] : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                        {log.user_name || 'System User'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {log.user_email} • {log.user_role}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ActivityLog;
