/**
 * CampaignMessage Model
 * Stores campaign messages/announcements posted by agents on behalf of candidates
 * Immutable after creation to maintain audit trail
 */

const mongoose = require('mongoose');

const campaignMessageSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true,
        index: true
    },
    text: {
        type: String,
        required: [true, 'Message text is required'],
        maxlength: [5000, 'Message cannot exceed 5000 characters'],
        trim: true
    },
    visibility: {
        type: String,
        enum: ['public', 'supporters_only', 'private'],
        default: 'public'
    },
    messageType: {
        type: String,
        enum: ['announcement', 'campaign_update', 'event_reminder', 'supporter_thank_you'],
        default: 'announcement'
    },
    
    // Engagement tracking
    likes: [{
        userId: mongoose.Schema.Types.ObjectId,
        likedAt: { type: Date, default: Date.now }
    }],
    shares: [{
        userId: mongoose.Schema.Types.ObjectId,
        sharedAt: { type: Date, default: Date.now }
    }],
    replies: [{
        supporterId: mongoose.Schema.Types.ObjectId,
        text: String,
        createdAt: { type: Date, default: Date.now },
        isVerified: Boolean // Verified supporter reply
    }],
    
    // Media (optional)
    mediaUrl: String,
    mediaType: {
        type: String,
        enum: ['image', 'video', 'document']
    },
    
    // Metadata
    postedAt: {
        type: Date,
        default: Date.now,
        immutable: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    
    // Editing (track changes but don't allow true editing)
    isEdited: {
        type: Boolean,
        default: false
    },
    editHistory: [{
        editedAt: Date,
        previousText: String,
        editedBy: mongoose.Schema.Types.ObjectId
    }],
    
    // Status tracking
    status: {
        type: String,
        enum: ['published', 'scheduled', 'draft', 'archived'],
        default: 'published'
    },
    scheduledFor: Date,
    
    // Analytics
    viewCount: {
        type: Number,
        default: 0
    },
    engagementScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Index for performance
campaignMessageSchema.index({ candidateId: 1, postedAt: -1 });
campaignMessageSchema.index({ agentId: 1, postedAt: -1 });
campaignMessageSchema.index({ electionId: 1, status: 1 });

// Prevent direct updates to core fields
campaignMessageSchema.pre('findByIdAndUpdate', function(next) {
    const update = this.getUpdate();
    
    // Block these fields from updates
    const forbiddenFields = ['candidateId', 'agentId', 'electionId', 'postedAt', 'createdAt'];
    
    for (const field of forbiddenFields) {
        if (update[field]) {
            next(new Error(`Cannot modify ${field} field`));
            return;
        }
    }
    next();
});

// Calculate engagement score
campaignMessageSchema.virtual('totalEngagement').get(function() {
    const likes = this.likes?.length || 0;
    const shares = this.shares?.length || 0;
    const replies = this.replies?.length || 0;
    
    return likes + (shares * 2) + (replies * 3);
});

module.exports = mongoose.model('CampaignMessage', campaignMessageSchema);
