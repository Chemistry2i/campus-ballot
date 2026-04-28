const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: false // allow abstain (no candidate)
    },
    position: { // Now required: one vote per user per position per election
        type: String,
        trim: true,
        required: true
    },
    status: { // Optional: for vote verification or soft delete
        type: String,
        enum: ['valid', 'invalid'],
        default: 'valid'
    }
}, {timestamps: true});

// -------------------------------------------------------------------------
// Indexes — the unique compound index is the double-vote prevention mechanism.
// All other indexes support reporting and analytics queries.
// -------------------------------------------------------------------------

// UNIQUE: prevents double voting at the database level — this is the primary
// concurrency guard that makes MongoDB transactions unnecessary.
voteSchema.index({ user: 1, election: 1, position: 1 }, { unique: true });

// Candidate-specific vote lookup
voteSchema.index({ candidate: 1 });

// Status filtering (valid / invalid)
voteSchema.index({ status: 1 });

// Compound: "all votes in this election" — used in vote counting
voteSchema.index({ election: 1, position: 1 });

// Compound: "votes by this user across all elections" — used in /votes/me
voteSchema.index({ user: 1, createdAt: -1 });

// Compound: election vote timeline — used in analytics/observer dashboards
voteSchema.index({ election: 1, createdAt: -1 });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;