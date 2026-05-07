const mongoose = require('mongoose');
const crypto = require('crypto');

const receiptSchema = new mongoose.Schema({
    // Unique identifier for this receipt
    receiptId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    
    // User who cast the votes
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Election this receipt is for
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true,
        index: true
    },
    
    // Votes cast (array of position -> candidate mappings)
    votes: [{
        position: {
            type: String,
            required: true
        },
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
            required: false
        },
        candidateName: String, // denormalized for receipt display
        abstained: {
            type: Boolean,
            default: false
        }
    }],
    
    // HMAC-SHA256 signature for verification
    // Generated from: receiptId + user + election + votes + secret
    signature: {
        type: String,
        required: true
    },
    
    // Verification status
    verified: {
        type: Boolean,
        default: false
    },
    
    // When verification was performed
    verifiedAt: {
        type: Date,
        default: null
    },
    
    // Reason for verification failure (if any)
    verificationError: String,
    
    // Email confirmation status
    emailSent: {
        type: Boolean,
        default: false
    },
    
    emailSentAt: Date,
    
    // Receipt expiration - user can request new receipt after expiry
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    
    // IP address of the device that cast votes (for audit trails)
    ipAddress: String,
    
    // Browser/device information
    userAgent: String
    
}, { 
    timestamps: true 
});

// Indexes for common queries
receiptSchema.index({ user: 1, election: 1 }, { unique: true }); // One receipt per user per election
receiptSchema.index({ receiptId: 1 });
receiptSchema.index({ election: 1, createdAt: -1 }); // List receipts per election
receiptSchema.index({ verified: 1 }); // Query verified/unverified receipts
receiptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

// Method to generate receipt ID
receiptSchema.statics.generateReceiptId = function() {
    // Format: RECEIPT-TIMESTAMP-RANDOM
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `RECEIPT-${timestamp}-${random}`;
};

// Method to generate HMAC signature
receiptSchema.methods.generateSignature = function(secret) {
    const signatureData = JSON.stringify({
        receiptId: this.receiptId,
        userId: this.user.toString(),
        electionId: this.election.toString(),
        votes: this.votes,
        createdAt: this.createdAt
    });
    
    const signature = crypto
        .createHmac('sha256', secret)
        .update(signatureData)
        .digest('hex');
    
    return signature;
};

// Method to verify signature
receiptSchema.methods.verifySignature = function(secret) {
    const expectedSignature = this.generateSignature(secret);
    return this.signature === expectedSignature;
};

// Virtual field for display
receiptSchema.virtual('isExpired').get(function() {
    return new Date() > this.expiresAt;
});

receiptSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Receipt', receiptSchema);
