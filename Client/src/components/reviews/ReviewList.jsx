import React, { useState } from 'react';
import StarRating from '../common/StarRating.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { User, MessageCircle } from 'lucide-react';

const ReviewList = ({ reviews }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center bg-white border border-[var(--color-border)] rounded-md shadow-sm">
        <MessageCircle size={48} className="text-[var(--color-parchment-300)] mb-4" />
        <h3 className="text-lg font-display font-semibold text-[var(--color-ink-900)]">No reviews yet</h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-md mt-1">Be the first to share your thoughts on this book after purchasing!</p>
      </div>
    );
  }

  // Helper for buyer initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6">
      {reviews.map((review) => (
        <div key={review.id} className="flex flex-col gap-4 p-5 bg-white border border-[var(--color-border)] rounded-md shadow-sm">
          
          {/* Header: Buyer info & Stars */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-parchment-100)] flex items-center justify-center shadow-sm">
                {review.buyer_avatar ? (
                  <img src={review.buyer_avatar} alt={review.buyer_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[var(--color-sage-700)]">{getInitials(review.buyer_name)}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[var(--color-ink-900)] text-sm">{review.buyer_name || 'Verified Buyer'}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{formatDateTime(review.created_at)}</span>
              </div>
            </div>
            <StarRating rating={review.rating} />
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-line leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Images Gallery */}
          {review.images && review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {review.images.map((imgUrl, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(imgUrl)}
                  className="h-16 w-16 md:h-20 md:w-20 rounded-md border border-[var(--color-border)] overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-500)]"
                >
                  <img src={imgUrl} alt={`Review photo ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Seller Response */}
          {review.seller_response && (
            <div className="mt-2 ml-4 p-4 bg-[var(--color-parchment-50)] border-l-4 border-[var(--color-sage-500)] rounded-r-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-sage-700)] flex items-center gap-1.5">
                  <User size={12} /> Response from Seller
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line">
                {review.seller_response}
              </p>
            </div>
          )}
        </div>
      ))}

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
    </div>
  );
};

export default ReviewList;
