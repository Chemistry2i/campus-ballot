const express = require("express");
const router = express.Router();
const { protect, observerOnly, observerWithAccess } = require("../middleware/authMiddleware");
const {
  getObserverDashboard,
  getElectionStatistics,
  getElectionAuditLogs,
  getTurnoutTrends,
  getElectionCandidates,
  getAssignedElections,
  getElectionVoters,
  getIncidents,
  reportIncident,
  getNotifications,
  markNotificationAsRead
} = require("../controllers/observerController");

// All routes require authentication and observer role
router.use(protect);
router.use(observerOnly);

// Dashboard overview
router.get("/dashboard", getObserverDashboard);

// Get assigned elections
router.get("/assigned-elections", getAssignedElections);

// Notifications
router.get("/notifications", getNotifications);
router.post("/notifications/:notificationId/mark-read", markNotificationAsRead);

// Election-specific routes (with access check)
router.get("/elections/:electionId/statistics", observerWithAccess(true), getElectionStatistics);
router.get("/elections/:electionId/audit-logs", observerWithAccess(true), getElectionAuditLogs);
router.get("/elections/:electionId/turnout-trends", observerWithAccess(true), getTurnoutTrends);
router.get("/elections/:electionId/candidates", observerWithAccess(true), getElectionCandidates);
router.get("/elections/:electionId/voters", observerWithAccess(true), getElectionVoters);

// Incidents routes
router.get("/incidents", getIncidents);
router.post("/incidents", reportIncident);

module.exports = router;
