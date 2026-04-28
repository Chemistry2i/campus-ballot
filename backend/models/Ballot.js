const mongoose = require('mongoose');

const ballotSchema = new mongoose.Schema({
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    position: {
        type: String,
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
        // Not required if abstaining
    },
    // Anonymous demographics for analytics
    faculty: String,
    department: String,
    yearOfStudy: String,
    gender: String,
    
    status: {
        type: String,
        enum: ['valid', 'void', 'spoiled'],
        default: 'valid'
    }
}, { timestamps: true });

// -------------------------------------------------------------------------
// Indexes — optimised for the query patterns in voteController & analytics
// -------------------------------------------------------------------------

// Hot path: duplicate-vote check uses this exact filter
ballotSchema.index({ election: 1, position: 1 });

// Candidate vote tallies & reporting
ballotSchema.index({ candidate: 1 });

// Demographic analytics aggregations (used in observer + admin dashboards)
ballotSchema.index({ faculty:     1 });
ballotSchema.index({ department:  1 });
ballotSchema.index({ yearOfStudy: 1 });
ballotSchema.index({ gender:      1 });

// Pagination: sort by newest votes first
ballotSchema.index({ createdAt: -1 });

// Compound: filter by election + sort by date (covers most admin list queries)
ballotSchema.index({ election: 1, createdAt: -1 });

// Status filtering (valid / void / spoiled)
ballotSchema.index({ status: 1 });

module.exports = mongoose.model('Ballot', ballotSchema);