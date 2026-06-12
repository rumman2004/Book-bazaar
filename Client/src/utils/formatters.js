// ─── CURRENCY FORMATTERS ──────────────────────────────────

/**
 * Format a number as Indian Rupee currency.
 * @param {number|string} amount
 * @param {boolean} compact - Use compact notation for large numbers (e.g. ₹1.2K)
 */
export const formatCurrency = (amount, compact = false) => {
  const num = parseFloat(amount) || 0;
  if (compact && num >= 1000) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format a number as a plain price string (e.g. "1,299.00").
 * @param {number|string} amount
 */
export const formatPrice = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// ─── DATE FORMATTERS ──────────────────────────────────────

/**
 * Format a date string as a readable date (e.g. "12 Jun 2024").
 * @param {string|Date} dateString
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

/**
 * Format a date string as a full readable datetime (e.g. "12 Jun 2024, 3:45 PM").
 * @param {string|Date} dateString
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString));
};

/**
 * Format a date as relative time (e.g. "2 days ago", "just now").
 * @param {string|Date} dateString
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  return formatDate(dateString);
};

/**
 * Format a month key from ISO string (e.g. "2024-06-01T00:00:00.000Z" → "Jun 2024").
 * @param {string} isoString
 */
export const formatMonthYear = (isoString) => {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoString));
};

// ─── STRING FORMATTERS ────────────────────────────────────

/**
 * Truncate a string to a given length, appending "…" if needed.
 * @param {string} str
 * @param {number} maxLength
 */
export const truncate = (str, maxLength = 80) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
};

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert a snake_case or kebab-case string to Title Case.
 * @param {string} str
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
};

// ─── NUMBER FORMATTERS ────────────────────────────────────

/**
 * Format a large number with commas (Indian number system).
 * @param {number|string} num
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(parseInt(num) || 0);
};

/**
 * Get initials from a full name (e.g. "John Doe" → "JD").
 * @param {string} name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
};

// ─── ORDER HELPERS ────────────────────────────────────────

/**
 * Format an order ID with a leading # for display (e.g. "#1042").
 * @param {number|string} id
 */
export const formatOrderId = (id) => `#${id}`;

/**
 * Calculate the subtotal of an array of cart/order items.
 * Each item must have `price` (or `price_at_purchase`) and `quantity`.
 * @param {Array} items
 */
export const calculateTotal = (items = []) => {
  return items.reduce((sum, item) => {
    const price = parseFloat(item.price_at_purchase ?? item.price) || 0;
    const qty = parseInt(item.quantity) || 0;
    return sum + price * qty;
  }, 0);
};