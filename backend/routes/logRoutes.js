const express = require('express');
const router = express.Router();

const {
  getAllLogs,
  getLogById,
  createLog,
  deleteLog,
  searchLogs
} = require('../controllers/logController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin: Get all logs
router.get('/', protect, adminOnly, getAllLogs);

// Admin: Search logs (MUST come before /:id route)
router.get('/search', protect, adminOnly, searchLogs);

// Admin: Get a log by ID
router.get('/:id', protect, adminOnly, getLogById);

// Admin: Create a log entry (optional, if logs are created manually)
router.post('/', protect, adminOnly, createLog);

// Admin: Delete a log entry
router.delete('/:id', protect, adminOnly, deleteLog);

module.exports = router;
