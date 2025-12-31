const express = require('express');
const router = express.Router();
const { protect, adminOnly, superAdminOnly, hasRole } = require('../middleware/authMiddleware');
const {
  getAllLogs,
  createLog,
  deleteLog,
  searchLogs,
  clearAllLogs
} = require('../controllers/logController');

// Middleware to allow both admin and super_admin (for backward compatibility)
const adminOrSuperAdmin = hasRole('admin', 'super_admin');

// Get log count
router.get('/count', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    const Log = require('../models/Log');
    const count = await Log.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get log count', error: error.message });
  }
});

// Search logs
router.get('/search', protect, adminOrSuperAdmin, searchLogs);

// Get all logs
router.get('/', protect, adminOrSuperAdmin, getAllLogs);

// Create a new log
router.post('/', protect, adminOrSuperAdmin, createLog);

// Delete all logs (Super Admin only - admins cannot delete logs)
router.delete('/', protect, superAdminOnly, clearAllLogs);

// Delete a specific log (Super Admin only - admins cannot delete logs)
router.delete('/:id', protect, superAdminOnly, deleteLog);

module.exports = router;
