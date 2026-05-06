const mongoose = require('mongoose');

/**
 * Organization Model
 * 
 * Supports a hierarchical structure:
 * - Federation: The parent organization that oversees all university associations
 * - University: Individual university associations that belong to the federation
 * 
 * Example hierarchy:
 * - National Student Federation (type: federation)
 *   ├── Kyambogo University Students Association (type: university, parent: NSF)
 *   ├── Makerere University Students Association (type: university, parent: NSF)
 *   └── MUBS Students Association (type: university, parent: NSF)
 */

const organizationSchema = new mongoose.Schema({
    // Organization name (e.g., "Kyambogo University", "National Student Federation")
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    
    // Short code for quick reference (e.g., "KYU", "MAK", "NSF")
    code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true,
        maxlength: 10
    },
    
    // Type of organization
    type: {
        type: String,
        enum: ['federation', 'university'],
        required: true,
        default: 'university'
    },
    
    // Parent organization (for universities belonging to a federation)
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    
    // Description of the organization
    description: {
        type: String,
        trim: true,
        default: null
    },
    
    // Logo URL
    logo: {
        type: String,
        trim: true,
        default: null
    },
    
    // Contact information
    contact: {
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: null
        },
        phone: {
            type: String,
            trim: true,
            default: null
        },
        address: {
            type: String,
            trim: true,
            default: null
        },
        website: {
            type: String,
            trim: true,
            default: null
        }
    },
    
    // Organization settings
    settings: {
        // Allow students to self-register
        allowSelfRegistration: {
            type: Boolean,
            default: true
        },
        // Require email verification for new users
        requireEmailVerification: {
            type: Boolean,
            default: true
        },
        // Allow cross-organization voting (for federation elections)
        allowFederationVoting: {
            type: Boolean,
            default: true
        },
        // Custom branding colors
        primaryColor: {
            type: String,
            default: '#0d6efd'
        },
        secondaryColor: {
            type: String,
            default: '#6c757d'
        }
    },
    
    // Organization status
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    
    // Subscription/plan info (for future monetization)
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free'
        },
        maxUsers: {
            type: Number,
            default: 1000
        },
        maxElections: {
            type: Number,
            default: 10
        },
        expiresAt: {
            type: Date,
            default: null
        }
    },
    
    // Statistics cache (updated periodically)
    stats: {
        totalUsers: {
            type: Number,
            default: 0
        },
        totalElections: {
            type: Number,
            default: 0
        },
        totalVotes: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: null
        }
    },
    
    // Created by (federation admin or system)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// -------------------------------------------------------------------------
// Indexes — covering federation hierarchy and eligibility lookups
// -------------------------------------------------------------------------

// Single-field
organizationSchema.index({ type:   1 });
organizationSchema.index({ status: 1 });

// Compound: "find all active universities" — used in admin org management
organizationSchema.index({ type: 1, status: 1 });

// Compound: "find universities in this federation" — used in election eligibility
// Election.isUserEligible() calls Organization.findById(user.organization) then
// checks parent — this compound index covers both parent lookup and status filter
organizationSchema.index({ parent: 1, status: 1 });

// Compound: getUniversitiesByFederation() filters on parent + type + status
organizationSchema.index({ parent: 1, type: 1, status: 1 });

// Virtual to get all child organizations (universities under a federation)
organizationSchema.virtual('children', {
    ref: 'Organization',
    localField: '_id',
    foreignField: 'parent'
});

// Virtual to get all users in this organization
organizationSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'organization'
});

// Method to check if this is a federation
organizationSchema.methods.isFederation = function() {
    return this.type === 'federation';
};

// Method to check if this organization belongs to a federation
organizationSchema.methods.belongsToFederation = function() {
    return this.parent !== null;
};

// Static method to get federation with all its universities
organizationSchema.statics.getFederationWithUniversities = async function(federationId) {
    return this.findById(federationId).populate({
        path: 'children',
        match: { status: 'active' }
    });
};

// Static method to get all active universities under a federation
organizationSchema.statics.getUniversitiesByFederation = async function(federationId) {
    return this.find({ 
        parent: federationId, 
        type: 'university',
        status: 'active' 
    });
};

// Pre-save validation
organizationSchema.pre('save', async function(next) {
    // Federation cannot have a parent
    if (this.type === 'federation' && this.parent) {
        const error = new Error('Federation organizations cannot have a parent');
        return next(error);
    }
    
    // University should have a parent (federation)
    // This is optional - universities can exist independently
    
    next();
});

// Ensure virtuals are included in JSON output
organizationSchema.set('toJSON', { virtuals: true });
organizationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Organization', organizationSchema);
