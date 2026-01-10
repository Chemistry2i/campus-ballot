const express = require('express');
const router = express.Router();

const {
  getSystemSummary,
  getAllAdmins,
  createAdmin,
  updateAdminStatus,
  deleteAdmin,
  getAdminActivities,
  getAdminsList,
  createObserver,
  getAllObservers,
  updateObserver,
  deleteObserver,
  getObserverActivity
} = require('../controllers/superAdminController');
const backup = require('../controllers/backupController');

const { protect, superAdminOnly, hasRole } = require('../middleware/authMiddleware');

// Super Admin: Get system summary (dashboard stats)
router.get('/reports/system-summary', protect, superAdminOnly, getSystemSummary);

// Super Admin: Manage admins
router.get('/admins', protect, superAdminOnly, getAllAdmins);
router.post('/admins', protect, superAdminOnly, createAdmin);
router.put('/admins/:id/status', protect, superAdminOnly, updateAdminStatus);
router.delete('/admins/:id', protect, superAdminOnly, deleteAdmin);

// Admin & Super Admin: Activity monitoring (with role-based filtering)
router.get('/admin-activities', protect, hasRole('admin', 'super_admin'), getAdminActivities);
router.get('/admins-list', protect, superAdminOnly, getAdminsList);

// Super Admin: Manage observers
router.get('/observers', protect, superAdminOnly, getAllObservers);
router.post('/observers', protect, superAdminOnly, createObserver);
router.put('/observers/:id', protect, superAdminOnly, updateObserver);
router.delete('/observers/:id', protect, superAdminOnly, deleteObserver);
router.get('/observers/:id/activity', protect, superAdminOnly, getObserverActivity);

module.exports = router;

// Backup & Recovery endpoints (Super Admin only)
router.get('/backups', protect, superAdminOnly, backup.listBackups);
router.post('/backups/create', protect, superAdminOnly, backup.createBackup);
router.post('/backups/:id/restore', protect, superAdminOnly, backup.restoreBackup);
router.get('/backups/:id/download', protect, superAdminOnly, backup.downloadBackup);
router.delete('/backups/:id', protect, superAdminOnly, backup.deleteBackup);
router.get('/backup-schedule', protect, superAdminOnly, backup.getSchedule);
router.put('/backup-schedule', protect, superAdminOnly, backup.updateSchedule);
