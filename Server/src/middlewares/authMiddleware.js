import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * Verifies the JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB to ensure they still exist and are active
    const result = await query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Token is invalid. User not found.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(error);
  }
};

/**
 * Ensures the authenticated user is a Buyer.
 * Must be used AFTER verifyToken.
 */
export const isBuyer = (req, res, next) => {
  if (req.user && req.user.role === 'buyer') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Buyer role required.',
  });
};

/**
 * Ensures the authenticated user is a Seller.
 * Must be used AFTER verifyToken.
 */
export const isSeller = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Seller role required.',
  });
};

/**
 * Ensures the authenticated user is an Admin.
 * Must be used AFTER verifyToken.
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin role required.',
  });
};

/**
 * Allows access if the user is either a Seller or an Admin.
 */
export const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Seller or Admin role required.',
  });
};