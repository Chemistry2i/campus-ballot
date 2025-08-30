const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true // Index for faster lookups
    },
    token: {
        type: String,
        required: true,
        unique: true, // Ensure token uniqueness
        trim: true // Remove leading/trailing whitespace
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // 1 hour,
        // Automatically delete the token after 1 hour
    }
});

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);
module.exports = VerificationToken;
