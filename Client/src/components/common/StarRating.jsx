import { Star } from 'lucide-react';

const StarRating = ({ rating, maxStars = 5, size = 16, className = '' }) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        return (
          <Star 
            key={i} 
            size={size} 
            className={`${isFilled ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-border)]'} transition-colors`} 
          />
        );
      })}
    </div>
  );
};

export default StarRating;
