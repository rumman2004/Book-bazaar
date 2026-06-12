import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { extractCloudinaryPublicId, getPagination } from '../utils/helper.js';

// ─── PROFILE ──────────────────────────────────────────────

/**
 * GET /api/seller/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        sp.*, u.email, u.created_at AS member_since
       FROM seller_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = $1`,
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Seller profile not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/seller/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { store_name, contact_person, phone, business_address, gstin, bank_account_details } = req.body;

    if (!store_name || !contact_person || !business_address) {
      return res.status(400).json({
        success: false,
        message: 'Store name, contact person, and business address are required.',
      });
    }

    const result = await query(
      `UPDATE seller_profiles
       SET store_name = $1, contact_person = $2, phone = $3, 
           business_address = $4, gstin = $5, bank_account_details = $6
       WHERE user_id = $7
       RETURNING *`,
      [store_name, contact_person, phone || null, business_address, gstin || null, bank_account_details || null, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/seller/profile/avatar
 * Upload or replace the seller's avatar image.
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    // Delete old avatar from Cloudinary if it exists
    const existing = await query('SELECT avatar_url FROM seller_profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows[0]?.avatar_url) {
      const publicId = extractCloudinaryPublicId(existing.rows[0].avatar_url);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    // Upload new avatar
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'bibliobazar/avatars');
    const avatar_url = uploadResult.secure_url;

    const result = await query(
      `UPDATE seller_profiles SET avatar_url = $1 WHERE user_id = $2 RETURNING *`,
      [avatar_url, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/seller/profile/avatar
 * Remove the seller's avatar image.
 */
