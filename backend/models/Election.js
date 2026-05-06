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
    
    // Organization that owns this election
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        index: true
    },
    
    // Election scope determines who can vote
    scope: {
        type: String,
        enum: [
            'university',    // Only students from the owning university can vote
            'federation',    // All students from member universities can vote
            'custom'         // Custom eligibility rules (use allowedOrganizations)
        ],
        default: 'university'
    },
    
    // For custom scope: specific organizations allowed to participate
    allowedOrganizations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }],
    
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return this.startDate ? v > this.startDate : true;
            },
            message: 'End date must be after start date'
        }
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
    allowedFaculties: [{
        type: String,
        trim: true
    }],
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
        minimumGPA: {
            type: Number,
            default: null
        },
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// -------------------------------------------------------------------------
// Indexes — optimised for election listing, filtering, and eligibility checks
// -------------------------------------------------------------------------

// Single-field covering basic sorts and filters
ElectionSchema.index({ status:    1 });
ElectionSchema.index({ startDate: 1 });
ElectionSchema.index({ endDate:   1 });
ElectionSchema.index({ createdBy: 1 });
ElectionSchema.index({ scope:     1 });

// Compound: org-scoped election list (most common admin + student query)
// "Find all elections for this organisation that are ongoing"
ElectionSchema.index({ organization: 1, status: 1 });

// Compound: time-window filtering — used in the student dashboard
// to bucket elections into upcoming / active / completed
ElectionSchema.index({ status: 1, startDate: 1, endDate: 1 });

// Compound: federation/custom-scope eligibility check
ElectionSchema.index({ scope: 1, organization: 1 });

// Eligibility sub-document fields used in isUserEligible()
ElectionSchema.index({ 'eligibility.faculty':     1 });
ElectionSchema.index({ 'eligibility.yearOfStudy': 1 });

// Text index: powers the search bar on the student dashboard
// (searches election title and description)
ElectionSchema.index({ title: 'text', description: 'text' }, { name: 'election_text_search' });

// Candidates array lookup — used when populating election with candidates
ElectionSchema.index({ candidates: 1 });

// Method to check if a user is eligible to vote in this election
ElectionSchema.methods.isUserEligible = async function(user) {
    // Check organization-based eligibility
    if (this.scope === 'university') {
        // User must belong to the same organization as the election
        if (!user.organization || !this.organization) return false;
        if (user.organization.toString() !== this.organization.toString()) return false;
    } else if (this.scope === 'federation') {
        // User's organization must be a member of the federation
        // (parent organization matches election's organization)
        const Organization = require('./Organization');
        const userOrg = await Organization.findById(user.organization);
        if (!userOrg) return false;
        
        // User's org must either BE the federation or BELONG to the federation
        if (userOrg._id.toString() !== this.organization.toString() && 
            (!userOrg.parent || userOrg.parent.toString() !== this.organization.toString())) {
            return false;
        }
    } else if (this.scope === 'custom') {
        // Check if user's organization is in allowedOrganizations
        if (!this.allowedOrganizations || this.allowedOrganizations.length === 0) return false;
        const userOrgId = user.organization?.toString();
        if (!this.allowedOrganizations.some(org => org.toString() === userOrgId)) return false;
    }
    
    // Additional eligibility checks (faculty, year, etc.)
    if (this.eligibility) {
        if (this.eligibility.faculty && user.faculty !== this.eligibility.faculty) return false;
        if (this.eligibility.yearOfStudy && user.yearOfStudy !== this.eligibility.yearOfStudy) return false;
        if (this.eligibility.course && user.course !== this.eligibility.course) return false;
    }
    
    // Check allowed faculties
    if (this.allowedFaculties && this.allowedFaculties.length > 0) {
        if (!this.allowedFaculties.includes(user.faculty)) return false;
    }
    
    return true;
};

// Static method to get elections visible to a user based on their organization
ElectionSchema.statics.getElectionsForUser = async function(user, filters = {}) {
    const Organization = require('./Organization');
    const userOrg = await Organization.findById(user.organization);
    
    const query = { ...filters };
    
    if (userOrg) {
        query.$or = [
            // University-scoped elections from user's organization
            { organization: user.organization, scope: 'university' },
            // Federation elections where user's org is a member
            { organization: userOrg.parent, scope: 'federation' },
            // Custom scope elections that include user's organization
            { scope: 'custom', allowedOrganizations: user.organization }
        ];
        
        // If user belongs to a federation directly
        if (userOrg.type === 'federation') {
            query.$or.push({ organization: userOrg._id, scope: 'federation' });
        }
    }
    
    return this.find(query);
};

const Election = mongoose.model('Election', ElectionSchema);
module.exports = Election;