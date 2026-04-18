const express = require("express");
const router = express.Router();
const { protect, hasRole } = require("../middleware/authMiddleware");
const checkAgentPermission = require("../middleware/checkAgentPermission");

const {
  getMyAgents,
  searchStudentsForAgent,
  addAgent,
  updateAgent,
  updateAgentStatus,
  removeAgent,
  getAgentStats,
  getAgentDashboard,
  getAgentPersonalStats,
  // New permission-enforced functions
  postCampaignMessage,
  getCampaignMessages,
  scheduleCampaignEvent,
  getCampaignEvents,
  getAgentAnalytics
} = require("../controllers/agentController");

// ============================================
// CANDIDATE-LEVEL AGENT MANAGEMENT
// ============================================
// All routes require authentication and candidate role
// Include 'student' since candidates have role='student' with additionalRoles=['candidate']
router.use(protect);
router.use(hasRole('student', 'candidate', 'admin', 'super_admin'));

// Agent routes - specific routes before generic ones
router.get("/stats", getAgentStats);
router.get("/search-students", searchStudentsForAgent);
router.get("/", getMyAgents);
router.post("/", addAgent);
router.put("/:id", updateAgent);
router.patch("/:id/status", updateAgentStatus);
router.delete("/:id", removeAgent);

// ============================================
// AGENT-LEVEL PERMISSION-ENFORCED OPERATIONS
// ============================================

/**
 * Campaign Messages Routes
 * POST/GET /api/agents/campaign/messages
 * Requires: postUpdates permission
 */
router.post(
  "/campaign/messages",
  checkAgentPermission(['postUpdates']),
  postCampaignMessage
);

router.get(
  "/campaign/messages/:candidateId",
  checkAgentPermission(),
  getCampaignMessages
);

/**
 * Campaign Events Routes
 * POST/GET /api/agents/campaign/events
 * Requires: manageTasks permission
 */
router.post(
  "/campaign/events",
  checkAgentPermission(['manageTasks']),
  scheduleCampaignEvent
);

router.get(
  "/campaign/events/:candidateId",
  checkAgentPermission(),
  getCampaignEvents
);

/**
 * Analytics Routes
 * GET /api/agents/campaign/analytics
 * Requires: viewStatistics permission
 */
router.get(
  "/campaign/analytics",
  checkAgentPermission(['viewStatistics']),
  getAgentAnalytics
);

module.exports = router;
