import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { UserModel } from '../models/userModel.js';
import { logActivity } from '../utils/activityLogger.js';

/**
 * POST /api/auth/register
 * Register a new buyer or seller.
 */
export const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role = 'buyer',
      // Buyer fields
      full_name,
      phone,
      // Seller fields
      store_name,
      contact_person,
      business_address,
      gstin,
      bank_account_details,
    } = req.body;

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'This email is already registered.' });
    }

    // Validate role
    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either buyer or seller.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await UserModel.create(email, passwordHash, role);

    // Create corresponding profile
    if (role === 'buyer') {
      if (!full_name) {
        return res.status(400).json({ success: false, message: 'Full name is required for buyer registration.' });
      }
      await query(
        'INSERT INTO buyer_profiles (user_id, full_name, phone) VALUES ($1, $2, $3)',
        [newUser.id, full_name, phone || null]
      );
    } else if (role === 'seller') {
      if (!store_name || !contact_person || !business_address) {
        return res.status(400).json({
          success: false,
          message: 'Store name, contact person, and business address are required for seller registration.',
        });
      }
      await query(
        `INSERT INTO seller_profiles 
          (user_id, store_name, contact_person, phone, business_address, gstin, bank_account_details) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newUser.id, store_name, contact_person, phone || null, business_address, gstin || null, bank_account_details || null]
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log Activity
    logActivity({
      type: 'auth',
      userId: newUser.id,
      action: 'User Registration',
      details: `Registered as a new ${role}.`
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login a user and return a JWT.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user by email (includes password_hash)
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Fetch profile
    const userWithProfile = await UserModel.findWithProfile(user.id);

    // Log Activity
    logActivity({
      type: 'auth',
      userId: user.id,
      action: 'User Login',
      details: 'Successful sign-in.'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: userWithProfile.id,
        email: userWithProfile.email,
        role: userWithProfile.role,
        profile: userWithProfile.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return current user info from the JWT.
 */
export const getMe = async (req, res, next) => {
  try {
    const userWithProfile = await UserModel.findWithProfile(req.user.id);
    if (!userWithProfile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userWithProfile.id,
        email: userWithProfile.email,
        role: userWithProfile.role,
        is_active: userWithProfile.is_active,
        created_at: userWithProfile.created_at,
        profile: userWithProfile.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};