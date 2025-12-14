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
    enum: ['login', 'logout', 'create', 'update', 'delete', 'vote', 'view', 'maintenance', 'backup', 'security', 'configuration']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Election', 'Candidate', 'Vote', 'Notification', 'Log', 'System']
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

module.exports = mongoose.model('Log', logSchema);