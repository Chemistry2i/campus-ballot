const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = ['posters', 'flyers', 'manifestos', 'videos', 'photos', 'other'];

const campaignMaterialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ALLOWED_CATEGORIES,
    default: 'other'
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    trim: true,
    default: null
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

campaignMaterialSchema.statics.allowedCategories = ALLOWED_CATEGORIES;

module.exports = mongoose.model('CampaignMaterial', campaignMaterialSchema);
