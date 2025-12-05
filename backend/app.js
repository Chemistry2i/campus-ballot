const express = require('express');
const router = express.Router();

const {
  getSystemSummary,
  getUserActivity,
  getElectionStats,
  getCandidateStats,
  getVoteStats,
  getAdminActivity,
  getRoleDistribution,
  getTopElections,
  getVoterDemographics,
  getAuditLogs,
} = require('../controllers/reportController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Super Admin: Get system summary (dashboard stats)
router.get('/reports/system-summary', protect, adminOnly, getSystemSummary);

// Super Admin: Get user activity logs
router.get('/reports/user-activity', protect, adminOnly, getUserActivity);

// Super Admin: Get election statistics
router.get('/reports/election-stats', protect, adminOnly, getElectionStats);

// Super Admin: Get candidate statistics
router.get('/reports/candidate-stats', protect, adminOnly, getCandidateStats);

// Super Admin: Get vote statistics
router.get('/reports/vote-stats', protect, adminOnly, getVoteStats);

// Super Admin: Get admin activity logs
router.get('/reports/admin-activity', protect, adminOnly, getAdminActivity);

// Super Admin: Get role distribution
router.get('/reports/role-distribution', protect, adminOnly, getRoleDistribution);

// Super Admin: Get top elections by participation
router.get('/reports/top-elections', protect, adminOnly, getTopElections);

// Super Admin: Get voter demographics
router.get('/reports/voter-demographics', protect, adminOnly, getVoterDemographics);

// Super Admin: Get audit logs
router.get('/audit-logs', protect, adminOnly, getAuditLogs);

// Add log routes
const logRoutes = require('./routes/logRoutes');
app.use('/api/logs', logRoutes);

module.exports = router;