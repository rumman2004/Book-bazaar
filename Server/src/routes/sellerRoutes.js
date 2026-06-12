import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  getMyBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getMyOrders,
  updateOrderStatus,
  getRevenue,
  getDashboard,
} from '../controllers/sellerController.js';
import { replyToReview, getSellerReviews } from '../controllers/reviewController.js';
import { verifyToken, isSeller } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// All seller routes require authentication and seller role
router.use(verifyToken, isSeller);

// ── Dashboard ──
router.get('/dashboard', getDashboard);

// ── Profile ──
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/profile/avatar', deleteAvatar);
router.put('/profile/password', changePassword);

// ── Books ──
router.get('/books', getMyBooks);
router.get('/books/:id', getBookById);
router.post('/books', upload.single('image'), addBook);
router.put('/books/:id', upload.single('image'), updateBook);
router.delete('/books/:id', deleteBook);

// ── Orders ──
router.get('/orders', getMyOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// ── Revenue ──
router.get('/revenue', getRevenue);

// ── Reviews ──
router.get('/reviews', getSellerReviews);
router.put('/reviews/:id/response', replyToReview);

export default router;