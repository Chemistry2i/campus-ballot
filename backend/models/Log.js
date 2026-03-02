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
    enum: ['User', 'Election', 'Candidate', 'Vote', 'Notification', 'Log', 'System', 'Organization']
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

// Add indexes for performance
logSchema.index({ user: 1 });
logSchema.index({ action: 1 });
logSchema.index({ entityType: 1 });
logSchema.index({ entityId: 1 });
logSchema.index({ status: 1 });
logSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);