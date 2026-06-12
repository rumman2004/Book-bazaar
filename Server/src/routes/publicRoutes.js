import { Router } from 'express';
import {
  getBooks,
  getBookById,
  getCategories,
  getFeaturedBooks,
  getBestSellers,
} from '../controllers/publicController.js';
import { getBookReviews } from '../controllers/reviewController.js';

const router = Router();

// GET /api/public/books
router.get('/books', getBooks);

// GET /api/public/books/featured  (must be before /:id)
router.get('/books/featured', getFeaturedBooks);

// GET /api/public/books/bestsellers
router.get('/books/bestsellers', getBestSellers);

// GET /api/public/books/:id
router.get('/books/:id', getBookById);

// GET /api/public/books/:id/reviews
router.get('/books/:id/reviews', getBookReviews);

// GET /api/public/categories
router.get('/categories', getCategories);

export default router;