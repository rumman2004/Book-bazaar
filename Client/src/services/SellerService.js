import api from './api.js';

/**
 * SellerService — wraps /api/seller endpoints (Seller JWT required)
 */
const SellerService = {
  // ─── DASHBOARD ────────────────────────────────────────────

  /**
   * Get seller dashboard stats.
   */
  getDashboard: async () => {
    const response = await api.get('/seller/dashboard');
    return response.data;
  },

  // ─── PROFILE ──────────────────────────────────────────────

  /**
   * Get seller profile.
   */
  getProfile: async () => {
    const response = await api.get('/seller/profile');
    return response.data;
  },

  /**
   * Update seller profile.
   * @param {Object} data - { store_name, contact_person, phone, business_address, gstin, bank_account_details }
   */
  updateProfile: async (data) => {
    const response = await api.put('/seller/profile', data);
    return response.data;
  },

  /**
   * Upload or replace seller avatar image.
   * @param {File} file - Image file to upload
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/seller/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Remove seller avatar image.
   */
  deleteAvatar: async () => {
    const response = await api.delete('/seller/profile/avatar');
    return response.data;
  },

  /**
   * Change seller password.
   * @param {Object} data - { current_password, new_password }
   */
  changePassword: async (data) => {
    const response = await api.put('/seller/profile/password', data);
    return response.data;
  },

  // ─── BOOKS ────────────────────────────────────────────────

  /**
   * Get all books listed by this seller (paginated).
   * @param {Object} params - { page, limit }
   */
  getMyBooks: async (params = {}) => {
    const response = await api.get('/seller/books', { params });
    return response.data;
  },

  /**
   * Get a single book by ID (must be owned by this seller).
   * @param {number|string} id
   */
  getBookById: async (id) => {
    const response = await api.get(`/seller/books/${id}`);
    return response.data;
  },

  /**
   * Add a new book listing. Accepts multipart/form-data for image uploads.
   * @param {FormData} formData - Book data including optional image file
   */
  addBook: async (formData) => {
    const response = await api.post('/seller/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update an existing book. Accepts multipart/form-data for optional image re-upload.
   * @param {number|string} id
   * @param {FormData} formData
   */
  updateBook: async (id, formData) => {
    const response = await api.put(`/seller/books/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Delete (or soft-deactivate) a book listing.
   * @param {number|string} id
   */
  deleteBook: async (id) => {
    const response = await api.delete(`/seller/books/${id}`);
    return response.data;
  },

  // ─── ORDERS ────────────────────────────────────────────────

  /**
   * Get all orders that contain this seller's books.
   * @param {Object} params - { status } optional filter
   */
  getMyOrders: async (params = {}) => {
    const response = await api.get('/seller/orders', { params });
    return response.data;
  },

  /**
   * Update the status of an order.
   * @param {number|string} orderId
   * @param {string} status - e.g. 'processing', 'shipped', 'delivered', 'cancelled'
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/seller/orders/${orderId}/status`, { status });
    return response.data;
  },

  // ─── REVENUE ──────────────────────────────────────────────

  /**
   * Get revenue summary and monthly breakdown.
   */
  getRevenue: async (params = {}) => {
    const { data } = await api.get('/seller/revenue', { params });
    return data;
  },
};

export default SellerService;