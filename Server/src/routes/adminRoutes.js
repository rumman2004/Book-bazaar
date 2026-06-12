import { Router } from 'express';
import {
  getDashboard,
  getAllUsers,
  getAllBuyers,
  getAllSellers,
  verifySeller,
  setUserStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllProducts,
  getAllOrders,
  getActivityLogs,
  getLeaderboard,
} from '../controllers/adminController.js';
import { getAllCoupons, createCoupon, toggleCouponStatus } from '../controllers/couponController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// ── Dashboard ──
router.get('/dashboard', getDashboard);
router.get('/activity', getActivityLogs);
router.get('/leaderboard', getLeaderboard);

// ── Users ──
router.get('/users', getAllUsers);
router.put('/users/:id/status', setUserStatus);

// ── Buyers ──
router.get('/buyers', getAllBuyers);

// ── Sellers ──
router.get('/sellers', getAllSellers);
router.put('/sellers/:id/verify', verifySeller);

// ── Categories ──
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ── Products ──
router.get('/products', getAllProducts);

// ── Orders ──
router.get('/orders', getAllOrders);

// ── Coupons ──
router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id/toggle', toggleCouponStatus);

export default router;