const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Exclude password from queries by default
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'super_admin', 'candidate', 'agent'], // Primary role
        default: 'student',
        required: true,
        trim: true,
    },
    // Additional roles for multi-role support (student can also be candidate/agent)
    additionalRoles: {
        type: [String],
        enum: ['candidate', 'agent'],
        default: []
    },
    // Candidate-specific fields
    candidateInfo: {
        electionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Election'
        },
        position: String,
        manifesto: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },
    // Agent-specific fields
    agentInfo: {
        assignedCandidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        permissions: {
            type: [String],
            enum: ['updateMaterials', 'postUpdates', 'respondToQuestions', 'viewStatistics', 'manageTasks'],
            default: []
        }
    },
    studentId: {
        type: String,
        required: function() {
            return this.role === 'student';
        },
        unique: true,
        trim: true,
        sparse: true
    },
    faculty: {
        type: String,
        required: function() {
            return this.role === 'student';
        },
        trim: true,
    },
    course: {
        type: String,
        required: function() {
            return this.role === 'student';
        },
        trim: true,
    },
    yearOfStudy: {
        type: String,
        trim: true,
        required: function() {
            return this.role === 'student';
        }
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: function() {
            return this.role === 'student';
        },
    },
    phone: {
        type: String,
        trim: true,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: null,
    },
    verificationTokenExpiry: {
        type: Date,
        default: null,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordTokenExpiry: {
        type: Date,
        default: null,
    },
    votingStatus: [{
        electionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Election',
            required: true
        },
        hasVoted: {
            type: Boolean,
            default: false
        }
    }],
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'deactivated'],
        default: 'active'
    },
    lastLogin: {
        type: Date,
        default: null
    },
    profilePicture: {
        type: String,
        default: null,
        trim: true,
        required: false
    },
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
// Export the User model for use in other parts of the