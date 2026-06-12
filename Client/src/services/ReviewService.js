import api from './Api';

const ReviewService = {
  /**
   * Submit a review (Buyer only)
   * FormData expected containing: book_id, rating, comment, and optionally images (files)
   */
  submitReview: async (formData) => {
    const response = await api.post('/buyer/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all reviews for a specific book (Public)
   */
  getBookReviews: async (bookId) => {
    const response = await api.get(`/public/books/${bookId}/reviews`);
    return response.data;
  },

  /**
   * Get all reviews for the current seller
   */
  getSellerReviews: async () => {
    const response = await api.get(`/seller/reviews`);
    return response.data;
  },

  /**
   * Seller replies to a review
   */
  replyToReview: async (reviewId, seller_response) => {
    const response = await api.put(`/seller/reviews/${reviewId}/response`, { seller_response });
    return response.data;
  }
};

export default ReviewService;
