import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Heart, ShoppingBag, ShieldCheck, Store, Star } from 'lucide-react';
import Button from '../ui/Button.jsx';
import PublicService from '../../services/PublicService.js';
import ReviewService from '../../services/ReviewService.js';
import useAuth from '../../hooks/useAuth.js';
import useCart from '../../hooks/useCart.js';
import useWishlist from '../../hooks/useWishlist.js';
import { formatCurrency } from '../../utils/formatters.js';
import ReviewList from '../reviews/ReviewList.jsx';
import ReviewForm from '../reviews/ReviewForm.jsx';
import StarRating from './StarRating.jsx';

const BookDetailes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBuyer } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await ReviewService.getBookReviews(id);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Could not load reviews", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadBook = async () => {
      setStatus('loading');
      try {
        const response = await PublicService.getBookById(id);
        if (mounted) {
          setBook(response.data);
          setStatus('ready');
          fetchReviews();
        }
      } catch (error) {
        if (mounted) {
          setMessage(error.message || 'This book could not be loaded.');
          setStatus('error');
        }
      }
    };

    loadBook();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Fetch related books once the main book is loaded
  useEffect(() => {
    if (!book) return;
    let mounted = true;
    
    const loadRelated = async () => {
      setLoadingRelated(true);
      try {
        let results = [];
        // If the book has categories, fetch by category
        if (book.categories && book.categories.length > 0) {
          const res = await PublicService.getBooks({ category_id: book.categories[0].id, limit: 5 });
          results = res.data || [];
        } 
        // If no category or very few results, fallback to featured
        if (results.length < 2) {
          const res = await PublicService.getFeaturedBooks();
          results = res.data || [];
        }
        
        if (mounted) {
          // Filter out the current book
          const filtered = results.filter(b => b.id !== book.id).slice(0, 4);
          setRelatedBooks(filtered);
        }
      } catch (error) {
        console.error("Could not load related books", error);
      } finally {
        if (mounted) setLoadingRelated(false);
      }
    };
    
    loadRelated();
    return () => { mounted = false; };
  }, [book]);

  const categories = useMemo(() => book?.categories || [], [book]);
  const coverImage = book?.image_url || book?.cover_image;
  const alreadyInCart = book?.id ? isInCart(book.id) : false;

  const handleAddToCart = async () => {
    if (!book?.id) return;
    setMessage('');
    try {
      await addToCart(book.id, 1);
      setMessage('Added to cart.');
    } catch (error) {
      setMessage(error.message || 'Could not add this book to cart.');
    }
  };

  const saved = book?.id ? isInWishlist(book.id) : false;

  const handleToggleWishlist = () => {
    if (!book?.id) return;
    if (!isBuyer) {
      navigate('/login');
      return;
    }
    if (saved) {
      removeFromWishlist(book.id);
      setMessage('Removed from wishlist.');
    } else {
      addToWishlist(book);
      setMessage('Added to wishlist.');
    }
  };

  if (status === 'loading') {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="aspect-[3/4] rounded-md skeleton" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 skeleton" />
            <div className="h-5 w-1/3 skeleton" />
            <div className="h-28 w-full skeleton" />
          </div>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-rust-500)]">Book unavailable</p>
        <h1 className="mt-3 text-3xl text-[var(--color-text-primary)]">We could not open this book.</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">{message}</p>
        <Link to="/" className="mt-8 inline-flex">
          <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>Back to home</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[var(--color-surface)]">
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          {coverImage ? (
            <img src={coverImage} alt={book.title} className="aspect-[3/4] h-full w-full object-cover" />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center bg-[var(--color-ink-900)] px-8 text-center">
              <span className="font-display text-2xl text-[var(--color-parchment-50)]">{book.title}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <ArrowLeft size={16} /> Back to browsing
          </Link>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category.id} className="badge bg-[var(--color-parchment-100)] text-[var(--color-text-muted)]">
                {category.name}
              </span>
            ))}
            {book.condition && (
              <span className="badge bg-[var(--color-accent-light)] text-[var(--color-amber-600)]">
                {String(book.condition).replace(/[-_]/g, ' ')}
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl text-[var(--color-text-primary)] sm:text-5xl">{book.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <p className="text-lg text-[var(--color-text-secondary)]">by {book.author}</p>
            <div className="flex items-center gap-2 border-[var(--color-border)] sm:border-l sm:pl-4">
              <StarRating rating={Math.round(book.average_rating || 0)} size={18} />
              <span className="text-sm text-[var(--color-text-muted)]">
                {book.average_rating ? Number(book.average_rating).toFixed(1) : 'No ratings'} ({book.total_reviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="font-display text-3xl font-semibold text-[var(--color-text-primary)]">
              {formatCurrency(book.price)}
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-[var(--color-sage-600)]">
              <CheckCircle2 size={16} /> {book.stock_quantity || 0} in stock
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isBuyer ? (
              <Button
                size="lg"
                variant="primary"
                onClick={handleAddToCart}
                disabled={alreadyInCart}
                leftIcon={<ShoppingBag size={18} />}
              >
                {alreadyInCart ? 'Already in cart' : 'Add to cart'}
              </Button>
            ) : (
              <Link to="/login">
                <Button size="lg" variant="primary" leftIcon={<ShoppingBag size={18} />}>Login to buy</Button>
              </Link>
            )}
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleToggleWishlist}
              leftIcon={<Heart size={18} className={saved ? "fill-[var(--color-amber-600)] text-[var(--color-amber-600)]" : ""} />}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>

          {message && <p className="mt-4 text-sm text-[var(--color-text-muted)]">{message}</p>}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-[var(--color-border)] bg-white p-4">
              <Store className="mb-2 text-[var(--color-sage-600)]" size={20} />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{book.store_name || 'Independent seller'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Packed and shipped by the listing seller.</p>
            </div>
            <div className="rounded-md border border-[var(--color-border)] bg-white p-4">
              <ShieldCheck className="mb-2 text-[var(--color-sage-600)]" size={20} />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Verified listing</p>
              <p className="text-xs text-[var(--color-text-muted)]">Stock, condition, and price are checked at listing time.</p>
            </div>
          </div>

          <div className="mt-10 border-t border-[var(--color-border)] pt-8">
            <h3 className="mb-4 font-display text-xl font-semibold text-[var(--color-ink-900)]">About this book</h3>
            <div className="prose-book max-w-2xl whitespace-pre-line text-[var(--color-text-secondary)] leading-relaxed">
              {book.description || 'A carefully listed book from the Bibliobazar marketplace, ready for its next reader.'}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews Section ── */}
      {status === 'ready' && book && (
        <section className="border-t border-[var(--color-border)] bg-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-ink-900)]">
                Customer Reviews
              </h2>
              <Button variant="outline" onClick={() => {
                if (!isBuyer) navigate('/login');
                else setShowReviewForm(!showReviewForm);
              }}>
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </Button>
            </div>
            
            {showReviewForm && (
              <div className="mb-10">
                <ReviewForm 
                  bookId={book.id} 
                  onCancel={() => setShowReviewForm(false)} 
                  onSuccess={() => {
                    setShowReviewForm(false);
                    fetchReviews();
                  }} 
                />
              </div>
            )}

            <ReviewList reviews={reviews} />
          </div>
        </section>
      )}

      {/* ── Related Books Section ── */}
      {relatedBooks.length > 0 && (
        <section className="border-t border-[var(--color-border)] bg-[var(--color-parchment-50)] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 font-display text-2xl font-semibold text-[var(--color-ink-900)]">
              You might also like
            </h2>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {relatedBooks.map((relBook) => (
                <Link 
                  key={relBook.id} 
                  to={`/books/${relBook.id}`}
                  className="group flex flex-col rounded-md border border-[var(--color-border)] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded bg-[var(--color-parchment-200)]">
                    {relBook.image_url ? (
                      <img src={relBook.image_url} alt={relBook.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-2 text-center">
                        <span className="text-[0.6rem] font-bold text-[var(--color-text-muted)]">NO COVER</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-[var(--color-ink-900)] line-clamp-2 group-hover:text-[var(--color-sage-600)] transition-colors">
                        {relBook.title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)] line-clamp-1">by {relBook.author}</p>
                    </div>
                    <div className="mt-3 font-semibold text-[var(--color-text-primary)]">
                      {formatCurrency(relBook.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default BookDetailes;
