import { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, BookOpen, DollarSign, Award, ChevronRight } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState, PageHeader } from '../../components/common/PageStates.jsx';
import AdminService from '../../services/AdminService.js';
import { formatCurrency } from '../../utils/formatters.js';

const Leaderboard = () => {
  const [data, setData] = useState({ topSellers: [], topBooks: [] });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadLeaderboard = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await AdminService.getLeaderboard();
      setData(response.data || { topSellers: [], topBooks: [] });
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load leaderboard data.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  if (status === 'loading') return <section><LoadingState label="Loading Leaderboard..." /></section>;
  if (status === 'error') return <section><ErrorState message={error} onRetry={loadLeaderboard} /></section>;
  if (status === 'ready' && data.topSellers.length === 0) return <section><EmptyState title="No seller data available" /></section>;

  const top3 = data.topSellers.slice(0, 3);
  const restSellers = data.topSellers.slice(3);

  // Gradient themes matching the user's design request
  const themes = [
    { bg: 'from-yellow-100 to-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', icon: <Crown size={20} className="text-yellow-500 md:w-6 md:h-6" />, rank: '1st' },
    { bg: 'from-teal-100 to-blue-50', border: 'border-teal-200', text: 'text-teal-600', icon: <Medal size={20} className="text-teal-500 md:w-6 md:h-6" />, rank: '2nd' },
    { bg: 'from-orange-100 to-amber-50', border: 'border-orange-200', text: 'text-orange-600', icon: <Award size={20} className="text-orange-500 md:w-6 md:h-6" />, rank: '3rd' },
  ];

  // Calculate quick stats
  const totalBooksSold = data.topSellers.reduce((sum, s) => sum + parseInt(s.total_books_sold || 0), 0);
  const highestRevenue = Math.max(...data.topSellers.map(s => parseFloat(s.total_revenue || 0)));
  const mostActiveSeller = data.topSellers[0]; // Assuming #1 is most active

  return (
    <section className="max-w-7xl mx-auto space-y-6 md:space-y-10 px-1 sm:px-2 md:px-0">
      <div className="text-center relative py-4 md:py-6">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
          Champions
        </h1>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-parchment-200)] to-transparent opacity-50 rounded-2xl md:rounded-3xl" />
      </div>

      {/* Top 3 Champions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-2 md:pt-4">
        {top3.map((seller, index) => {
          const theme = themes[index];
          return (
            <div key={seller.seller_id} className={`relative rounded-xl md:rounded-2xl border ${theme.border} bg-white shadow-lg md:shadow-xl overflow-hidden transition-transform hover:-translate-y-1`}>
              {/* Top Gradient Area */}
              <div className={`h-16 md:h-24 w-full bg-gradient-to-br ${theme.bg} relative`}>
                <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center justify-center font-bold text-lg md:text-xl opacity-50">
                  {theme.rank}
                </div>
              </div>
              
              {/* Avatar */}
              <div className="absolute top-8 md:top-12 left-1/2 -translate-x-1/2">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-full border-[3px] md:border-4 border-white bg-[var(--color-parchment-300)] overflow-hidden shadow-md flex items-center justify-center">
                  {seller.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.store_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl md:text-3xl font-bold text-[var(--color-ink-900)]">{seller.store_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-white rounded-full p-0.5 md:p-1 shadow-sm">
                  {theme.icon}
                </div>
              </div>

              {/* Info */}
              <div className="pt-12 pb-4 px-4 md:pt-16 md:pb-6 md:px-6 text-center">
                <h3 className="text-lg md:text-xl font-bold text-[var(--color-ink-900)] truncate">{seller.store_name}</h3>
                <p className={`text-xs md:text-sm font-medium ${theme.text} mb-3 md:mb-4`}>Top Seller</p>
                
                <div className="grid grid-cols-2 gap-2 md:gap-4 mt-2 mb-4 md:mb-6">
                  <div className="flex flex-col items-center">
                    <span className="text-base md:text-lg font-bold text-[var(--color-ink-900)]">{seller.total_books_sold}</span>
                    <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Books Sold</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-base md:text-lg font-bold text-[var(--color-ink-900)]">{formatCurrency(seller.total_revenue)}</span>
                    <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Revenue</span>
                  </div>
                </div>

                <button className="w-full py-2 md:py-2.5 rounded-lg md:rounded-xl border border-gray-200 text-xs md:text-sm font-semibold text-[var(--color-ink-900)] hover:bg-gray-50 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="flex flex-col p-4 md:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-3xl font-extrabold text-[var(--color-ink-900)]">{totalBooksSold}</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Platform Books Sold</p>
            <p className="font-medium text-sm text-[var(--color-text-muted)] line-clamp-1">{mostActiveSeller?.store_name || 'No data'}</p>
          </div>
        </div>
        
        <div className="flex flex-col p-4 md:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign size={20} className="md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-3xl font-extrabold text-[var(--color-ink-900)]">{formatCurrency(highestRevenue)}</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Top Revenue</p>
            <p className="font-medium text-sm text-[var(--color-text-muted)] line-clamp-1">{mostActiveSeller?.store_name || 'No data'}</p>
          </div>
        </div>
        
        <div className="flex flex-col p-4 md:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-3xl font-extrabold text-[var(--color-ink-900)]">#1</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Most Active</p>
            <p className="font-medium text-sm text-[var(--color-text-muted)] line-clamp-1">By Sales Vol.</p>
          </div>
        </div>
        
        <div className="flex flex-col p-4 md:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Trophy size={20} className="md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-3xl font-extrabold text-[var(--color-ink-900)]">{data.topSellers.length}</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Sellers</p>
            <p className="font-medium text-sm text-[var(--color-text-muted)] line-clamp-1">On Leaderboard</p>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      {restSellers.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 font-medium text-center w-12 md:w-16">Rank</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 font-medium">Seller</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 font-medium text-right">Books Sold</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 font-medium text-right">Revenue</th>
                  <th className="px-2 md:px-6 py-3 md:py-4 font-medium w-10 md:w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {restSellers.map((seller, idx) => (
                  <tr key={seller.seller_id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-gray-400 text-center text-sm md:text-lg">{idx + 4}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[var(--color-parchment-200)] flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                          {seller.avatar_url ? (
                            <img src={seller.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs md:text-sm text-[var(--color-ink-900)]">{seller.store_name?.charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-semibold text-xs md:text-sm text-[var(--color-ink-900)]">{seller.store_name}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-medium text-[var(--color-ink-900)]">{seller.total_books_sold}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-medium text-[var(--color-ink-900)]">{formatCurrency(seller.total_revenue)}</td>
                    <td className="px-2 md:px-6 py-3 md:py-4 text-center">
                      <button className="p-1.5 md:p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                        <ChevronRight size={16} className="md:w-4 md:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Books Section */}
      {data.topBooks && data.topBooks.length > 0 && (
        <div className="pt-4 md:pt-8 pb-8">
          <PageHeader eyebrow="Product Analytics" title="Top Selling Books" description="The most popular items driving sales on your platform." />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mt-4 md:mt-6">
            {data.topBooks.map((book, idx) => (
              <div key={book.book_id} className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 h-6 w-6 md:h-8 md:w-8 bg-[var(--color-ink-900)] text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm border-2 border-white z-10">
                  {idx + 1}
                </div>
                <div className="aspect-[2/3] w-full rounded-md bg-gray-100 overflow-hidden mb-2 md:mb-3 border border-gray-200">
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BookOpen size={20} className="md:w-6 md:h-6" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-[var(--color-ink-900)] text-xs md:text-sm line-clamp-1" title={book.title}>{book.title}</h4>
                <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{book.author}</p>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] md:text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded flex-shrink-0">{book.total_sold} sold</span>
                  <span className="text-[9px] md:text-[10px] text-gray-400 truncate max-w-[50px] md:max-w-[60px] ml-1" title={book.store_name}>{book.store_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
};

export default Leaderboard;
