import api from './Api.js';

/**
 * AdminService — wraps /api/admin endpoints (Admin JWT required)
 */
const AdminService = {
  // ─── DASHBOARD ────────────────────────────────────────────

  /**
   * Get platform-wide dashboard stats.
   */
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Get system-wide activity logs.
   * @param {Object} params - { page, limit, type }
   */
  getActivityLogs: async (params = {}) => {
    const response = await api.get('/admin/activity', { params });
    return response.data;
  },

  /**
   * Get leaderboard stats (Top Sellers, Top Books).
   */
  getLeaderboard: async () => {
    const response = await api.get('/admin/leaderboard');
    return response.data;
  },

  // ─── USER MANAGEMENT ──────────────────────────────────────

  /**
   * Get all users with optional filters and pagination.
   * @param {Object} params - { page, limit, role, search }
   */
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Activate or deactivate a user account.
   * @param {number|string} userId
   * @param {boolean} is_active
   */
  setUserStatus: async (userId, is_active) => {
    const response = await api.put(`/admin/users/${userId}/status`, { is_active });
    return response.data;
  },

  /**
   * Get all buyers with pagination.
   * @param {Object} params - { page, limit }
   */
  getAllBuyers: async (params = {}) => {
    const response = await api.get('/admin/buyers', { params });
    return response.data;
  },

  /**
   * Get all sellers with pagination and optional verified filter.
   * @param {Object} params - { page, limit, verified }
   */
  getAllSellers: async (params = {}) => {
    const response = await api.get('/admin/sellers', { params });
    return response.data;
  },

  /**
   * Approve or revoke a seller's verification.
   * @param {number|string} sellerId
   * @param {boolean} is_verified
   */
  verifySeller: async (sellerId, is_verified) => {
    const response = await api.put(`/admin/sellers/${sellerId}/verify`, { is_verified });
    return response.data;
  },

  // ─── CATEGORIES ───────────────────────────────────────────

  /**
   * Get all categories with book counts and parent info.
   */
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  /**
   * Create a new category.
   * @param {Object} data - { name, description, parent_id }
   */
  createCategory: async (data) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  /**
   * Update an existing category.
   * @param {number|string} id
   * @param {Object} data - { name, description, parent_id }
   */
  updateCategory: async (id, data) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete a category (fails if books are assigned to it).
   * @param {number|string} id
   */
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // ─── PRODUCTS ─────────────────────────────────────────────

  /**
   * Get all products (books) on the platform.
   * @param {Object} params - { page, limit, search, is_active }
   */
  getAllProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  // ─── ORDERS ───────────────────────────────────────────────

  /**
   * Get all orders on the platform.
   * @param {Object} params - { page, limit, status }
   */
  getAllOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },
};

export default AdminService;
