import { query } from '../config/db.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { logActivity } from '../utils/activityLogger.js';

/**
 * POST /api/buyer/reviews
 * Submit a new review for a book. Handles up to 5 images.
 */
export const createReview = async (req, res, next) => {
  try {
    const { book_id, rating, comment } = req.body;
    const buyer_id = req.user.id;

    if (!book_id || !rating) {
      return res.status(400).json({ success: false, message: 'Book ID and Rating are required.' });
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // VERIFIED PURCHASE CHECK
    // Ensure the buyer has an order item for this book
    const purchaseCheck = await query(
      `SELECT oi.id 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.buyer_id = $1 AND oi.book_id = $2
       LIMIT 1`,
      [buyer_id, book_id]
    );

    if (purchaseCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only review books you have purchased.',
      });
    }

    // Insert the review
    let reviewResult;
    try {
      reviewResult = await query(
        `INSERT INTO reviews (book_id, buyer_id, rating, comment)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [book_id, buyer_id, numericRating, comment || null]
      );
    } catch (err) {
      if (err.code === '23505') { // Unique violation
        return res.status(400).json({ success: false, message: 'You have already reviewed this book.' });
      }
      throw err;
    }

    const reviewId = reviewResult.rows[0].id;

    // Handle Image Uploads (Multer puts files in req.files)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.slice(0, 5).map((file) => 
        uploadToCloudinary(file.buffer, 'bibliobazar/reviews')
      );
      
      const uploadResults = await Promise.all(uploadPromises);

      // Insert image records
      for (const result of uploadResults) {
        await query(
          'INSERT INTO review_images (review_id, image_url) VALUES ($1, $2)',
          [reviewId, result.secure_url]
        );
      }
    }

    // Log Activity
    logActivity({
      type: 'review',
      userId: buyer_id,
      action: 'Review Posted',
      details: `Posted a ${numericRating}-star review for book #${book_id}.`
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      reviewId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/seller/reviews/:id/response
 * Seller responds to a review.
 */
export const replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params; // Review ID
    const { seller_response } = req.body;
    const seller_id = req.user.id;

    if (!seller_response) {
      return res.status(400).json({ success: false, message: 'Response text is required.' });
    }

    // Ensure the review belongs to a book owned by this seller
    const checkOwnership = await query(
      `SELECT r.id FROM reviews r
       JOIN books b ON r.book_id = b.id
       WHERE r.id = $1 AND b.seller_id = $2`,
      [id, seller_id]
    );

    if (checkOwnership.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await query(
      'UPDATE reviews SET seller_response = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [seller_response, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Response added successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/books/:id/reviews
 * Fetch all reviews for a book, including images and seller responses.
 */
export const getBookReviews = async (req, res, next) => {
  try {
    const { id } = req.params; // Book ID

    const result = await query(
      `SELECT 
         r.id, r.rating, r.comment, r.seller_response, r.created_at,
         u.id AS buyer_id, bp.full_name AS buyer_name, bp.avatar_url AS buyer_avatar,
         COALESCE(
           json_agg(ri.image_url) FILTER (WHERE ri.id IS NOT NULL),
           '[]'
         ) AS images
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
       LEFT JOIN review_images ri ON r.id = ri.review_id
       WHERE r.book_id = $1
       GROUP BY r.id, u.id, bp.full_name, bp.avatar_url
       ORDER BY r.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/seller/reviews
 * Fetch all reviews for books owned by the seller.
 */
export const getSellerReviews = async (req, res, next) => {
  try {
    const seller_id = req.user.id;

    const result = await query(
      `SELECT 
         r.id, r.rating, r.comment, r.seller_response, r.created_at,
         b.id AS book_id, b.title AS book_title, b.image_url AS book_image,
         u.id AS buyer_id, bp.full_name AS buyer_name, bp.avatar_url AS buyer_avatar,
         COALESCE(
           json_agg(ri.image_url) FILTER (WHERE ri.id IS NOT NULL),
           '[]'
         ) AS images
       FROM reviews r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.buyer_id = u.id
       LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
       LEFT JOIN review_images ri ON r.id = ri.review_id
       WHERE b.seller_id = $1
       GROUP BY r.id, b.id, u.id, bp.full_name, bp.avatar_url
       ORDER BY r.created_at DESC`,
      [seller_id]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
