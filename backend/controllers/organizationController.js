const asyncHandler = require("express-async-handler");
const Organization = require("../models/Organization");
const User = require("../models/User");
const Election = require("../models/Election");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Admin (federation admin sees all, university admin sees own + parent)
const getAllOrganizations = asyncHandler(async (req, res) => {
    const { type, status, parent, search } = req.query;
    let query = {};
    
    // Role-based filtering FIRST
    if (req.user.role === 'admin' && req.user.organization) {
        // University admins can only see their own organization and its parent federation
        const userOrg = await Organization.findById(req.user.organization);
        if (userOrg) {
            query._id = { $in: [req.user.organization, userOrg.parent].filter(Boolean) };
        } else {
            // Admin has no valid organization, return empty
            return res.json([]);
        }
    }
    // super_admin and federation_admin can see all - no filtering
    
    // Additional filters (these stack on top of role-based filters)
    if (type) query.type = type;
    if (status) query.status = status;
    if (parent) query.parent = parent;
    
    // Search by name or code
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } }
        ];
    }
    
    console.log('Organizations query:', JSON.stringify(query));
    console.log('User role:', req.user.role);
    
    const organizations = await Organization.find(query)
        .populate('parent', 'name code')
        .sort({ type: 1, name: 1 });
    
    console.log('Organizations found:', organizations.length);
    
    // Compute real-time stats for each organization
    const orgsWithStats = await Promise.all(organizations.map(async (org) => {
        const orgObj = org.toObject();
        
        // Count users in this organization
        const userCount = await User.countDocuments({ organization: org._id });
        
        // Count elections for this organization
        const electionCount = await Election.countDocuments({ organization: org._id });
        
        // Update stats in response
        orgObj.stats = {
            ...orgObj.stats,
            totalUsers: userCount,
            totalElections: electionCount,
            lastUpdated: new Date()
        };
        
        return orgObj;
    }));
    
    res.json(orgsWithStats);
});

// @desc    Get organization by ID
// @route   GET /api/organizations/:id
// @access  Admin
const getOrganizationById = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id)
        .populate('parent', 'name code logo')
        .populate('createdBy', 'name email');
    
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }
    
    // Get child organizations if this is a federation
    let children = [];
    if (organization.type === 'federation') {
        children = await Organization.find({ parent: organization._id, status: 'active' })
            .select('name code logo status stats');
    }
    
    res.json({
        ...organization.toObject(),
        children
    });
});

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Super Admin or Federation Admin
const createOrganization = asyncHandler(async (req, res) => {
    const { name, code, type, parent, description, contact, settings } = req.body;
    
    // Validate required fields
    if (!name || !code || !type) {
        res.status(400);
        throw new Error('Name, code, and type are required');
    }
    
    // Check for duplicate code
    const existingOrg = await Organization.findOne({ 
        $or: [{ code: code.toUpperCase() }, { name }] 
    });
    if (existingOrg) {
        res.status(400);
        throw new Error('Organization with this name or code already exists');
    }
    
    // Validate parent if provided
    if (parent) {
        const parentOrg = await Organization.findById(parent);
        if (!parentOrg) {
            res.status(400);
            throw new Error('Parent organization not found');
        }
        if (parentOrg.type !== 'federation') {
            res.status(400);
            throw new Error('Parent organization must be a federation');
        }
    }
    
    // Federation admin can only create universities under their federation
    if (req.user.role === 'federation_admin') {
        const adminOrg = await Organization.findById(req.user.organization);
        if (!adminOrg || adminOrg.type !== 'federation') {
            res.status(403);
            throw new Error('Only federation admins can create organizations');
        }
        if (type === 'federation') {
            res.status(403);
            throw new Error('Federation admins cannot create other federations');
        }
    }
    
    const organization = await Organization.create({
        name,
        code: code.toUpperCase(),
        type,
        parent: parent || null,
        description,
        contact,
        settings,
        createdBy: req.user._id
    });
    
    await logActivity({
        userId: req.user._id,
        action: 'create',
        entityType: 'Organization',
        entityId: organization._id.toString(),
        details: `Created ${type} organization: ${name}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
    });
    
    res.status(201).json(organization);
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Super Admin or Federation Admin (for own federation/members)
const updateOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }
    
    // Check permission
    if (req.user.role === 'federation_admin') {
        const adminOrg = await Organization.findById(req.user.organization);
        // Can only update own federation or its member universities
        if (organization._id.toString() !== req.user.organization.toString() &&
            organization.parent?.toString() !== req.user.organization.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this organization');
        }
    }
    
    const { name, description, logo, contact, settings, status } = req.body;
    
    // Update fields
    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (logo !== undefined) organization.logo = logo;
    if (contact) organization.contact = { ...organization.contact, ...contact };
    if (settings) organization.settings = { ...organization.settings, ...settings };
    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
        organization.status = status;
    }
    
    await organization.save();
    
    await logActivity({
        userId: req.user._id,
        action: 'update',
        entityType: 'Organization',
        entityId: organization._id.toString(),
        details: `Updated organization: ${organization.name}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
    });
    
    res.json(organization);
});

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Super Admin only
const deleteOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }
    
    // Check for dependent data
    const userCount = await User.countDocuments({ organization: organization._id });
    const electionCount = await Election.countDocuments({ organization: organization._id });
    const childCount = await Organization.countDocuments({ parent: organization._id });
    
    if (userCount > 0 || electionCount > 0 || childCount > 0) {
        res.status(400);
        throw new Error(`Cannot delete organization with ${userCount} users, ${electionCount} elections, or ${childCount} child organizations. Please remove or reassign them first.`);
    }
    
    await organization.deleteOne();
    
    await logActivity({
        userId: req.user._id,
        action: 'delete',
        entityType: 'Organization',
        entityId: organization._id.toString(),
        details: `Deleted organization: ${organization.name} (${organization.code})`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
    });
    
    res.json({ message: 'Organization deleted successfully' });
});

