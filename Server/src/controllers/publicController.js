import { query } from '../config/db.js';
import { buildCategoryTree, getPagination } from '../utils/helper.js';

/**
 * GET /api/public/books
 * List all active books with filters, search, and pagination.
 */
export const getBooks = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { search, category_id, min_price, max_price, condition, sort = 'newest' } = req.query;

    let conditions = ['b.is_active = TRUE', 'b.stock_quantity > 0'];
    let params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(b.title ILIKE $${paramIndex} OR b.author ILIKE $${paramIndex} OR b.isbn ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category_id) {
      conditions.push(`b.id IN (SELECT book_id FROM book_categories WHERE category_id = $${paramIndex})`);
      params.push(parseInt(category_id));
      paramIndex++;
    }

    if (min_price) {
      conditions.push(`b.price >= $${paramIndex}`);
      params.push(parseFloat(min_price));
      paramIndex++;
    }

    if (max_price) {
      conditions.push(`b.price <= $${paramIndex}`);
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    if (condition) {
      conditions.push(`b.condition = $${paramIndex}`);
      params.push(condition);
      paramIndex++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap = {
      newest: 'b.created_at DESC',
      oldest: 'b.created_at ASC',
      price_asc: 'b.price ASC',
      price_desc: 'b.price DESC',
      title_asc: 'b.title ASC',
    };
    const orderBy = sortMap[sort] || sortMap.newest;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(DISTINCT b.id) FROM books b ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get books
    const booksResult = await query(
      `SELECT 
        b.id, b.title, b.author, b.isbn, b.price, b.condition,
        b.stock_quantity, b.image_url, b.created_at,
        sp.store_name,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE book_id = b.id) AS average_rating,
        (SELECT COUNT(id) FROM reviews WHERE book_id = b.id) AS total_reviews,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.name)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories
      FROM books b
      LEFT JOIN seller_profiles sp ON b.seller_id = sp.user_id
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
      ${whereClause}
      GROUP BY b.id, sp.store_name
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: booksResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/books/:id
 * Get a single book's details.
 */
export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT 
        b.*,
        sp.store_name,
        sp.is_verified AS seller_verified,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE book_id = b.id) AS average_rating,
        (SELECT COUNT(id) FROM reviews WHERE book_id = b.id) AS total_reviews,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.name)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories
      FROM books b
      LEFT JOIN seller_profiles sp ON b.seller_id = sp.user_id
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
      WHERE b.id = $1 AND b.is_active = TRUE
      GROUP BY b.id, sp.store_name, sp.is_verified`,
      [id]
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
 * GET /api/public/categories
 * Get all categories as a nested tree.
 */
export const getCategories = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, description, parent_id FROM categories ORDER BY name'
    );
    const tree = buildCategoryTree(result.rows);
    return res.status(200).json({ success: true, data: tree });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/books/featured
 * Get featured books for the landing page (newest 8).
 */
export const getFeaturedBooks = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        b.id, b.title, b.author, b.price, b.condition, b.image_url, b.stock_quantity,
        sp.store_name
      FROM books b
      LEFT JOIN seller_profiles sp ON b.seller_id = sp.user_id
      WHERE b.is_active = TRUE AND b.stock_quantity > 0
      ORDER BY b.created_at DESC
      LIMIT 8`
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/books/bestsellers
 * Get bestselling books based on order_items quantity.
 */
export const getBestSellers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        b.id, b.title, b.author, b.price, b.condition, b.image_url,
        sp.store_name,
        SUM(oi.quantity) AS total_sold
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      LEFT JOIN seller_profiles sp ON b.seller_id = sp.user_id
      WHERE b.is_active = TRUE AND b.stock_quantity > 0
      GROUP BY b.id, sp.store_name
      ORDER BY total_sold DESC
      LIMIT 8`
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};