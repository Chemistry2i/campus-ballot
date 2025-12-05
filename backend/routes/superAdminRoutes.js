const express = require('express');
const router = express.Router();

const {
  getSystemSummary,
} = require('../controllers/reportController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Super Admin: Get system summary (dashboard stats)
router.get('/reports/system-summary', protect, adminOnly, getSystemSummary);

module.exports = router;
