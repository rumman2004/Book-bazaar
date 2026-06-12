import { logActivity } from '../utils/activityLogger.js';

/**
 * Centralized error handling middleware.
 * Catches errors passed via next(error) from any route.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('🔴 Error:', err.stack || err.message);

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: err.errors,
    });
  }

  // PostgreSQL unique violation (e.g., duplicate email)
  if (err.code === '23505') {
    const detail = err.detail || '';
    let message = 'A record with this value already exists.';
    if (detail.includes('email')) message = 'This email is already registered.';
    else if (detail.includes('store_name')) message = 'This store name is already taken.';
    else if (detail.includes('gstin')) message = 'This GSTIN is already registered.';
    return res.status(409).json({ success: false, message });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist.',
    });
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Data validation failed (check constraint).',
    });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum is 5MB.',
    });
  }

  // JWT errors (should be caught in middleware, but just in case)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authentication failed.' });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred.'
    : err.message || 'An internal server error occurred.';

  if (statusCode >= 500) {
    // Log unexpected 500 errors
    logActivity({
      type: 'error',
      userId: req.user ? req.user.id : null,
      action: 'System Error',
      details: `${req.method} ${req.originalUrl} - ${err.message}`
    });
  }

  res.status(statusCode).json({ success: false, message });
};

/**
 * 404 handler for unknown routes.
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
};