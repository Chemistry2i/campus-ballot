const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'create', 'update', 'delete', 'vote', 'view', 'maintenance', 'backup', 'security', 'configuration', 'import', 'export']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Election', 'Candidate', 'Vote', 'Ballot', 'VoterRecord', 'Notification', 'Log', 'System', 'Organization']
  },
  entityId: {
    type: String,
    default: null
  },
  details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  ipAddress: String,
  userAgent: String,
  errorMessage: String
}, {
  timestamps: true
});

// -------------------------------------------------------------------------
// Indexes — covering audit log query patterns in admin/super-admin dashboards
// -------------------------------------------------------------------------

// Single-field
logSchema.index({ user:       1 });
logSchema.index({ action:     1 });
logSchema.index({ entityType: 1 });
logSchema.index({ entityId:   1 });
logSchema.index({ status:     1 });

// Newest-first sort — used in every log listing
logSchema.index({ createdAt: -1 });

// Compound: "activity log for a specific user, sorted by time"
logSchema.index({ user: 1, createdAt: -1 });

// Compound: "all vote actions for audit trail" — used in election integrity reports
logSchema.index({ action: 1, entityType: 1, createdAt: -1 });

// Compound: "find logs for a specific entity" — used in per-election audit view
logSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);