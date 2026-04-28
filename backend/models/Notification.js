const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'admins', 'students'],
    default: 'all'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// -------------------------------------------------------------------------
// Indexes — covering the student dashboard notification fetch pattern
// -------------------------------------------------------------------------

// Compound: the student dashboard fetches active notifications for their audience,
// sorted newest first — this single index covers the full query without a collection scan.
notificationSchema.index({ targetAudience: 1, isActive: 1, createdAt: -1 });

// readBy: used when marking individual notifications as read
notificationSchema.index({ readBy: 1 });

// Admin: notification history by creator
notificationSchema.index({ createdBy: 1, createdAt: -1 });

// Quick toggle: isActive used for soft-deleting/deactivating notifications
notificationSchema.index({ isActive: 1 });

module.exports = mongoose.model('Notification', notificationSchema);