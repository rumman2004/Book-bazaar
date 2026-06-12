import { useState } from 'react';
import { X, Star, Upload, Loader2 } from 'lucide-react';
import Button from '../ui/Button.jsx';
import ReviewService from '../../services/ReviewService.js';
import toast from 'react-hot-toast';

const ReviewForm = ({ bookId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("You can only upload up to 5 images.");
      return;
    }
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('book_id', bookId);
      formData.append('rating', rating);
      if (comment) formData.append('comment', comment);
      
      images.forEach(img => {
        formData.append('images', img);
      });

      await ReviewService.submitReview(formData);
      toast.success("Review submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white p-6 rounded-md border border-[var(--color-border)] shadow-sm">
      <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
        <h3 className="font-display font-semibold text-xl text-[var(--color-ink-900)]">Write a Review</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)] transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[var(--color-ink-900)]">Overall Rating <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star 
                size={32} 
                className={`${(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-border)]'} transition-colors`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="comment" className="text-sm font-semibold text-[var(--color-ink-900)]">Add a written review (optional)</label>
        <textarea
          id="comment"
          rows="4"
          placeholder="What did you like or dislike? What was the book's condition?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-sage-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-sage-500)] resize-y"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[var(--color-ink-900)] flex items-center justify-between">
          <span>Add photos (optional)</span>
          <span className="text-xs text-[var(--color-text-muted)] font-normal">{images.length}/5 max</span>
        </label>
        
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative h-20 w-20 rounded-md border border-[var(--color-border)] overflow-hidden group">
                <img src={URL.createObjectURL(img)} alt="preview" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 5 && (
          <div className="relative border-2 border-dashed border-[var(--color-border)] rounded-md hover:bg-[var(--color-parchment-50)] transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isSubmitting}
            />
            <div className="flex flex-col items-center justify-center py-6 text-[var(--color-text-muted)] pointer-events-none">
              <Upload size={24} className="mb-2" />
              <p className="text-sm font-medium">Click or drag images to upload</p>
              <p className="text-xs mt-1">JPEG, PNG up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Submitting...</span>
          ) : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
