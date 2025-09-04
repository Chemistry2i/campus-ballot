const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  suspendUser,
  activateUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  searchUsers,
  changeUserRole,
  getUserVotingHistory,
  getUserNotifications,
  deactivateOwnAccount,
  reactivateOwnAccount,
  exportUsers
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/authMiddleware');


// ------------------------
// ✅ Specific "me" routes
// ------------------------
router.get('/me/profile', protect, getCurrentUserProfile);
router.put('/me/profile', protect, updateCurrentUserProfile);

router.get('/me/votes', protect, getUserVotingHistory);
router.get('/me/notifications', protect, getUserNotifications);
router.put('/me/deactivate', protect, deactivateOwnAccount);
router.put('/me/reactivate', protect, reactivateOwnAccount);


// ------------------------
// ✅ Admin-specific routes
// ------------------------

// Search and export routes (must come before dynamic `/:id`)
router.get('/search', protect, adminOnly, searchUsers);
router.get('/export', protect, adminOnly, exportUsers);

// General admin routes
router.get('/', protect, adminOnly, getAllUsers);

router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUserById);
router.delete('/:id', protect, adminOnly, deleteUserById);

router.put('/:id/suspend', protect, adminOnly, suspendUser);
router.put('/:id/activate', protect, adminOnly, activateUser);
router.put('/:id/role', protect, adminOnly, changeUserRole);


module.exports = router;
