import bcrypt from 'bcryptjs';
import { getClient, query } from '../config/db.js';
import { logActivity } from '../utils/activityLogger.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { extractCloudinaryPublicId, getPagination } from '../utils/helper.js';

// ─── PROFILE ──────────────────────────────────────────────

/**
 * GET /api/buyer/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT user_id, full_name, phone, avatar_url, default_shipping_address FROM buyer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/buyer/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, default_shipping_address } = req.body;

    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    const result = await query(
      `UPDATE buyer_profiles 
       SET full_name = $1, phone = $2, default_shipping_address = $3
       WHERE user_id = $4
       RETURNING user_id, full_name, phone, avatar_url, default_shipping_address`,
      [full_name, phone || null, default_shipping_address || null, req.user.id]
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
 * PUT /api/buyer/profile/avatar
 * Upload or replace the buyer's avatar image.
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    // Delete old avatar from Cloudinary if it exists
    const existing = await query('SELECT avatar_url FROM buyer_profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows[0]?.avatar_url) {
      const publicId = extractCloudinaryPublicId(existing.rows[0].avatar_url);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    // Upload new avatar
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'bibliobazar/avatars');
    const avatar_url = uploadResult.secure_url;

    const result = await query(
      `UPDATE buyer_profiles SET avatar_url = $1 WHERE user_id = $2
       RETURNING user_id, full_name, phone, avatar_url, default_shipping_address`,
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
 * DELETE /api/buyer/profile/avatar
 * Remove the buyer's avatar image.
 */
