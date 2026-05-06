const mongoose = require('mongoose');

const resultsAuditLogSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: ['published', 'unpublished', 'modified', 'recalculated'],
      required: true
    },
    // Who performed the action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Previous results snapshot (for audit trail)
    previousSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    // Current results snapshot
    currentSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    // What changed
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    // Reason for change
    reason: String,
    // IP address for security tracking
    ipAddress: String,
    // User agent for device tracking
    userAgent: String,
    // Timestamp (automatically set)
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      immutable: true // Cannot be modified after creation
    }
  },
  { timestamps: true, collection: 'resultsAuditLogs' }
);

// Index for efficient querying by election and date range
resultsAuditLogSchema.index({ election: 1, timestamp: -1 });

// Index for security audit trails (who changed what when)
resultsAuditLogSchema.index({ performedBy: 1, timestamp: -1 });

module.exports = mongoose.model('ResultsAuditLog', resultsAuditLogSchema);