export const deleteAvatar = async (req, res, next) => {
  try {
    const existing = await query('SELECT avatar_url FROM seller_profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows[0]?.avatar_url) {
      const publicId = extractCloudinaryPublicId(existing.rows[0].avatar_url);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    const result = await query(
      `UPDATE seller_profiles SET avatar_url = NULL WHERE user_id = $1 RETURNING *`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Avatar removed successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/seller/profile/password
 * Change the seller's password.
 */
export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    // Get current password hash
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(new_password, salt);

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── BOOKS ────────────────────────────────────────────────

/**
 * GET /api/seller/books
 * Get all books listed by this seller.
 */
export const getMyBooks = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);

    const countResult = await query(
      'SELECT COUNT(*) FROM books WHERE seller_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT 
        b.*,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.name)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories
      FROM books b
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
      WHERE b.seller_id = $1
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/seller/books/:id
 */
export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT 
        b.*,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.name)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories
      FROM books b
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
      WHERE b.id = $1 AND b.seller_id = $2
      GROUP BY b.id`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/seller/books
 * Add a new book listing with optional image upload.
 */
export const addBook = async (req, res, next) => {
  try {
    const {
      title, author, isbn, description, price,
      condition = 'new', stock_quantity = 0,
      category_ids, // JSON array string or comma-separated
    } = req.body;

    if (!title || !author || !price) {
      return res.status(400).json({ success: false, message: 'Title, author, and price are required.' });
    }

    // Upload image to Cloudinary if provided
    let image_url = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'bibliobazar/books');
      image_url = uploadResult.secure_url;
    }

    // Insert book
    const bookResult = await query(
      `INSERT INTO books 
        (seller_id, title, author, isbn, description, price, condition, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id, title, author, isbn || null, description || null,
        parseFloat(price), condition, parseInt(stock_quantity), image_url,
      ]
    );

    const newBook = bookResult.rows[0];

    // Handle categories (Many-to-Many)
    let categoryIdsArray = [];
    if (category_ids) {
      try {
        categoryIdsArray = typeof category_ids === 'string'
          ? JSON.parse(category_ids)
          : category_ids;
      } catch {
        categoryIdsArray = String(category_ids).split(',').map(Number).filter(Boolean);
      }
    }

    for (const catId of categoryIdsArray) {
      await query(
        'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [newBook.id, catId]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Book listed successfully.',
      data: newBook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/seller/books/:id
 * Update a book listing.
 */
export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title, author, isbn, description, price,
      condition, stock_quantity, is_active, category_ids,
    } = req.body;

    // Verify ownership
    const existingBook = await query(
      'SELECT * FROM books WHERE id = $1 AND seller_id = $2',
      [id, req.user.id]
    );

    if (!existingBook.rows[0]) {
      return res.status(404).json({ success: false, message: 'Book not found or access denied.' });
    }

    const book = existingBook.rows[0];

    // Handle new image upload
    let image_url = book.image_url;
    if (req.file) {
      // Delete old image if exists
      if (book.image_url) {
        const publicId = extractCloudinaryPublicId(book.image_url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'bibliobazar/books');
      image_url = uploadResult.secure_url;
    }

    const updatedBook = await query(
      `UPDATE books SET
        title = COALESCE($1, title),
        author = COALESCE($2, author),
        isbn = COALESCE($3, isbn),
        description = COALESCE($4, description),
        price = COALESCE($5, price),
        condition = COALESCE($6, condition),
        stock_quantity = COALESCE($7, stock_quantity),
        is_active = COALESCE($8, is_active),
        image_url = $9,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND seller_id = $11
       RETURNING *`,
      [
        title || null, author || null, isbn || null, description || null,
        price ? parseFloat(price) : null,
        condition || null,
        stock_quantity !== undefined ? parseInt(stock_quantity) : null,
        is_active !== undefined ? is_active : null,
        image_url,
        id, req.user.id,
      ]
    );

    // Update categories if provided
    if (category_ids !== undefined) {
      // Remove all existing category associations
      await query('DELETE FROM book_categories WHERE book_id = $1', [id]);

      let categoryIdsArray = [];
      try {
        categoryIdsArray = typeof category_ids === 'string'
          ? JSON.parse(category_ids)
          : category_ids;
      } catch {
        categoryIdsArray = String(category_ids).split(',').map(Number).filter(Boolean);
      }

      for (const catId of categoryIdsArray) {
        await query(
          'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, catId]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      data: updatedBook.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/seller/books/:id
 * Delete a book listing (soft delete via is_active=false or hard delete).
 */
export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await query(
      'SELECT * FROM books WHERE id = $1 AND seller_id = $2',
      [id, req.user.id]
    );

    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: 'Book not found or access denied.' });
    }

    const book = existing.rows[0];

    // Check if the book has any associated order_items (use soft delete if so)
    const orderCheck = await query(
      'SELECT id FROM order_items WHERE book_id = $1 LIMIT 1',
      [id]
    );

    if (orderCheck.rows.length > 0) {
      // Soft delete to preserve order history
      await query(
        'UPDATE books SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return res.status(200).json({
        success: true,
        message: 'Book deactivated (has associated orders, so preserved for history).',
      });
    }

    // Hard delete — also remove image from Cloudinary
    if (book.image_url) {
      const publicId = extractCloudinaryPublicId(book.image_url);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    await query('DELETE FROM books WHERE id = $1', [id]);

    return res.status(200).json({ success: true, message: 'Book deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── ORDERS ────────────────────────────────────────────────

/**
 * GET /api/seller/orders
 * Get all items sold by this seller.
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    let conditions = ['oi.seller_id = $1'];
    let params = [req.user.id];

    if (status) {
      conditions.push(`o.status = $${params.length + 1}`);
      params.push(status);
    }

    const result = await query(
      `SELECT 
        oi.id AS order_item_id,
        o.id AS order_id,
        o.status AS order_status,
        o.created_at AS order_date,
        o.shipping_address,
        b.id AS book_id,
        b.title AS book_title,
        b.image_url AS book_image,
        oi.quantity,
        oi.price_at_purchase,
        (oi.quantity * oi.price_at_purchase) AS item_total,
        bp.full_name AS buyer_name,
        bp.avatar_url AS buyer_avatar,
        bp.phone AS buyer_phone,
        u.email AS buyer_email
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN books b ON oi.book_id = b.id
      LEFT JOIN buyer_profiles bp ON o.buyer_id = bp.user_id
      LEFT JOIN users u ON o.buyer_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY o.created_at DESC`,
      params
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/seller/orders/:orderId/status
 * Update order status for seller (pending -> processing -> shipped).
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedTransitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
    };

    // Fetch order
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (!orderResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderResult.rows[0];

    // Verify this seller has items in this order
    const sellerItemCheck = await query(
      'SELECT id FROM order_items WHERE order_id = $1 AND seller_id = $2 LIMIT 1',
      [orderId, req.user.id]
    );

    if (!sellerItemCheck.rows[0]) {
      return res.status(403).json({ success: false, message: 'You have no items in this order.' });
    }

    const validNextStatuses = allowedTransitions[order.status] || [];
    if (!validNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${order.status}" to "${status}".`,
      });
    }

    const updatedOrder = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, orderId]
    );

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: updatedOrder.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/seller/revenue
 * Get revenue summary for the seller with date range filters.
 */
export const getRevenue = async (req, res, next) => {
  try {
    const { range = 'all' } = req.query; // '7d', 'month', 'year', 'all'
    let dateCondition = '';
    let params = [req.user.id];

    if (range === '7d') {
      dateCondition = `AND o.created_at >= NOW() - INTERVAL '7 days'`;
    } else if (range === 'month') {
      dateCondition = `AND o.created_at >= DATE_TRUNC('month', NOW())`;
    } else if (range === 'year') {
      dateCondition = `AND o.created_at >= DATE_TRUNC('year', NOW())`;
    }

    const totalResult = await query(
      `SELECT 
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS total_revenue,
        COUNT(DISTINCT o.id) AS total_orders,
        COUNT(oi.id) AS total_items_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.seller_id = $1 AND o.status != 'cancelled' ${dateCondition}`,
      params
    );

    const statusBreakdown = await query(
      `SELECT 
        o.status,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS revenue,
        COUNT(DISTINCT o.id) AS orders_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.seller_id = $1 ${dateCondition}
      GROUP BY o.status`,
      params
    );

    // Group by day for short ranges (7d/month), month for long ranges (year/all)
    let timeGroup = (range === '7d' || range === 'month') ? 'day' : 'month';
    const timeseries = await query(
      `SELECT 
        DATE_TRUNC('${timeGroup}', o.created_at) AS date,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.seller_id = $1 AND o.status != 'cancelled' ${dateCondition}
      GROUP BY date
      ORDER BY date ASC`,
      params
    );

    return res.status(200).json({
      success: true,
      data: {
        summary: totalResult.rows[0],
        statusBreakdown: statusBreakdown.rows,
        timeseries: timeseries.rows,
        range,
        timeGroup,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/seller/dashboard
 * Dashboard stats for the seller.
 */
export const getDashboard = async (req, res, next) => {
  try {
    const [
      booksCount,
      activeOrders,
      totalRevenue,
      lowStock,
      popularBooks,
      recentOrders,
      pendingOrders,
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM books WHERE seller_id = $1 AND is_active = TRUE', [req.user.id]),
      query(
        `SELECT COUNT(DISTINCT o.id) FROM orders o 
         JOIN order_items oi ON o.id = oi.order_id
         WHERE oi.seller_id = $1 AND o.status IN ('pending', 'processing', 'shipped')`,
        [req.user.id]
      ),
      query(
        `SELECT COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS total
         FROM order_items oi JOIN orders o ON oi.order_id = o.id
         WHERE oi.seller_id = $1 AND o.status != 'cancelled'`,
        [req.user.id]
      ),
      query(
        'SELECT id, title, stock_quantity FROM books WHERE seller_id = $1 AND stock_quantity <= 5 AND is_active = TRUE ORDER BY stock_quantity ASC LIMIT 5',
        [req.user.id]
      ),
      query(
        `SELECT b.id, b.title, b.image_url, COALESCE(SUM(oi.quantity), 0) AS total_sold
         FROM books b
         LEFT JOIN order_items oi ON b.id = oi.book_id
         LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
         WHERE b.seller_id = $1
         GROUP BY b.id
         ORDER BY total_sold DESC
         LIMIT 5`,
        [req.user.id]
      ),
      query(
        `SELECT oi.id AS order_item_id, o.id AS order_id, o.status, o.created_at,
                b.title AS book_title, oi.quantity, (oi.quantity * oi.price_at_purchase) AS item_total, bp.full_name AS buyer_name
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         JOIN books b ON oi.book_id = b.id
         LEFT JOIN buyer_profiles bp ON o.buyer_id = bp.user_id
         WHERE oi.seller_id = $1
         ORDER BY o.created_at DESC
         LIMIT 5`,
        [req.user.id]
      ),
      query(
        `SELECT oi.id AS order_item_id, o.id AS order_id, o.status, o.created_at,
                b.title AS book_title, oi.quantity, (oi.quantity * oi.price_at_purchase) AS item_total, bp.full_name AS buyer_name
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         JOIN books b ON oi.book_id = b.id
         LEFT JOIN buyer_profiles bp ON o.buyer_id = bp.user_id
         WHERE oi.seller_id = $1 AND o.status IN ('pending', 'processing')
         ORDER BY o.created_at DESC
         LIMIT 5`,
        [req.user.id]
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total_books: parseInt(booksCount.rows[0].count),
        active_orders: parseInt(activeOrders.rows[0].count),
        total_revenue: parseFloat(totalRevenue.rows[0].total),
        low_stock_books: lowStock.rows,
        popular_books: popularBooks.rows,
        recent_orders: recentOrders.rows,
        pending_orders: pendingOrders.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};