import { query } from '../config/db.js';
import { buildCategoryTree, getPagination } from '../utils/helper.js';

// ─── DASHBOARD ─────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 */
export const getDashboard = async (req, res, next) => {
  try {
    const [users, sellers, buyers, books, orders, completedOrders, revenue] = await Promise.all([
      query('SELECT COUNT(*) FROM users WHERE role != $1', ['admin']),
      query('SELECT COUNT(*) FROM users WHERE role = $1', ['seller']),
      query('SELECT COUNT(*) FROM users WHERE role = $1', ['buyer']),
      query('SELECT COUNT(*) FROM books WHERE is_active = TRUE'),
      query('SELECT COUNT(*) FROM orders'),
      query("SELECT COUNT(*) FROM orders WHERE status = 'delivered'"),
      query(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'cancelled'`),
    ]);

    const pendingVerification = await query(
      'SELECT COUNT(*) FROM seller_profiles WHERE is_verified = FALSE'
    );

    const recentOrders = await query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, bp.full_name AS buyer_name
       FROM orders o
       LEFT JOIN buyer_profiles bp ON o.buyer_id = bp.user_id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    const salesData = await query(
      `SELECT 
        TO_CHAR(series.date, 'Mon DD') as date, 
        COUNT(o.id) as orders, 
        COALESCE(SUM(o.total_amount), 0) as revenue
       FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) AS series(date)
       LEFT JOIN orders o ON DATE(o.created_at) = series.date::date AND o.status != 'cancelled'
       GROUP BY series.date
       ORDER BY series.date ASC`
    );

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_users: parseInt(users.rows[0].count),
          total_sellers: parseInt(sellers.rows[0].count),
          total_buyers: parseInt(buyers.rows[0].count),
          total_books: parseInt(books.rows[0].count),
          total_orders: parseInt(orders.rows[0].count),
          completed_orders: parseInt(completedOrders.rows[0].count),
          total_revenue: parseFloat(revenue.rows[0].total),
          pending_verifications: parseInt(pendingVerification.rows[0].count),
        },
        recent_orders: recentOrders.rows,
        sales_data: salesData.rows.map(row => ({
          ...row,
          orders: parseInt(row.orders),
          revenue: parseFloat(row.revenue)
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── USER MANAGEMENT ───────────────────────────────────────

/**
 * GET /api/admin/users
 * Get all users with pagination.
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { role, search } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(role);
    }

    if (search) {
      conditions.push(`u.email ILIKE $${paramIndex++}`);
      params.push(`%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT 
        u.id, u.email, u.role, u.is_active, u.created_at,
        CASE 
          WHEN u.role = 'buyer' THEN bp.full_name
          WHEN u.role = 'seller' THEN sp.store_name
          ELSE 'Admin'
        END AS display_name,
        sp.is_verified AS seller_verified
      FROM users u
      LEFT JOIN buyer_profiles bp ON u.id = bp.user_id AND u.role = 'buyer'
      LEFT JOIN seller_profiles sp ON u.id = sp.user_id AND u.role = 'seller'
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
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
 * GET /api/admin/buyers
 */
export const getAllBuyers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);

    const countResult = await query("SELECT COUNT(*) FROM users WHERE role = 'buyer'");
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT 
        u.id, u.email, u.is_active, u.created_at,
        bp.full_name, bp.phone, bp.avatar_url, bp.default_shipping_address,
        (SELECT COUNT(*) FROM orders WHERE buyer_id = u.id) AS order_count
      FROM users u
      JOIN buyer_profiles bp ON u.id = bp.user_id
      WHERE u.role = 'buyer'
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
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
 * GET /api/admin/sellers
 */
export const getAllSellers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { verified } = req.query;

    let conditions = ["u.role = 'seller'"];
    let params = [];
    let paramIndex = 1;

    if (verified !== undefined) {
      conditions.push(`sp.is_verified = $${paramIndex++}`);
      params.push(verified === 'true');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM users u JOIN seller_profiles sp ON u.id = sp.user_id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT 
        u.id, u.email, u.is_active, u.created_at,
        sp.store_name, sp.contact_person, sp.phone, sp.business_address,
        sp.gstin, sp.is_verified, sp.avatar_url,
        (SELECT COUNT(*) FROM books WHERE seller_id = u.id AND is_active = TRUE) AS book_count
      FROM users u
      JOIN seller_profiles sp ON u.id = sp.user_id
      ${whereClause}
      ORDER BY sp.is_verified ASC, u.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
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
 * PUT /api/admin/sellers/:id/verify
 * Approve or revoke seller verification.
 */
export const verifySeller = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    if (is_verified === undefined) {
      return res.status(400).json({ success: false, message: 'is_verified field is required.' });
    }

    const result = await query(
      'UPDATE seller_profiles SET is_verified = $1 WHERE user_id = $2 RETURNING user_id, store_name, is_verified',
      [is_verified, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    const action = is_verified ? 'verified' : 'unverified';
    return res.status(200).json({
      success: true,
      message: `Seller has been ${action}.`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Activate or deactivate a user account.
 */
export const setUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({ success: false, message: 'is_active field is required.' });
    }

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    const result = await query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, email, role, is_active',
      [is_active, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const action = is_active ? 'activated' : 'deactivated';
    return res.status(200).json({
      success: true,
      message: `User account has been ${action}.`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─── CATEGORIES ────────────────────────────────────────────

/**
 * GET /api/admin/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        c.id, c.name, c.description, c.parent_id,
        parent.name AS parent_name,
        (SELECT COUNT(*) FROM book_categories bc WHERE bc.category_id = c.id) AS book_count
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      ORDER BY c.parent_id ASC NULLS FIRST, c.name ASC`
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/categories
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    // Validate parent exists if provided
    if (parent_id) {
      const parentCheck = await query('SELECT id FROM categories WHERE id = $1', [parent_id]);
      if (!parentCheck.rows[0]) {
        return res.status(400).json({ success: false, message: 'Parent category not found.' });
      }
    }

    const result = await query(
      'INSERT INTO categories (name, description, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, parent_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/categories/:id
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id } = req.body;

    // Prevent self-referencing
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({ success: false, message: 'A category cannot be its own parent.' });
    }

    const result = await query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        parent_id = $3
       WHERE id = $4
       RETURNING *`,
      [name || null, description || null, parent_id || null, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if any books use this category
    const bookCheck = await query(
      'SELECT COUNT(*) FROM book_categories WHERE category_id = $1',
      [id]
    );

    if (parseInt(bookCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${bookCheck.rows[0].count} book(s) are assigned to this category.`,
      });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── PRODUCTS (Admin view) ─────────────────────────────────

/**
 * GET /api/admin/products
 * View all books on the platform.
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { search, is_active } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(b.title ILIKE $${paramIndex} OR b.author ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (is_active !== undefined && is_active !== '') {
      conditions.push(`b.is_active = $${paramIndex++}`);
      params.push(is_active === 'true');
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) FROM books b ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT 
        b.id, b.title, b.author, b.price, b.stock_quantity, b.condition,
        b.is_active, b.image_url, b.created_at,
        sp.store_name, sp.is_verified AS seller_verified
      FROM books b
      LEFT JOIN seller_profiles sp ON b.seller_id = sp.user_id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
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
 * GET /api/admin/orders
 * View all orders on the platform.
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { status } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`o.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) FROM orders o ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT 
        o.id, o.total_amount, o.status, o.shipping_address, o.created_at,
        bp.full_name AS buyer_name,
        u.email AS buyer_email,
        COUNT(oi.id) AS item_count
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      LEFT JOIN buyer_profiles bp ON o.buyer_id = bp.user_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, bp.full_name, u.email
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
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
 * GET /api/admin/activity
 * View system-wide activity logs
 */
export const getActivityLogs = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { type } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (type) {
      conditions.push(`al.type = $${paramIndex++}`);
      params.push(type);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) FROM activity_logs al ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT 
        al.id, al.type, al.action, al.details, al.created_at,
        u.email as user_email, u.role as user_role,
        COALESCE(bp.full_name, sp.store_name) as user_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       LEFT JOIN buyer_profiles bp ON u.id = bp.user_id AND u.role = 'buyer'
       LEFT JOIN seller_profiles sp ON u.id = sp.user_id AND u.role = 'seller'
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
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
 * GET /api/admin/leaderboard
 * Fetch aggregated data for the admin leaderboard.
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    // 1. Top Sellers
    const topSellersQuery = await query(`
      SELECT 
        u.id AS seller_id,
        sp.store_name,
        sp.avatar_url,
        COALESCE(SUM(oi.quantity), 0) AS total_books_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS total_revenue
      FROM users u
      JOIN seller_profiles sp ON u.id = sp.user_id
      LEFT JOIN order_items oi ON u.id = oi.seller_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      WHERE u.role = 'seller' AND u.is_active = true
      GROUP BY u.id, sp.store_name, sp.avatar_url
      ORDER BY total_books_sold DESC, total_revenue DESC
      LIMIT 20
    `);

    // 2. Top Books
    const topBooksQuery = await query(`
      SELECT 
        b.id AS book_id,
        b.title,
        b.author,
        b.image_url,
        sp.store_name,
        COALESCE(SUM(oi.quantity), 0) AS total_sold
      FROM books b
      JOIN seller_profiles sp ON b.seller_id = sp.user_id
      LEFT JOIN order_items oi ON b.id = oi.book_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      GROUP BY b.id, b.title, b.author, b.image_url, sp.store_name
      HAVING COALESCE(SUM(oi.quantity), 0) > 0
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      data: {
        topSellers: topSellersQuery.rows,
        topBooks: topBooksQuery.rows
      }
    });
  } catch (error) {
    next(error);
  }
};