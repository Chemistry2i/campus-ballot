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
    
    // Organization this user belongs to (university or federation)
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        index: true
    },
    
    role: {
        type: String,
        enum: ['student', 'admin', 'super_admin', 'federation_admin', 'candidate', 'agent', 'observer'], // Primary role
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
    // Observer-specific fields
    observerInfo: {
        assignedElections: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Election'
        }],
        organization: {
            type: String,
            trim: true
        },
        accessLevel: {
            type: String,
            enum: ['full', 'election-specific'],
            default: 'election-specific'
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        assignedDate: {
            type: Date,
            default: Date.now
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
        // Optional - not all imports have this data
        required: false,
        trim: true,
    },
    course: {
        type: String,
        // Optional - not all imports have this data
        required: false,
        trim: true,
    },
    department: {
        type: String,
        trim: true,
        default: null
    },
    yearOfStudy: {
        type: String,
        trim: true,
        // Optional - not all imports have this data
        required: false
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        // Optional - not all imports have this data
        required: false,
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
    // For single-device login enforcement
    currentSessionToken: {
        type: String,
        default: null,
        select: false // Do not return by default
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
    // Track last seen for active user monitoring
    lastSeen: {
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

// Add indexes for performance
// Removed duplicate index for email (already defined in schema)
userSchema.index({ role: 1 });
// Removed duplicate index for studentId (already defined in schema)
userSchema.index({ faculty: 1 });
userSchema.index({ lastSeen: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ isVerified: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
// Export the User model for use in other parts of the