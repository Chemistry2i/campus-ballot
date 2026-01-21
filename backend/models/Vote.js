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

// Prevent double voting per user per election per position
voteSchema.index({ user: 1, election: 1, position: 1 }, { unique: true });
voteSchema.index({ candidate: 1 });
voteSchema.index({ status: 1 });
voteSchema.index({ election: 1 });
voteSchema.index({ position: 1 });
voteSchema.index({ createdAt: 1 });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;