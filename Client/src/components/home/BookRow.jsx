import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters.js';

const BookRow = ({ title, books }) => {
  if (!books || books.length === 0) return null;

  return (
    <div className="mb-8 rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-display text-[var(--color-text-primary)]">{title}</h2>
        <Link to="/buyer/books" className="text-sm font-semibold text-[var(--color-ink-900)] hover:text-[var(--color-amber-600)]">
          View All
        </Link>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
        {books.map((book) => (
          <Link 
            key={book.id} 
            to={`/buyer/books/${book.id}`} 
            className="flex-shrink-0 w-[160px] snap-start group"
          >
            <div className="h-[220px] w-full overflow-hidden rounded-md bg-[var(--color-parchment-100)] mb-3">
              {book.image_url ? (
                <img 
                  src={book.image_url} 
                  alt={book.title} 
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
                  No Cover
                </div>
              )}
            </div>
            <h3 className="font-semibold text-sm line-clamp-2 text-[var(--color-text-primary)] group-hover:text-[var(--color-amber-600)] transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] truncate mt-1">
              {book.author}
            </p>
            <p className="font-semibold mt-1">
              {formatCurrency(book.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BookRow;
