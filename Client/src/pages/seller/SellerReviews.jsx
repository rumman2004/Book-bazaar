import React, { useEffect, useState } from 'react';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/PageStates.jsx';
import ReviewService from '../../services/ReviewService.js';
import { formatDateTime } from '../../utils/formatters.js';
import StarRating from '../../components/common/StarRating.jsx';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const SellerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadReviews = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await ReviewService.getSellerReviews();
      setReviews(response.data || []);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load reviews.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await ReviewService.replyToReview(reviewId, replyText);
      toast.success('Reply posted successfully!');
      setReplyingTo(null);
      setReplyText('');
      loadReviews(); // reload to get the updated response
    } catch (err) {
      toast.error('Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Helper for buyer initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <section className="pb-10">
      <PageHeader 
        eyebrow="Feedback" 
        title="Customer Reviews" 
        description="See what buyers are saying about your books and reply to their feedback." 
      />

      {status === 'loading' && <LoadingState label="Loading reviews..." />}
      {status === 'error' && <ErrorState message={error} onRetry={loadReviews} />}
      {status === 'ready' && reviews.length === 0 && <EmptyState title="No reviews yet" description="Reviews from your buyers will appear here." />}
      
      {status === 'ready' && reviews.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="flex flex-col bg-white border border-[var(--color-border)] rounded-md shadow-[var(--shadow-card)] p-5">
              
              {/* Book Info Header */}
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3 mb-4">
                <div className="h-12 w-8 shrink-0 bg-[var(--color-parchment-200)] rounded overflow-hidden">
                  {review.book_image ? (
                    <img src={review.book_image} alt="Book" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Book Reviewed</p>
                  <h3 className="font-display font-semibold text-[var(--color-ink-900)] truncate">{review.book_title}</h3>
                </div>
              </div>

              {/* Review Content */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[var(--color-parchment-100)] flex items-center justify-center">
                    {review.buyer_avatar ? (
                      <img src={review.buyer_avatar} alt="Buyer" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--color-sage-700)]">{getInitials(review.buyer_name)}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-[var(--color-ink-900)]">{review.buyer_name || 'Buyer'}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{formatDateTime(review.created_at)}</span>
                  </div>
                </div>
                <StarRating rating={review.rating} size={14} />
              </div>

              {review.comment && (
                <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-line mb-3">
                  "{review.comment}"
                </p>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.images.map((imgUrl, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedImage(imgUrl)}
                      className="h-12 w-12 rounded border border-[var(--color-border)] overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      <img src={imgUrl} alt={`Review photo ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Seller Response Section */}
              <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
                {review.seller_response ? (
                  <div className="bg-[var(--color-parchment-50)] p-3 rounded border-l-2 border-[var(--color-sage-500)]">
                    <p className="text-xs font-bold text-[var(--color-sage-700)] mb-1 uppercase tracking-wider">Your Reply</p>
                    <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line">{review.seller_response}</p>
                  </div>
                ) : replyingTo === review.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your public response..."
                      className="w-full text-sm p-2 border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-sage-500)]"
                      rows="3"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setReplyingTo(null); setReplyText(''); }} disabled={submittingReply}>Cancel</Button>
                      <Button variant="primary" size="sm" onClick={() => handleReplySubmit(review.id)} disabled={submittingReply || !replyText.trim()}>Post Reply</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setReplyingTo(review.id)}>Reply to Review</Button>
                )}
              </div>

            </article>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <img 
              src={selectedImage} 
              alt="Enlarged review photo" 
              className="max-w-full max-h-[90vh] object-contain rounded-md" 
            />
            <button 
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </section>
  );
};

export default SellerReviews;
