const Log = require('../models/Log');

/**
 * Log user/admin activity
 * @param {Object} options - Logging options
 * @param {ObjectId} options.userId - The user performing the action
 * @param {String} options.action - The action being performed (login, create, update, delete, etc.)
 * @param {String} options.entityType - Type of entity (User, Election, Candidate, etc.)
 * @param {String} options.entityId - ID of the entity being acted upon
 * @param {String} options.details - Description of what happened
 * @param {String} options.status - success or failure
 * @param {String} options.ipAddress - IP address of the request
 * @param {String} options.userAgent - User agent of the request
 * @param {String} options.errorMessage - Error message if status is failure
 */
const logActivity = async (options) => {
  try {
    const {
      userId,
      action,
      entityType,
      entityId = null,
      details,
      status = 'success',
      ipAddress = null,
      userAgent = null,
      errorMessage = null
    } = options;

    await Log.create({
      user: userId,
      action,
      entityType,
      entityId,
      details,
      status,
      ipAddress,
      userAgent,
      errorMessage
    });
  } catch (error) {
    // Don't throw error to prevent logging from breaking the main flow
    console.error('Failed to log activity:', error.message);
  }
};

/**
 * Extract IP address from request
 */
const getIpAddress = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection?.remoteAddress || 
         'Unknown';
};

/**
 * Extract user agent from request
 */
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

module.exports = { logActivity, getIpAddress, getUserAgent };
