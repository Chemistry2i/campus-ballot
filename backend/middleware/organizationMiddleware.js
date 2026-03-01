/**
 * Organization Middleware
 * 
 * Provides organization-aware access control and query filtering
 * for multi-university/federation support.
 */

const asyncHandler = require("express-async-handler");
const Organization = require("../models/Organization");

/**
 * Attach organization info to request
 * Loads the user's organization and federation info for downstream use
 */
const attachOrganization = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.organization) {
        try {
            const userOrg = await Organization.findById(req.user.organization)
                .populate('parent', 'name code type');
            
            if (userOrg) {
                req.organization = userOrg;
                req.federation = userOrg.parent || (userOrg.type === 'federation' ? userOrg : null);
            }
        } catch (err) {
            console.log('[ORG MIDDLEWARE] Error loading organization:', err.message);
        }
    }
    next();
});

/**
 * Require organization membership
 * Ensures user belongs to an organization
 */
const requireOrganization = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!req.user.organization) {
        return res.status(403).json({ 
            message: 'You must belong to an organization to access this resource' 
        });
    }
    
    // Load organization if not already loaded
    if (!req.organization) {
        req.organization = await Organization.findById(req.user.organization);
    }
    
    if (!req.organization || req.organization.status !== 'active') {
        return res.status(403).json({ 
            message: 'Your organization is not active' 
        });
    }
    
    next();
});

/**
 * Check if user can access a specific organization's data
 * @param {string} targetOrgId - Organization ID to check access for
 */
const canAccessOrganization = (targetOrgId) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        // Super admin can access everything
        if (req.user.role === 'super_admin') {
            return next();
        }
        
        const userOrgId = req.user.organization?.toString();
        const targetId = typeof targetOrgId === 'function' 
            ? targetOrgId(req)?.toString() 
            : targetOrgId?.toString() || req.params.organizationId;
        
        if (!targetId) {
            return res.status(400).json({ message: 'Organization ID required' });
        }
        
        // Direct organization match
        if (userOrgId === targetId) {
            return next();
        }
        
        // Federation admin can access member universities
        if (req.user.role === 'federation_admin') {
            const userOrg = await Organization.findById(req.user.organization);
            if (userOrg && userOrg.type === 'federation') {
                const targetOrg = await Organization.findById(targetId);
                if (targetOrg && targetOrg.parent?.toString() === userOrgId) {
                    return next();
                }
            }
        }
        
        // University admin can access parent federation (read-only typically)
        const userOrg = req.organization || await Organization.findById(req.user.organization);
        if (userOrg && userOrg.parent?.toString() === targetId) {
            // Allow limited access to parent federation
            req.limitedAccess = true;
            return next();
        }
        
        return res.status(403).json({ 
            message: 'You do not have access to this organization' 
        });
    });
};

/**
 * Filter query by organization
 * Adds organization filter to database queries based on user's role and org
 * 
 * @param {object} options - Configuration options
 * @param {boolean} options.includeFederationData - Include federation-level data for members
 * @param {boolean} options.includeMemberData - For federation admins, include member org data
 */
const orgFilter = (options = {}) => {
    return asyncHandler(async (req, res, next) => {
        const filter = {};
        
        if (!req.user) {
            req.orgFilter = filter;
            return next();
        }
        
        // Super admin sees all
        if (req.user.role === 'super_admin') {
            req.orgFilter = filter;
            return next();
        }
        
        const userOrg = req.organization || await Organization.findById(req.user.organization);
        
        if (!userOrg) {
            // User has no organization - filter to empty
            req.orgFilter = { organization: null };
            return next();
        }
        
        if (req.user.role === 'federation_admin' && userOrg.type === 'federation') {
            // Federation admin can see federation data and all member universities
            if (options.includeMemberData) {
                const memberOrgs = await Organization.find({ parent: userOrg._id }).select('_id');
                const memberOrgIds = memberOrgs.map(o => o._id);
                filter.$or = [
                    { organization: userOrg._id },
                    { organization: { $in: memberOrgIds } }
                ];
            } else {
                filter.organization = userOrg._id;
            }
        } else {
            // Regular admin/user - see own organization data
            filter.organization = userOrg._id;
            
            // Optionally include federation-level data
            if (options.includeFederationData && userOrg.parent) {
                filter.$or = [
                    { organization: userOrg._id },
                    { organization: userOrg.parent, scope: 'federation' }
                ];
            }
        }
        
        req.orgFilter = filter;
        next();
    });
};

/**
 * Validate organization exists and is active
 * For routes that accept organizationId in params or body
 */
const validateOrganization = asyncHandler(async (req, res, next) => {
    const orgId = req.body.organization || req.params.organizationId || req.query.organization;
    
    if (!orgId) {
        return next(); // Organization is optional
    }
    
    const org = await Organization.findById(orgId);
    
    if (!org) {
        return res.status(404).json({ message: 'Organization not found' });
    }
    
    if (org.status !== 'active') {
        return res.status(400).json({ message: 'Organization is not active' });
    }
    
    req.targetOrganization = org;
    next();
});

/**
 * Get organizations the user can manage
 * Returns array of organization IDs
 */
const getManagedOrganizations = async (user) => {
    if (!user) return [];
    
    // Super admin manages all
    if (user.role === 'super_admin') {
        const orgs = await Organization.find({}).select('_id');
        return orgs.map(o => o._id);
    }
    
    // Federation admin manages federation + members
    if (user.role === 'federation_admin' && user.organization) {
        const userOrg = await Organization.findById(user.organization);
        if (userOrg && userOrg.type === 'federation') {
            const members = await Organization.find({ parent: userOrg._id }).select('_id');
            return [userOrg._id, ...members.map(m => m._id)];
        }
    }
    
    // Regular admin manages own org only
    if (user.organization) {
        return [user.organization];
    }
    
    return [];
};

module.exports = {
    attachOrganization,
    requireOrganization,
    canAccessOrganization,
    orgFilter,
    validateOrganization,
    getManagedOrganizations
};
