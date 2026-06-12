import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, LayoutGrid, List } from 'lucide-react';
import { EmptyState, PageHeader } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import useWishlist from '../../hooks/useWishlist.js';
import useCart from '../../hooks/useCart.js';
import BookCard from '../../components/common/BookCard.jsx';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [layout, setLayout] = useState('grid'); // 'grid' or 'list'

  const handleAddToCart = async (book) => {
    try {
      await addToCart(book.id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.message || 'Could not add to cart.');
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow="Wishlist"
        title="Saved books"
        description="Your personal collection of books to read later."
      />
      
      {!wishlist || wishlist.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="You haven't saved any books yet. Browse the marketplace to find your next great read."
          action={<Link to="/buyer/books"><Button leftIcon={<Heart size={16} />}>Browse books</Button></Link>}
        />
      ) : (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink-900)]">
              Your Collection ({wishlist.length})
            </h2>
            <div className="flex items-center gap-2 bg-[var(--color-parchment-100)] p-1 rounded-md">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded transition-colors ${layout === 'grid' ? 'bg-white shadow-sm text-[var(--color-sage-600)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                aria-label="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded transition-colors ${layout === 'list' ? 'bg-white shadow-sm text-[var(--color-sage-600)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2'}`}>
            {wishlist.map((book) => (
              <div key={book.id} className="relative group">
                <BookCard 
                  book={book} 
                  layout={layout} 
                  showSeller={true}
                  onAddToCart={handleAddToCart}
                />
                {/* Remove button overlay */}
                <button 
                  onClick={() => {
                    removeFromWishlist(book.id);
                    toast.success('Removed from wishlist');
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                  title="Remove from wishlist"
                >
                  <Heart size={16} className="fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Wishlist;
