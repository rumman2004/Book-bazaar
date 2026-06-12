/**
 * Build a tree structure from flat categories array.
 * @param {Array} categories - Flat array of category objects with id and parent_id
 * @returns {Array} Nested tree structure
 */
export const buildCategoryTree = (categories) => {
  const map = {};
  const roots = [];

  categories.forEach((cat) => {
    map[cat.id] = { ...cat, children: [] };
  });

  categories.forEach((cat) => {
    if (cat.parent_id && map[cat.parent_id]) {
      map[cat.parent_id].children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });

  return roots;
};

/**
 * Extract Cloudinary public_id from a full URL
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {string|null} public_id or null
 */
export const extractCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  try {
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Skip version segment (v1234567890) if present
    const afterUpload = parts.slice(uploadIndex + 1);
    if (afterUpload[0] && afterUpload[0].startsWith('v')) {
      afterUpload.shift();
    }
    const publicIdWithExtension = afterUpload.join('/');
    return publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension
  } catch {
    return null;
  }
};

/**
 * Create a standard API success response
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({ success: true, message, ...data });
};

/**
 * Calculate pagination metadata
 */
export const getPagination = (page, limit) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 12));
  const offset = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, offset };
};