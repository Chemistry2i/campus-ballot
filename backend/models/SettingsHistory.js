const mongoose = require('mongoose');

const settingsHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  section: { type: String, required: true },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null },
  reason: { type: String, default: null },
}, { timestamps: true });

// Add indexes for performance
settingsHistorySchema.index({ user: 1 });
settingsHistorySchema.index({ section: 1 });
settingsHistorySchema.index({ createdAt: -1 });

const SettingsHistory = mongoose.model('SettingsHistory', settingsHistorySchema);
module.exports = SettingsHistory;
