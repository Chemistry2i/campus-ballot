const express = require('express');
const router = express.Router();
const { protect, adminOnly, superAdminOnly } = require('../middleware/authMiddleware');
const {
  getAllLogs,
  createLog,
  deleteLog,
  searchLogs,
  clearAllLogs
} = require('../controllers/logController');

// Middleware to allow both admin and super_admin
const adminOrSuperAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or Super Admin only.' });
  }
};

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

// Delete all logs
router.delete('/', protect, adminOnly, clearAllLogs);

// Delete a specific log
router.delete('/:id', protect, adminOnly, deleteLog);

module.exports = router;
