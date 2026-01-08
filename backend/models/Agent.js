const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    // The user who is the agent
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The candidate this agent works for
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The election this agent assignment is for
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    // Agent role within the campaign
    agentRole: {
        type: String,
        enum: ['agent', 'senior-agent', 'coordinator'],
        default: 'agent'
    },
    // Permissions granted to this agent
    permissions: {
        updateMaterials: { type: Boolean, default: false },
        postUpdates: { type: Boolean, default: false },
        respondToQuestions: { type: Boolean, default: false },
        viewStatistics: { type: Boolean, default: false },
        manageTasks: { type: Boolean, default: false }
    },
    // Status of the agent
    status: {
        type: String,
        enum: ['active', 'inactive', 'removed'],
        default: 'active'
    },
    // Task tracking
    tasksCompleted: {
        type: Number,
        default: 0
    },
    tasksActive: {
        type: Number,
        default: 0
    },
    // Notes about the agent
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure a user can only be an agent for one candidate per election
agentSchema.index({ user: 1, election: 1 }, { unique: true });

// Index for efficient queries
agentSchema.index({ candidate: 1, election: 1 });
agentSchema.index({ candidate: 1, status: 1 });

const Agent = mongoose.model('Agent', agentSchema);
module.exports = Agent;
