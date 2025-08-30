const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    suspendUser,
    activateUser,
    getCurrentUserProfile, // Assuming this is the same as getProfile
    updateCurrentUserProfile, // Assuming this is the same as updateProfile
    searchUsers,
    changeUserRole,
    getUserVotingHistory,
    getUserNotifications,
    deactivateOwnAccount,
    reactivateOwnAccount,
    exportUsers
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin: Get all users
router.get('/', protect, adminOnly, getAllUsers);

// Admin: Get a user by ID
router.get('/:id', protect, adminOnly, getUserById);

// Admin: Update a user by ID
router.put('/:id', protect, adminOnly, updateUserById);

// Admin: Delete a user by ID
router.delete('/:id', protect, adminOnly, deleteUserById);

// Admin: Suspend a user
router.put('/:id/suspend', protect, adminOnly, suspendUser);

// Admin: Activate a user
router.put('/:id/activate', protect, adminOnly, activateUser);

// User: Get own profile
router.get('/me/profile', protect, getCurrentUserProfile);

// User: Update own profile
router.put('/me/profile', protect, updateCurrentUserProfile);

// Admin: Search or filter users
router.get('/search', protect, adminOnly, searchUsers);

// Admin: Change user role
router.put('/:id/role', protect, adminOnly, changeUserRole);

// User: Get own voting history
router.get('/me/votes', protect, getUserVotingHistory);

// User: Get own notifications
router.get('/me/notifications', protect, getUserNotifications);

// User: Deactivate own account
router.put('/me/deactivate', protect, deactivateOwnAccount);

// User: Reactivate own account
router.put('/me/reactivate', protect, reactivateOwnAccount);

// Admin: Export users
router.get('/export', protect, adminOnly, exportUsers);


module.exports = router;