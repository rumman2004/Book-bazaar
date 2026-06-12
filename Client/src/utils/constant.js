// ─── APP CONFIG ───────────────────────────────────────────
export const APP_NAME = 'Bibliobazar';
export const APP_TAGLINE = 'Your online book marketplace';

// ─── ROLES ────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  BUYER: 'buyer',
};

// ─── ORDER STATUSES ───────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  shipped: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-green-600 bg-green-50 border-green-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
};

// ─── BOOK CONDITIONS ──────────────────────────────────────
export const BOOK_CONDITION = {
  NEW: 'new',
  LIKE_NEW: 'like-new',
  GOOD: 'good',
  ACCEPTABLE: 'acceptable',
};

export const BOOK_CONDITION_LABELS = {
  new: 'New',
  'like-new': 'Like New',
  good: 'Good',
  acceptable: 'Acceptable',
};

export const BOOK_CONDITION_COLORS = {
  new: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'like-new': 'text-teal-700 bg-teal-50 border-teal-200',
  good: 'text-sky-700 bg-sky-50 border-sky-200',
  acceptable: 'text-orange-700 bg-orange-50 border-orange-200',
};

// ─── SORT OPTIONS ─────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title_asc', label: 'Title: A to Z' },
];

// ─── PAGINATION DEFAULTS ──────────────────────────────────
export const DEFAULT_PAGE_LIMIT = 12;
export const ADMIN_PAGE_LIMIT = 20;

// ─── LOCAL STORAGE KEYS ───────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: 'bibliobazar_token',
  USER: 'bibliobazar_user',
};

// ─── ROUTES ───────────────────────────────────────────────
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',

  // Buyer
  BUYER_HOME: '/buyer',
  BUYER_BOOKS: '/buyer/books',
  BUYER_BOOK_DETAIL: '/buyer/books/:id',
  BUYER_CART: '/buyer/cart',
  BUYER_CHECKOUT: '/buyer/checkout',
  BUYER_ORDERS: '/buyer/orders',
  BUYER_PROFILE: '/buyer/profile',
  BUYER_WISHLIST: '/buyer/wishlist',

  // Seller
  SELLER_DASHBOARD: '/seller',
  SELLER_BOOKS: '/seller/books',
  SELLER_ADD_BOOK: '/seller/books/add',
  SELLER_EDIT_BOOK: '/seller/books/:id/edit',
  SELLER_ORDERS: '/seller/orders',
  SELLER_REVENUE: '/seller/revenue',
  SELLER_PROFILE: '/seller/profile',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_BUYERS: '/admin/buyers',
  ADMIN_SELLERS: '/admin/sellers',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CATEGORIES: '/admin/categories',
};

// ─── API BASE URL ─────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── IMAGE PLACEHOLDER ────────────────────────────────────
export const BOOK_PLACEHOLDER_IMAGE = 'https://placehold.co/300x400/e2e8f0/64748b?text=No+Cover';