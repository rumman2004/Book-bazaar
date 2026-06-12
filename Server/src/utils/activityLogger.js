import { query } from '../config/db.js';

/**
 * Logs an activity to the database asynchronously.
 * Does not throw errors to prevent breaking the main request cycle.
 * 
 * @param {Object} params
 * @param {'auth' | 'order' | 'review' | 'system' | 'error'} params.type - The type of activity
 * @param {number|null} params.userId - The ID of the user performing the action (optional)
 * @param {string} params.action - Short description of the action (e.g. 'User Login')
 * @param {string|Object} params.details - Detailed description or JSON object (optional)
 */
export const logActivity = async ({ type, userId = null, action, details = null }) => {
  try {
    const detailsText = typeof details === 'object' && details !== null 
      ? JSON.stringify(details) 
      : details;
      
    await query(
      `INSERT INTO activity_logs (type, user_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [type, userId, action, detailsText]
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
