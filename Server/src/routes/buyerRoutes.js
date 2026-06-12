import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getOrders,
  getOrderById,
} from '../controllers/buyerController.js';
import { createReview } from '../controllers/reviewController.js';
import { validateCoupon } from '../controllers/couponController.js';
import { verifyToken, isBuyer } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// All buyer routes require authentication and buyer role
router.use(verifyToken, isBuyer);

// ── Profile ──
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/profile/avatar', deleteAvatar);
router.put('/profile/password', changePassword);

// ── Cart ──
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:id', updateCartItem);
router.delete('/cart/:id', removeFromCart);
router.delete('/cart', clearCart);

// ── Orders ──
router.post('/orders/checkout', checkout);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);

// ── Reviews ──
router.post('/reviews', upload.array('images', 5), createReview);

// ── Coupons ──
router.post('/coupons/validate', validateCoupon);

export default router;