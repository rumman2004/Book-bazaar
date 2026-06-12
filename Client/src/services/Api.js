import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────
// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bibliobazar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────
// Handle global errors: 401 (token expired), 403, network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Token expired or invalid — clean up and redirect to login
      localStorage.removeItem('bibliobazar_token');
      localStorage.removeItem('bibliobazar_user');
      // Dispatch a custom event so AuthContext can react
      window.dispatchEvent(new CustomEvent('auth:logout'));
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    // Normalize error message for consuming code
    const message =
      response?.data?.message ||
      response?.data?.error ||
      error.message ||
      'An unexpected error occurred.';

    return Promise.reject({ ...error, message });
  }
);

export default api;