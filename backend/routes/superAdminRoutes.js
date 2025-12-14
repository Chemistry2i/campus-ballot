const express = require('express');
const router = express.Router();

const {
  getSystemSummary,
  getAllAdmins,
  createAdmin,
  updateAdminStatus,
  deleteAdmin
} = require('../controllers/superAdminController');

const { protect, superAdminOnly } = require('../middleware/authMiddleware');

// Super Admin: Get system summary (dashboard stats)
router.get('/reports/system-summary', protect, superAdminOnly, getSystemSummary);

// Super Admin: Manage admins
router.get('/admins', protect, superAdminOnly, getAllAdmins);
router.post('/admins', protect, superAdminOnly, createAdmin);
router.put('/admins/:id/status', protect, superAdminOnly, updateAdminStatus);
router.delete('/admins/:id', protect, superAdminOnly, deleteAdmin);

module.exports = router;