// @desc    Get organization statistics
// @route   GET /api/organizations/:id/stats
// @access  Admin
const getOrganizationStats = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }
    
    // Calculate fresh stats
    const [userStats, electionStats] = await Promise.all([
        User.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        Election.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
    ]);
    
    // Get child organization stats if federation
    let memberStats = null;
    if (organization.type === 'federation') {
        memberStats = await Organization.aggregate([
            { $match: { parent: organization._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
    }
    
    const stats = {
        users: {
            total: userStats.reduce((acc, s) => acc + s.count, 0),
            byRole: Object.fromEntries(userStats.map(s => [s._id, s.count]))
        },
        elections: {
            total: electionStats.reduce((acc, s) => acc + s.count, 0),
            byStatus: Object.fromEntries(electionStats.map(s => [s._id, s.count]))
        },
        members: memberStats ? {
            total: memberStats.reduce((acc, s) => acc + s.count, 0),
            byStatus: Object.fromEntries(memberStats.map(s => [s._id, s.count]))
        } : null
    };
    
    // Update cached stats
    organization.stats = {
        totalUsers: stats.users.total,
        totalElections: stats.elections.total,
        lastUpdated: new Date()
    };
    await organization.save();
    
    res.json(stats);
});

// @desc    Add university to federation
// @route   POST /api/organizations/:id/members
// @access  Federation Admin or Super Admin
const addMemberUniversity = asyncHandler(async (req, res) => {
    const federation = await Organization.findById(req.params.id);
    
    if (!federation) {
        res.status(404);
        throw new Error('Federation not found');
    }
    
    if (federation.type !== 'federation') {
        res.status(400);
        throw new Error('Can only add members to a federation');
    }
    
    const { universityId } = req.body;
    const university = await Organization.findById(universityId);
    
    if (!university) {
        res.status(404);
        throw new Error('University not found');
    }
    
    if (university.type !== 'university') {
        res.status(400);
        throw new Error('Can only add universities as members');
    }
    
    if (university.parent) {
        res.status(400);
        throw new Error('University already belongs to a federation');
    }
    
    university.parent = federation._id;
    await university.save();
    
    await logActivity({
        userId: req.user._id,
        action: 'update',
        entityType: 'Organization',
        entityId: federation._id.toString(),
        details: `Added ${university.name} to federation ${federation.name}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
    });
    
    res.json({ message: `${university.name} added to ${federation.name}`, university });
});

// @desc    Remove university from federation
// @route   DELETE /api/organizations/:id/members/:universityId
// @access  Federation Admin or Super Admin
const removeMemberUniversity = asyncHandler(async (req, res) => {
    const federation = await Organization.findById(req.params.id);
    const university = await Organization.findById(req.params.universityId);
    
    if (!federation || !university) {
        res.status(404);
        throw new Error('Federation or university not found');
    }
    
    if (university.parent?.toString() !== federation._id.toString()) {
        res.status(400);
        throw new Error('University is not a member of this federation');
    }
    
    university.parent = null;
    await university.save();
    
    await logActivity({
        userId: req.user._id,
        action: 'update',
        entityType: 'Organization',
        entityId: federation._id.toString(),
        details: `Removed ${university.name} from federation ${federation.name}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
    });
    
    res.json({ message: `${university.name} removed from ${federation.name}` });
});

// @desc    Get all federations (for dropdowns)
// @route   GET /api/organizations/federations
// @access  Public or Admin
const getFederations = asyncHandler(async (req, res) => {
    const federations = await Organization.find({ type: 'federation', status: 'active' })
        .select('name code logo')
        .sort({ name: 1 });
    
    res.json(federations);
});

// @desc    Get universities (optionally filtered by federation)
// @route   GET /api/organizations/universities
// @access  Public or Admin
const getUniversities = asyncHandler(async (req, res) => {
    const { federation } = req.query;
    const query = { type: 'university', status: 'active' };
    
    if (federation) {
        query.parent = federation;
    }
    
    const universities = await Organization.find(query)
        .select('name code logo parent')
        .populate('parent', 'name code')
        .sort({ name: 1 });
    
    res.json(universities);
});

// @desc    Assign admin to organization
// @route   POST /api/organizations/:id/assign-admin
// @access  Super Admin
const assignAdminToOrganization = asyncHandler(async (req, res) => {
    const { adminId } = req.body;
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }
    
    const admin = await User.findById(adminId);
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin user not found');
    }
    
    if (admin.role !== 'admin') {
        res.status(400);
        throw new Error('User must be an admin');
    }
    
    // Update admin's organization
    admin.organization = organization._id;
    await admin.save();
    
    // Log activity
    await logActivity({
        userId: req.user._id,
        action: 'update',
        entityType: 'Organization',
        entityId: organization._id.toString(),
        details: `Assigned admin ${admin.name} to ${organization.name}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
    });
    
    res.json({ 
        message: `${admin.name} has been assigned as admin of ${organization.name}`,
        admin: {
            _id: admin._id,
            name: admin.name,
            email: admin.email
        }
    });
});

module.exports = {
    getAllOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationStats,
    addMemberUniversity,
    removeMemberUniversity,
    getFederations,
    getUniversities,
    assignAdminToOrganization
};