export const deleteAvatar = async (req, res, next) => {
  try {
    const existing = await query('SELECT avatar_url FROM buyer_profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows[0]?.avatar_url) {
      const publicId = extractCloudinaryPublicId(existing.rows[0].avatar_url);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    const result = await query(
      `UPDATE buyer_profiles SET avatar_url = NULL WHERE user_id = $1
       RETURNING user_id, full_name, phone, avatar_url, default_shipping_address`,
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
 * PUT /api/buyer/profile/password
 * Change the buyer's password.
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

// ─── CART ──────────────────────────────────────────────────

/**
 * GET /api/buyer/cart
 */
export const getCart = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        ci.id, ci.quantity,
        b.id AS book_id, b.title, b.author, b.price, b.image_url, 
        b.stock_quantity, b.condition, b.is_active,
        sp.store_name,
        (ci.quantity * b.price) AS subtotal
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      LEFT JOIN seller_profiles sp ON b.seller_id = sp.user_id
      WHERE ci.buyer_id = $1
      ORDER BY ci.id ASC`,
      [req.user.id]
    );

    const cartTotal = result.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    return res.status(200).json({
      success: true,
      data: result.rows,
      cart_total: cartTotal.toFixed(2),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/buyer/cart
 * Add an item to cart or increment quantity.
 */
export const addToCart = async (req, res, next) => {
  try {
    const { book_id, quantity = 1 } = req.body;

    if (!book_id) {
      return res.status(400).json({ success: false, message: 'book_id is required.' });
    }

    // Verify book exists and is in stock
    const bookResult = await query(
      'SELECT id, stock_quantity, is_active, seller_id FROM books WHERE id = $1',
      [book_id]
    );

    if (!bookResult.rows[0] || !bookResult.rows[0].is_active) {
      return res.status(404).json({ success: false, message: 'Book not found or unavailable.' });
    }

    // Prevent buyers from adding their own books (if seller is also a buyer somehow)
    const book = bookResult.rows[0];
    if (book.stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available.' });
    }

    // Upsert: if item already in cart, increment quantity
    const result = await query(
      `INSERT INTO cart_items (buyer_id, book_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (buyer_id, book_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, book_id, quantity]
    );

    // Check if new quantity exceeds stock
    if (result.rows[0].quantity > book.stock_quantity) {
      // Clamp to stock
      await query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [book.stock_quantity, result.rows[0].id]
      );
      return res.status(200).json({
        success: true,
        message: `Quantity clamped to available stock (${book.stock_quantity}).`,
        data: { ...result.rows[0], quantity: book.stock_quantity },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/buyer/cart/:id
 * Update quantity of a cart item.
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    // Verify the cart item belongs to this buyer
    const cartResult = await query(
      'SELECT ci.*, b.stock_quantity FROM cart_items ci JOIN books b ON ci.book_id = b.id WHERE ci.id = $1 AND ci.buyer_id = $2',
      [id, req.user.id]
    );

    if (!cartResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const cartItem = cartResult.rows[0];
    if (quantity > cartItem.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.stock_quantity} units available.`,
      });
    }

    const result = await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND buyer_id = $3 RETURNING *',
      [quantity, id, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Cart updated.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/buyer/cart/:id
 * Remove an item from cart.
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 AND buyer_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    return res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/buyer/cart
 * Clear the entire cart.
 */
export const clearCart = async (req, res, next) => {
  try {
    await query('DELETE FROM cart_items WHERE buyer_id = $1', [req.user.id]);
    return res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};

// ─── ORDERS ────────────────────────────────────────────────

/**
 * POST /api/buyer/orders/checkout
 * Create an order from the current cart. Uses a transaction.
 */
export const checkout = async (req, res, next) => {
  const client = await getClient();
  try {
    const { shipping_address, coupon_code } = req.body;

    if (!shipping_address) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    await client.query('BEGIN');

    // 1. Fetch cart items with current book prices
    const cartResult = await client.query(
      `SELECT 
        ci.id AS cart_item_id,
        ci.book_id,
        ci.quantity,
        b.price,
        b.stock_quantity,
        b.seller_id,
        b.is_active,
        b.title
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      WHERE ci.buyer_id = $1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const cartItems = cartResult.rows;

    // 2. Validate stock for all items
    for (const item of cartItems) {
      if (!item.is_active) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `"${item.title}" is no longer available.`,
        });
      }
      if (item.quantity > item.stock_quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Only ${item.stock_quantity} unit(s) of "${item.title}" available.`,
        });
      }
    }

    // 3. Calculate total using CURRENT prices from books table
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    // 4. Validate Coupon
    let discountAmount = 0;
    let couponId = null;

    if (coupon_code) {
      const couponRes = await client.query('SELECT * FROM coupons WHERE code = $1', [coupon_code.toUpperCase()]);
      const coupon = couponRes.rows[0];
      
      if (!coupon || !coupon.is_active) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Invalid or inactive coupon code.' });
      }
      
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'This coupon has expired.' });
      }

      discountAmount = parseFloat(coupon.discount_amount);
      couponId = coupon.id;
    }

    let finalTotal = cartTotal - discountAmount;
    if (finalTotal < 0) finalTotal = 0;

    // 5. Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (buyer_id, total_amount, shipping_address, status, payment_method, coupon_id, discount_amount)
       VALUES ($1, $2, $3, 'pending', 'cod', $4, $5)
       RETURNING id`,
      [req.user.id, finalTotal.toFixed(2), shipping_address, couponId, discountAmount.toFixed(2)]
    );
    const orderId = orderResult.rows[0].id;

    // 6. Insert order_items and decrement stock
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (order_id, book_id, seller_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.book_id, item.seller_id, item.quantity, item.price]
      );

      // Decrement stock
      await client.query(
        'UPDATE books SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.book_id]
      );
    }

    // 7. Clear the cart
    await client.query('DELETE FROM cart_items WHERE buyer_id = $1', [req.user.id]);

    await client.query('COMMIT');

    // Log Activity asynchronously (don't block the response)
    logActivity({
      type: 'order',
      userId: req.user.id,
      action: 'Order Placed',
      details: `Order #${orderId} placed for ₹${finalTotal.toFixed(2)}.`
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        order_id: orderId,
        cart_total: cartTotal.toFixed(2),
        discount_amount: discountAmount.toFixed(2),
        final_total: finalTotal.toFixed(2),
        status: 'pending',
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * GET /api/buyer/orders
 * Get order history for buyer.
 */
export const getOrders = async (req, res, next) => {
  try {
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
            'price_at_purchase', oi.price_at_purchase
          ) ORDER BY oi.id
        ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN books b ON oi.book_id = b.id
      LEFT JOIN seller_profiles sp ON oi.seller_id = sp.user_id
      WHERE o.buyer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/buyer/orders/:id
 * Get a single order detail.
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
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
            'price_at_purchase', oi.price_at_purchase
          )
        ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN books b ON oi.book_id = b.id
      LEFT JOIN seller_profiles sp ON oi.seller_id = sp.user_id
      WHERE o.id = $1 AND o.buyer_id = $2
      GROUP BY o.id`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};