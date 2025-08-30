const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: { // The user who performed the action
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: { // The type of action performed
        type: String,
        required: true,
        enum: ['create', 'update', 'delete', 'view', 'login', 'logout'],
    },
    entityType: { // The type of entity affected
        type: String,
        required: true,
        enum: ['User', 'Election', 'Candidate', 'Vote', 'Notification', 'Log']
    },
    entityId: { // The ID of the affected entity
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'entityType',
        required: true
    },
    details: { // Additional details about the action
        type: String,
        trim: true,
        default: null
    },
    ipAddress: { // IP address from which the action was performed
        type: String,
        required: true,
        trim: true
    },
    userAgent: { // User agent string of the client
        type: String,
        required: true,
        trim: true
    },
    status: { // Whether the action was successful or failed
        type: String,
        enum: ['success', 'failure'],
        default: 'success'
    },
    errorMessage: { // Error message if the action failed
        type: String,
        trim: true,
        default: null
    },
    location: { // Optional: location info (e.g., city, country)
        type: String,
        trim: true,
        default: null
    }
}, {timestamps: true});

const Log = mongoose.model('Log', logSchema);
// Export the Log model for use in other parts of the application
module.exports = Log;