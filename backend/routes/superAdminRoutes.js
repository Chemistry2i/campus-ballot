const express = require('express');
const router = express.Router();
const { protect, superAdminOnly } = require('../middleware/authMiddleware');
const {
  getSystemSummary,
  getAllAdmins,
  createAdmin,
  updateAdminStatus,
  deleteAdmin
} = require('../controllers/superAdminController');

// System summary for dashboard
router.get('/reports/system-summary', protect, superAdminOnly, getSystemSummary);

// Admin management
router.get('/admins', protect, superAdminOnly, getAllAdmins);
router.post('/admins', protect, superAdminOnly, createAdmin);
router.put('/admins/:id/status', protect, superAdminOnly, updateAdminStatus);
router.delete('/admins/:id', protect, superAdminOnly, deleteAdmin);

module.exports = router;
