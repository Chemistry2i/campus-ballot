const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllLogs,
  createLog,
  deleteLog,
  searchLogs,
  clearAllLogs
} = require('../controllers/logController');

// Get log count
router.get('/count', protect, adminOnly, async (req, res) => {
  try {
    const Log = require('../models/Log');
    const count = await Log.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get log count', error: error.message });
  }
});

// Search logs
router.get('/search', protect, adminOnly, searchLogs);

// Get all logs
router.get('/', protect, adminOnly, getAllLogs);

// Create a new log
router.post('/', protect, adminOnly, createLog);

// Delete all logs
router.delete('/', protect, adminOnly, clearAllLogs);

// Delete a specific log
router.delete('/:id', protect, adminOnly, deleteLog);

module.exports = router;
