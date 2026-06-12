import { query } from '../config/db.js';

/**
 * Admin: Get all coupons
 * GET /api/admin/coupons
 */
export const getAllCoupons = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM coupons ORDER BY id DESC');
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create a new coupon
 * POST /api/admin/coupons
 */
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discount_amount, valid_until } = req.body;

    if (!code || !discount_amount) {
      return res.status(400).json({ success: false, message: 'Code and discount amount are required.' });
    }

    const result = await query(
      `INSERT INTO coupons (code, discount_amount, valid_until) 
       VALUES ($1, $2, $3) RETURNING *`,
      [code.toUpperCase(), discount_amount, valid_until || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }
    next(error);
  }
};

/**
 * Admin: Toggle a coupon's active status
 * PUT /api/admin/coupons/:id/toggle
 */
export const toggleCouponStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First, get the current status
    const current = await query('SELECT is_active FROM coupons WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    
    const newStatus = !current.rows[0].is_active;
    
    await query('UPDATE coupons SET is_active = $1 WHERE id = $2', [newStatus, id]);
    
    return res.status(200).json({ 
      success: true, 
      message: `Coupon ${newStatus ? 'activated' : 'deactivated'} successfully.` 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Buyer: Validate a coupon at checkout
 * POST /api/buyer/coupons/validate
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const result = await query('SELECT * FROM coupons WHERE code = $1', [code.toUpperCase()]);
    const coupon = result.rows[0];

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }

    if (!coupon.is_active) {
      return res.status(400).json({ success: false, message: 'This coupon is no longer active.' });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        id: coupon.id,
        code: coupon.code,
        discount_amount: coupon.discount_amount,
      },
    });
  } catch (error) {
    next(error);
  }
};
