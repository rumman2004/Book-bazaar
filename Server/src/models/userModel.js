import { query } from '../config/db.js';

export const UserModel = {
  /**
   * Find a user by email
   */
  findByEmail: async (email) => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  /**
   * Find a user by ID
   */
  findById: async (id) => {
    const result = await query(
      'SELECT id, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user
   */
  create: async (email, passwordHash, role = 'buyer') => {
    const result = await query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email, passwordHash, role]
    );
    return result.rows[0];
  },

  /**
   * Get user with their profile (buyer or seller)
   */
  findWithProfile: async (userId) => {
    // Try buyer profile first
    const userResult = await query(
      'SELECT id, email, role, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );
    if (!userResult.rows[0]) return null;

    const user = userResult.rows[0];

    if (user.role === 'buyer') {
      const profileResult = await query(
        'SELECT full_name, phone, avatar_url, default_shipping_address FROM buyer_profiles WHERE user_id = $1',
        [userId]
      );
      user.profile = profileResult.rows[0] || null;
    } else if (user.role === 'seller') {
      const profileResult = await query(
        'SELECT store_name, contact_person, phone, business_address, gstin, avatar_url, is_verified FROM seller_profiles WHERE user_id = $1',
        [userId]
      );
      user.profile = profileResult.rows[0] || null;
    }

    return user;
  },

  /**
   * Toggle user active status (admin action)
   */
  setActiveStatus: async (userId, isActive) => {
    const result = await query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, email, role, is_active',
      [isActive, userId]
    );
    return result.rows[0] || null;
  },
};