/**
 * CampaignEvent Model
 * Stores campaign events (rallies, press conferences, town halls, etc)
 * managed by agents on behalf of candidates
 */

const mongoose = require('mongoose');

const campaignEventSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Candidate ID is required'],
        index: true
    },
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: [true, 'Election ID is required'],
        index: true
    },
    
    // Event details
    name: {
        type: String,
        required: [true, 'Event name is required'],
        maxlength: [200, 'Event name cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
        trim: true
    },
    eventType: {
        type: String,
        enum: ['rally', 'press_conference', 'town_hall', 'debate', 'meet_and_greet', 'social_media_ama', 'other'],
        default: 'rally'
    },
    
    // Location and timing
    location: {
        venue: String,
        city: String,
        latitude: Number,
        longitude: Number,
        addressString: String
    },
    startDateTime: {
        type: Date,
        required: [true, 'Start time is required'],
        index: true
    },
    endDateTime: {
        type: Date,
        validate: {
            validator: function(value) {
                return !value || value > this.startDateTime;
            },
            message: 'End time must be after start time'
        }
    },
    timeZone: {
        type: String,
        default: 'UTC'
    },
    
    // Attendance tracking
    attendees: [{
        userId: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        registeredAt: { type: Date, default: Date.now },
        checkedIn: Boolean,
        checkedInAt: Date
    }],
    expectedAttendees: Number,
    actualAttendees: Number,
    
    // Media and streaming
    isStreamed: {
        type: Boolean,
        default: false
    },
    streamUrl: String,
    streamProvider: {
        type: String,
        enum: ['youtube', 'facebook', 'twitch', 'other']
    },
    mediaFiles: [{
        type: String,
        url: String,
        uploadedAt: Date
    }],
    
    // Status and lifecycle
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
        default: 'scheduled',
        index: true
    },
    cancellationReason: String,
    
    // Organizer info
    scheduledBy: {
        agentId: mongoose.Schema.Types.ObjectId,
        agentName: String,
        scheduledAt: { type: Date, default: Date.now }
    },
    lastModifiedBy: {
        agentId: mongoose.Schema.Types.ObjectId,
        modifiedAt: Date
    },
    
    // Analytics
    registrations: {
        type: Number,
        default: 0
    },
    no_shows: {
        type: Number,
        default: 0
    },
    social_media_mentions: {
        type: Number,
        default: 0
    },
    estimated_reach: Number,
    
    // Metadata
    tags: [String],
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index combinations for common queries
campaignEventSchema.index({ candidateId: 1, startDateTime: -1 });
campaignEventSchema.index({ electionId: 1, status: 1 });
campaignEventSchema.index({ startDateTime: 1, status: 1 });

// Virtual for event duration
campaignEventSchema.virtual('durationMinutes').get(function() {
    if (this.endDateTime) {
        return Math.floor((this.endDateTime - this.startDateTime) / (1000 * 60));
    }
    return null;
});

// Virtual for attendance rate
campaignEventSchema.virtual('attendanceRate').get(function() {
    if (this.expectedAttendees && this.actualAttendees) {
        return Math.round((this.actualAttendees / this.expectedAttendees) * 100);
    }
    return null;
});

// Prevent candidate/election changes
campaignEventSchema.pre('findByIdAndUpdate', function(next) {
    const update = this.getUpdate();
    
    if (update.candidateId || update.electionId) {
        next(new Error('Cannot change candidate or election after event creation'));
        return;
    }
    
    update.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('CampaignEvent', campaignEventSchema);
