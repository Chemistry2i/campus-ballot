const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { // Notification title/subject
        type: String,
        required: true,
        trim: true
    },
    message: { // Main content of the notification
        type: String,
        required: true,
        trim: true
    },
    type: { // Category of notification
        type: String,
        enum: ['election', 'vote', 'candidate', 'general'],
        required: true
    },
    targetAudience: { // Who should receive this notification
        type: String,
        enum: ['all', 'students', 'admins'],
        default: 'all'
    },
    createdBy: { // User who created the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedId: { // Optional: Reference to related election, candidate, or vote
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    readBy: [{ // Optional: Users who have read the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {timestamps: true});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
// Export the Notification model for use in other parts of the application