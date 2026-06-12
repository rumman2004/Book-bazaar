import api from './Api.js';

/**
 * BuyerService — wraps /api/buyer endpoints (Buyer JWT required)
 */
const BuyerService = {
  // ─── PROFILE ──────────────────────────────────────────────

  /**
   * Get the buyer's profile.
   */
  getProfile: async () => {
    const response = await api.get('/buyer/profile');
    return response.data;
  },

  /**
   * Update the buyer's profile.
   * @param {Object} data - { full_name, phone, default_shipping_address }
   */
  updateProfile: async (data) => {
    const response = await api.put('/buyer/profile', data);
    return response.data;
  },

  /**
   * Upload or replace buyer avatar image.
   * @param {File} file - Image file to upload
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/buyer/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Remove buyer avatar image.
   */
  deleteAvatar: async () => {
    const response = await api.delete('/buyer/profile/avatar');
    return response.data;
  },

  /**
   * Change buyer password.
   * @param {Object} data - { current_password, new_password }
   */
  changePassword: async (data) => {
    const response = await api.put('/buyer/profile/password', data);
    return response.data;
  },

  // ─── CART ──────────────────────────────────────────────────

  /**
   * Get the current buyer's cart with totals.
   */
  getCart: async () => {
    const response = await api.get('/buyer/cart');
    return response.data;
  },

  /**
   * Add a book to the cart (or increment quantity).
   * @param {number} book_id
   * @param {number} quantity - defaults to 1
   */
  addToCart: async (book_id, quantity = 1) => {
    const response = await api.post('/buyer/cart', { book_id, quantity });
    return response.data;
  },

  /**
   * Update the quantity of a specific cart item.
   * @param {number} cartItemId - The cart item's ID
   * @param {number} quantity
   */
  updateCartItem: async (cartItemId, quantity) => {
    const response = await api.put(`/buyer/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  /**
   * Remove a specific item from the cart.
   * @param {number} cartItemId
   */
  removeFromCart: async (cartItemId) => {
    const response = await api.delete(`/buyer/cart/${cartItemId}`);
    return response.data;
  },

  /**
   * Clear the entire cart.
   */
  clearCart: async () => {
    const response = await api.delete('/buyer/cart');
    return response.data;
  },

  // ─── ORDERS ────────────────────────────────────────────────

  /**
   * Place an order from the current cart.
   * @param {string} shipping_address
   */
  checkout: async (shipping_address) => {
    const response = await api.post('/buyer/orders/checkout', { shipping_address });
    return response.data;
  },

  /**
   * Get all orders for this buyer.
   */
  getOrders: async () => {
    const response = await api.get('/buyer/orders');
    return response.data;
  },

  /**
   * Get a single order's details.
   * @param {number|string} orderId
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/buyer/orders/${orderId}`);
    return response.data;
  },
};

export default BuyerService;