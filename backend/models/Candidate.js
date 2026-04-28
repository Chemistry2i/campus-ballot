const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true,
        trim: true,
    },
    photo: {
        type: String,
        default: null,
        trim: true,
    },
    position: {
        type: String,
        required: true,
        trim: true,
    },
    symbol: {
        type: String,
        trim: true,
        default: null,
    },
    party: {
        type: String,
        trim: true,
        default: null,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    manifesto: {
        type: String,
        trim: true,
        default: null,
    },
    // Extended profile fields
    email: {
        type: String,
        trim: true,
        default: null,
    },
    phone: {
        type: String,
        trim: true,
        default: null,
    },
    studentId: {
        type: String,
        trim: true,
        default: null,
    },
    department: {
        type: String,
        trim: true,
        default: null,
    },
    yearOfStudy: {
        type: String,
        trim: true,
        default: null,
    },
    bio: {
        type: String,
        trim: true,
        default: null,
    },
    campaignPromises: [{
        type: String,
        trim: true,
    }],
    qualifications: [{
        type: String,
        trim: true,
    }],
    achievements: [{
        type: String,
        trim: true,
    }],
    socialMedia: {
        facebook: {
            type: String,
            trim: true,
            default: null,
        },
        twitter: {
            type: String,
            trim: true,
            default: null,
        },
        instagram: {
            type: String,
            trim: true,
            default: null,
        },
        linkedin: {
            type: String,
            trim: true,
            default: null,
        },
        website: {
            type: String,
            trim: true,
            default: null,
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'disqualified'],
        default: 'pending'
    },
    votes: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

// -------------------------------------------------------------------------
// Indexes — optimised for vote path, leaderboard, and admin queries
// -------------------------------------------------------------------------

// Single-field
candidateSchema.index({ user:      1 });
candidateSchema.index({ status:    1 });
candidateSchema.index({ name:      1 });
candidateSchema.index({ studentId: 1 });

// Compound: used on the hot vote path — castVote does:
//   Candidate.findOne({ _id: candidateId, election: electionId, position })
candidateSchema.index({ election: 1, position: 1 });

// Compound: "approved candidates for this election" — most common list query
candidateSchema.index({ election: 1, status: 1 });

// Compound: live leaderboard sort — candidates ranked by votes within election
candidateSchema.index({ election: 1, votes: -1 });

// Year of study filtering used in analytics
candidateSchema.index({ yearOfStudy: 1 });

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;