import api from './api.js';

/**
 * Auth Service — wraps /api/auth endpoints
 */
const AuthService = {
  /**
   * Register a new buyer or seller.
   * @param {Object} data - Registration payload (role, email, password, + role-specific fields)
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login a user and store the token.
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;

    if (token) {
      localStorage.setItem('bibliobazar_token', token);
      localStorage.setItem('bibliobazar_user', JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * Fetch current authenticated user info using stored JWT.
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out by clearing local storage.
   */
  logout: () => {
    localStorage.removeItem('bibliobazar_token');
    localStorage.removeItem('bibliobazar_user');
  },

  /**
   * Get the stored token from localStorage.
   */
  getToken: () => localStorage.getItem('bibliobazar_token'),

  /**
   * Get the stored user object from localStorage.
   */
  getStoredUser: () => {
    try {
      const raw = localStorage.getItem('bibliobazar_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if a token exists (basic auth check, not validated on server).
   */
  isAuthenticated: () => !!localStorage.getItem('bibliobazar_token'),
};

export default AuthService;