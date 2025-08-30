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

const Candidate = mongoose.model('Candidate', candidateSchema);
// Export the Candidate model
module.exports = Candidate;