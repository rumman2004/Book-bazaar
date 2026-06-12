import { query } from '../config/db.js';

export const OrderModel = {
  /**
   * Get all orders for a buyer with items
   */
  findByBuyer: async (buyerId) => {
    const result = await query(
      `SELECT 
        o.id, o.total_amount, o.shipping_address, o.status, o.created_at,
        json_agg(
          json_build_object(
            'id', oi.id,
            'book_id', oi.book_id,
            'book_title', b.title,
            'book_author', b.author,
            'book_image', b.image_url,
            'store_name', sp.store_name,
            'quantity', oi.quantity,
            'price_at_purchase', oi.price_at_purchase,
            'seller_id', oi.seller_id
          )
        ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN books b ON oi.book_id = b.id
      LEFT JOIN seller_profiles sp ON oi.seller_id = sp.user_id
      WHERE o.buyer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [buyerId]
    );
    return result.rows;
  },

  /**
   * Get all items sold by a specific seller
   */
  findBySeller: async (sellerId) => {
    const result = await query(
      `SELECT 
        oi.id AS order_item_id,
        o.id AS order_id,
        o.status AS order_status,
        o.created_at AS order_date,
        o.shipping_address,
        b.title AS book_title,
        b.image_url AS book_image,
        oi.quantity,
        oi.price_at_purchase,
        bp.full_name AS buyer_name
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN books b ON oi.book_id = b.id
      LEFT JOIN buyer_profiles bp ON o.buyer_id = bp.user_id
      WHERE oi.seller_id = $1
      ORDER BY o.created_at DESC`,
      [sellerId]
    );
    return result.rows;
  },

  /**
   * Find a single order by ID
   */
  findById: async (orderId) => {
    const result = await query(
      `SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'book_id', oi.book_id,
            'book_title', b.title,
            'quantity', oi.quantity,
            'price_at_purchase', oi.price_at_purchase,
            'seller_id', oi.seller_id
          )
        ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN books b ON oi.book_id = b.id
      WHERE o.id = $1
      GROUP BY o.id`,
      [orderId]
    );
    return result.rows[0] || null;
  },
};