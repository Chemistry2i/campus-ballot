/**
 * Results Audit Trail Utilities
 * Provides helper functions for logging and retrieving result changes
 */

const ResultsAuditLog = require('../models/ResultsAuditLog');
const { getIpAddress, getUserAgent } = require('./logActivity');

/**
 * Log a result change to the audit trail
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logResultChange = async (options) => {
  try {
    const {
      election,
      action,
      performedBy,
      previousSnapshot,
      currentSnapshot,
      changes,
      reason,
      req
    } = options;

    if (!election || !action || !performedBy) {
      throw new Error('Missing required audit log fields: election, action, performedBy');
    }

    const auditEntry = await ResultsAuditLog.create({
      election,
      action,
      performedBy,
      previousSnapshot,
      currentSnapshot,
      changes,
      reason,
      ipAddress: req ? getIpAddress(req) : null,
      userAgent: req ? getUserAgent(req) : null
    });

    console.log(`[AUDIT] Result ${action} logged for election ${election}`);
    return auditEntry;
  } catch (error) {
    console.error('[AUDIT ERROR]:', error.message);
    throw error;
  }
};

/**
 * Get audit trail for an election
 * @param {string} electionId - Election ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of audit log entries
 */
const getAuditTrail = async (electionId, options = {}) => {
  try {
    const {
      limit = 50,
      skip = 0,
      startDate,
      endDate
    } = options;

    const query = { election: electionId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await ResultsAuditLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const total = await ResultsAuditLog.countDocuments(query);

    return {
      logs,
      total,
      hasMore: skip + limit < total
    };
  } catch (error) {
    console.error('[AUDIT TRAIL ERROR]:', error.message);
    throw error;
  }
};

/**
 * Compare two snapshots and extract differences
 * @param {Object} previous - Previous state snapshot
 * @param {Object} current - Current state snapshot
 * @returns {Object} Object containing what changed
 */
const getChanges = (previous, current) => {
  const changes = {};

  if (!previous || !current) return null;

  // Compare candidate votes
  if (previous.candidates && current.candidates) {
    const voteChanges = [];
    current.candidates.forEach((currentCandidate) => {
      const previousCandidate = previous.candidates.find(c => c._id === currentCandidate._id);
      if (previousCandidate && previousCandidate.votes !== currentCandidate.votes) {
        voteChanges.push({
          candidateId: currentCandidate._id,
          candidateName: currentCandidate.name,
          before: previousCandidate.votes,
          after: currentCandidate.votes,
          difference: currentCandidate.votes - previousCandidate.votes
        });
      }
    });
    if (voteChanges.length > 0) {
      changes.voteChanges = voteChanges;
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
};

module.exports = {
  logResultChange,
  getAuditTrail,
  getChanges
};
