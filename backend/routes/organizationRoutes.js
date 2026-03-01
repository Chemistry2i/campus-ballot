const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/organizationController');

const { protect, adminOnly, superAdminOnly, federationAdminOnly } = require('../middleware/authMiddleware');

// Public routes for dropdowns (registration, etc.)
router.get('/federations', getFederations);
router.get('/universities', getUniversities);

// Protected routes
// Get all organizations (filtered by role)
router.get('/', protect, adminOnly, getAllOrganizations);

// Get single organization
router.get('/:id', protect, adminOnly, getOrganizationById);

// Get organization statistics
router.get('/:id/stats', protect, adminOnly, getOrganizationStats);

// Create organization (super admin or federation admin)
router.post('/', protect, federationAdminOnly, createOrganization);

// Update organization
router.put('/:id', protect, adminOnly, updateOrganization);

// Delete organization (super admin only)
router.delete('/:id', protect, superAdminOnly, deleteOrganization);

// Federation membership management
router.post('/:id/members', protect, federationAdminOnly, addMemberUniversity);
router.delete('/:id/members/:universityId', protect, federationAdminOnly, removeMemberUniversity);

// Admin assignment (super admin only)
router.post('/:id/assign-admin', protect, superAdminOnly, assignAdminToOrganization);

module.exports = router;
