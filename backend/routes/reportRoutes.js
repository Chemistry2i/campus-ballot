const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getReportSummary } = require('../controllers/reportController');

router.get('/summary', protect, adminOnly, getReportSummary);

module.exports = router;