const mongoose = require('mongoose');

// Define the Election schema
const ElectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    positions: [{
        type: String,
        required: true,
        trim: true
    }],
    candidates: [{ // <-- Add this field
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
    }],
    resultsPublished: {
        type: Boolean,
        default: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    eligibility: {
        faculty: {
            type: String,
            default: null
        },
        yearOfStudy: {
            type: String,
            default: null
        },
        course: {
            type: String,
            default: null
        },
        minimunmGPA: {
            type: Number,
            default: null
        },
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create the Election model
const Election = mongoose.model('Election', ElectionSchema);

module.exports = Election;