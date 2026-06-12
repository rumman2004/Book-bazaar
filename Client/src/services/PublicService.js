import api from './Api.js';

/**
 * PublicService — wraps /api/public endpoints (no auth required)
 */
const PublicService = {
  /**
   * Get all active books with optional filters and pagination.
   * @param {Object} params - { page, limit, search, category_id, min_price, max_price, condition, sort }
   */
  getBooks: async (params = {}) => {
    const response = await api.get('/public/books', { params });
    return response.data;
  },

  /**
   * Get a single book's full details by ID.
   * @param {number|string} id
   */
  getBookById: async (id) => {
    const response = await api.get(`/public/books/${id}`);
    return response.data;
  },

  /**
   * Get 8 newest featured books for the landing page.
   */
  getFeaturedBooks: async () => {
    const response = await api.get('/public/books/featured');
    return response.data;
  },

  /**
   * Get best-selling books based on order quantities.
   */
  getBestSellers: async () => {
    const response = await api.get('/public/books/bestsellers');
    return response.data;
  },

  /**
   * Get all categories as a nested tree structure.
   */
  getCategories: async () => {
    const response = await api.get('/public/categories');
    return response.data;
  },
};

export default PublicService;