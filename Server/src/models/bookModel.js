import { query } from '../config/db.js';

export const BookModel = {
  /**
   * Find a book by ID with categories and seller info
   */
  findById: async (bookId) => {
    const bookResult = await query(
      `SELECT 
        b.*,
        sp.store_name,
        sp.is_verified AS seller_verified,
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
      WHERE b.id = $1
      GROUP BY b.id, sp.store_name, sp.is_verified`,
      [bookId]
    );
    return bookResult.rows[0] || null;
  },

  /**
   * Get all books for a specific seller
   */
  findBySeller: async (sellerId, limit = 50, offset = 0) => {
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
      [sellerId, limit, offset]
    );
    return result.rows;
  },

  /**
   * Check if a seller owns a specific book
   */
  isOwnedBySeller: async (bookId, sellerId) => {
    const result = await query(
      'SELECT id FROM books WHERE id = $1 AND seller_id = $2',
      [bookId, sellerId]
    );
    return result.rows.length > 0;
  },
};