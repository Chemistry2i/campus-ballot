const asyncHandler = require("express-async-handler");
const Agent = require("../models/Agent");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// @desc    Get all agents for the current candidate
// @route   GET /api/candidates/agents
// @access  Protected (Candidate only)
const getMyAgents = asyncHandler(async (req, res) => {
  try {
    console.log('[getMyAgents] User:', req.user?._id);
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Find the candidate record for this user
    const candidacy = await Candidate.findOne({ user: req.user._id, status: 'approved' });
    
    console.log('[getMyAgents] Candidacy:', candidacy ? 'Found' : 'Not found');
    
    if (!candidacy) {
      return res.json([]);
    }

    const agents = await Agent.find({ 
      candidate: req.user._id,
      election: candidacy.election,
      status: { $ne: 'removed' }
    })
      .populate('user', 'name email phone profilePicture studentId faculty course yearOfStudy')
      .populate('election', 'title')
      .sort({ createdAt: -1 });

    console.log('[getMyAgents] Agents found:', agents.length);

    // Transform agents to include user info at top level
    const formattedAgents = agents.map(agent => ({
      _id: agent._id,
      name: agent.user?.name || 'Unknown',
      email: agent.user?.email || '',
      phone: agent.user?.phone || '',
      profilePicture: agent.user?.profilePicture || null,
      studentId: agent.user?.studentId || '',
      faculty: agent.user?.faculty || '',
      course: agent.user?.course || '',
      yearOfStudy: agent.user?.yearOfStudy || '',
      userId: agent.user?._id,
      role: agent.agentRole,
      status: agent.status,
      permissions: agent.permissions,
      tasksCompleted: agent.tasksCompleted,
      tasksActive: agent.tasksActive,
      notes: agent.notes,
      joinedDate: agent.createdAt,
      election: agent.election?.title || ''
    }));

    res.json(formattedAgents);
  } catch (error) {
    console.error('[getMyAgents] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search students to add as agents
// @route   GET /api/candidates/agents/search-students
// @access  Protected (Candidate only)
const searchStudentsForAgent = asyncHandler(async (req, res) => {
  try {
    const { q } = req.query;
    
    console.log('[Agent Search] Query:', q, 'User:', req.user?._id);
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Find the candidate record for this user (any status for now, just need election context)
    const candidacy = await Candidate.findOne({ user: req.user._id });
    
    console.log('[Agent Search] Candidacy found:', candidacy ? 'Yes' : 'No');
    
    let excludeUserIds = [req.user._id]; // Always exclude the candidate themselves
    
    // If has approved candidacy, also exclude existing agents
    if (candidacy && candidacy.status === 'approved') {
      const existingAgents = await Agent.find({ 
        candidate: req.user._id, 
        election: candidacy.election,
        status: { $ne: 'removed' }
      }).select('user');
      
      excludeUserIds = [...excludeUserIds, ...existingAgents.map(a => a.user)];
    }

    // Search for verified students by student ID or email only
    const students = await User.find({
      _id: { $nin: excludeUserIds },
      role: 'student',
      accountStatus: 'active',
      isVerified: true,
      $or: [
        { studentId: { $regex: `^${q}`, $options: 'i' } }, // Starts with for student ID
        { email: { $regex: `^${q}`, $options: 'i' } }      // Starts with for email
      ]
    })
      .select('name email studentId faculty course yearOfStudy profilePicture phone isVerified')
      .limit(10);

    console.log('[Agent Search] Found verified students:', students.length);
    res.json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add a new agent
// @route   POST /api/candidates/agents
// @access  Protected (Candidate only)
const addAgent = asyncHandler(async (req, res) => {
  try {
    const { userId, agentRole, permissions, notes } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the candidate record for this user
    const candidacy = await Candidate.findOne({ user: req.user._id, status: 'approved' });
    
    if (!candidacy) {
      return res.status(403).json({ message: "You must be an approved candidate to add agents" });
    }

    // Check maximum agent limit (3 agents per candidate)
    const existingAgentsCount = await Agent.countDocuments({
      candidate: req.user._id,
      status: { $nin: ['removed', 'rejected'] }
    });

    if (existingAgentsCount >= 3) {
      return res.status(400).json({ 
        message: "Maximum agent limit reached. You can only have 3 agents at a time." 
      });
    }

    // Check if user exists and is a student
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: "Only students can be added as agents" });
    }

    // Check if this user is already an agent for this election
    const existingAgent = await Agent.findOne({
      user: userId,
      election: candidacy.election,
      status: { $ne: 'removed' }
    });

    if (existingAgent) {
      return res.status(400).json({ message: "This student is already an agent for another candidate in this election" });
    }

    // Create the agent record
    const agent = await Agent.create({
      user: userId,
      candidate: req.user._id,
      election: candidacy.election,
      agentRole: agentRole || 'agent',
      permissions: permissions || {
        updateMaterials: false,
        postUpdates: false,
        respondToQuestions: false,
        viewStatistics: false,
        manageTasks: false
      },
      notes: notes || ''
    });

    // Add 'agent' to the student's additionalRoles
    await User.findByIdAndUpdate(userId, {
      $addToSet: { additionalRoles: 'agent' },
      $set: {
        'agentInfo.assignedCandidateId': req.user._id,
        'agentInfo.permissions': Object.keys(permissions || {}).filter(key => permissions[key])
      }
    });

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'create',
      entityType: 'Agent',
      entityId: agent._id.toString(),
      description: `Added ${student.name} as ${agentRole || 'agent'} for campaign`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    // Populate and return the agent
    const populatedAgent = await Agent.findById(agent._id)
      .populate('user', 'name email phone profilePicture studentId faculty course yearOfStudy');

    res.status(201).json({
      message: "Agent added successfully",
      agent: {
        _id: populatedAgent._id,
        name: populatedAgent.user?.name,
        email: populatedAgent.user?.email,
        phone: populatedAgent.user?.phone,
        profilePicture: populatedAgent.user?.profilePicture,
        studentId: populatedAgent.user?.studentId,
        faculty: populatedAgent.user?.faculty,
        userId: populatedAgent.user?._id,
        role: populatedAgent.agentRole,
        status: populatedAgent.status,
        permissions: populatedAgent.permissions,
        joinedDate: populatedAgent.createdAt
      }
    });
  } catch (error) {
    console.error('Error adding agent:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update an agent
// @route   PUT /api/candidates/agents/:id
// @access  Protected (Candidate only)
const updateAgent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { agentRole, permissions, notes } = req.body;

    const agent = await Agent.findById(id);
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Verify the agent belongs to this candidate
    if (agent.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own agents" });
    }

    // Update agent
    agent.agentRole = agentRole || agent.agentRole;
    agent.permissions = permissions || agent.permissions;
    agent.notes = notes !== undefined ? notes : agent.notes;
    await agent.save();

    // Update user's agentInfo permissions
    await User.findByIdAndUpdate(agent.user, {
      $set: {
        'agentInfo.permissions': Object.keys(agent.permissions).filter(key => agent.permissions[key])
      }
    });

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'Agent',
      entityId: agent._id.toString(),
      description: `Updated agent role to ${agentRole}`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    res.json({ message: "Agent updated successfully", agent });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update agent status (activate/deactivate)
// @route   PATCH /api/candidates/agents/:id/status
// @access  Protected (Candidate only)
const updateAgentStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const agent = await Agent.findById(id);
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Verify the agent belongs to this candidate
    if (agent.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own agents" });
    }

    agent.status = status;
    await agent.save();

    res.json({ message: "Agent status updated successfully", agent });
  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove an agent
// @route   DELETE /api/candidates/agents/:id
// @access  Protected (Candidate only)
const removeAgent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id).populate('user', 'name');
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Verify the agent belongs to this candidate
    if (agent.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only remove your own agents" });
    }

    // Mark as removed instead of deleting (soft delete)
    agent.status = 'removed';
    await agent.save();

    // Check if user has any other active agent assignments
    const otherAssignments = await Agent.find({
      user: agent.user._id,
      status: 'active',
      _id: { $ne: agent._id }
    });

    // If no other agent assignments, remove 'agent' from additionalRoles
    if (otherAssignments.length === 0) {
      await User.findByIdAndUpdate(agent.user._id, {
        $pull: { additionalRoles: 'agent' },
        $unset: { agentInfo: '' }
      });
    }

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'delete',
      entityType: 'Agent',
      entityId: agent._id.toString(),
      description: `Removed ${agent.user?.name} from campaign team`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    res.json({ message: "Agent removed successfully" });
  } catch (error) {
    console.error('Error removing agent:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get agent statistics
// @route   GET /api/candidates/agents/stats
// @access  Protected (Candidate only)
const getAgentStats = asyncHandler(async (req, res) => {
  try {
    const candidacy = await Candidate.findOne({ user: req.user._id, status: 'approved' });
    
    if (!candidacy) {
      return res.json({
        totalAgents: 0,
        activeAgents: 0,
        coordinators: 0,
        seniorAgents: 0,
        agents: 0
      });
    }

    const stats = await Agent.aggregate([
      { 
        $match: { 
          candidate: req.user._id, 
          election: candidacy.election,
          status: { $ne: 'removed' }
        } 
      },
      {
        $group: {
          _id: null,
          totalAgents: { $sum: 1 },
          activeAgents: { 
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          coordinators: {
            $sum: { $cond: [{ $eq: ['$agentRole', 'coordinator'] }, 1, 0] }
          },
          seniorAgents: {
            $sum: { $cond: [{ $eq: ['$agentRole', 'senior-agent'] }, 1, 0] }
          },
          agents: {
            $sum: { $cond: [{ $eq: ['$agentRole', 'agent'] }, 1, 0] }
          },
          totalTasksCompleted: { $sum: '$tasksCompleted' },
          totalTasksActive: { $sum: '$tasksActive' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalAgents: 0,
      activeAgents: 0,
      coordinators: 0,
      seniorAgents: 0,
      agents: 0,
      totalTasksCompleted: 0,
      totalTasksActive: 0
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get agent's own dashboard info
// @route   GET /api/agent/dashboard
// @access  Protected (Agent only)
const getAgentDashboard = asyncHandler(async (req, res) => {
  try {
    console.log('[getAgentDashboard] Agent user ID:', req.user._id);
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Find the agent record for this user
    const agent = await Agent.findOne({ 
      user: req.user._id,
      status: { $ne: 'removed' }
    })
      .populate('user', 'name email phone profilePicture studentId faculty course yearOfStudy')
      .populate('candidate', 'name email photo symbol position party description')
      .populate('election', 'title')
      .sort({ createdAt: -1 });

    console.log('[getAgentDashboard] Agent found:', agent ? 'Yes' : 'No');

    if (!agent) {
      return res.json({
        agent: null,
        stats: {
          totalCandidates: 0,
          activeTasks: 0,
          completedTasks: 0,
          tasksCompleted: 0,
          tasksActive: 0
        }
      });
    }

    // Format agent info
    const agentInfo = {
      _id: agent._id,
      name: agent.user?.name || 'Unknown',
      email: agent.user?.email || '',
      phone: agent.user?.phone || '',
      profilePicture: agent.user?.profilePicture || null,
      studentId: agent.user?.studentId || '',
      faculty: agent.user?.faculty || '',
      course: agent.user?.course || '',
      yearOfStudy: agent.user?.yearOfStudy || '',
      userId: agent.user?._id,
      role: agent.agentRole,
      status: agent.status,
      permissions: agent.permissions,
      tasksCompleted: agent.tasksCompleted,
      tasksActive: agent.tasksActive,
      candidateName: agent.candidate?.name || 'Unknown',
      candidateEmail: agent.candidate?.email || '',
      candidatePhoto: agent.candidate?.photo || null,
      candidateSymbol: agent.candidate?.symbol || null,
      position: agent.candidate?.position || '',
      party: agent.candidate?.party || '',
      description: agent.candidate?.description || '',
      electionTitle: agent.election?.title || '',
      joinedDate: agent.createdAt,
      notes: agent.notes
    };

    res.json({
      agent: agentInfo,
      stats: {
        totalCandidates: 1,
        activeTasks: agent.tasksActive,
        completedTasks: agent.tasksCompleted,
        tasksCompleted: agent.tasksCompleted,
        tasksActive: agent.tasksActive
      }
    });
  } catch (error) {
    console.error('[getAgentDashboard] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get agent's own stats
// @route   GET /api/agent/stats
// @access  Protected (Agent only)
const getAgentPersonalStats = asyncHandler(async (req, res) => {
  try {
    console.log('[getAgentPersonalStats] Agent user ID:', req.user._id);
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Find the agent record for this user
    const agent = await Agent.findOne({ 
      user: req.user._id,
      status: { $ne: 'removed' }
    });

    console.log('[getAgentPersonalStats] Agent found:', agent ? 'Yes' : 'No');

    if (!agent) {
      return res.json({
        totalCandidates: 0,
        activeTasks: 0,
        completedTasks: 0,
        tasksActive: 0,
        tasksCompleted: 0,
        role: 'agent',
        status: 'inactive'
      });
    }

    res.json({
      totalCandidates: 1,
      activeTasks: agent.tasksActive || 0,
      completedTasks: agent.tasksCompleted || 0,
      tasksActive: agent.tasksActive || 0,
      tasksCompleted: agent.tasksCompleted || 0,
      role: agent.agentRole,
      status: agent.status,
      permissions: agent.permissions
    });
  } catch (error) {
    console.error('[getAgentPersonalStats] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// PERMISSION-ENFORCED CAMPAIGN FUNCTIONS
// ============================================

/**
 * Post a campaign message
 * Requires: manage_candidate_messages permission
 */
const postCampaignMessage = asyncHandler(async (req, res) => {
  try {
    const { candidateId, text, visibility } = req.body;

    if (!text || !candidateId) {
      return res.status(400).json({ error: 'text and candidateId are required' });
    }

    // Verify agent is assigned to this candidate
    const agentAssignment = await Agent.findOne({
      user: req.user._id,
      candidate: candidateId,
      status: 'active'
    });

    if (!agentAssignment) {
      return res.status(403).json({ error: 'You are not assigned to this candidate' });
    }

    // Check permission
    if (!agentAssignment.permissions?.postUpdates) {
      return res.status(403).json({ error: 'Permission denied: postUpdates' });
    }

    const CampaignMessage = require('../models/CampaignMessage');
    const message = await CampaignMessage.create({
      candidateId,
      agentId: req.user._id,
      text,
      visibility: visibility || 'public',
      status: 'published'
    });

    res.status(201).json({
      success: true,
      message: 'Campaign message posted',
      data: message
    });
  } catch (error) {
    console.error('[postCampaignMessage]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get campaign messages for a candidate
 */
const getCampaignMessages = asyncHandler(async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify agent is assigned
    const agentAssignment = await Agent.findOne({
      user: req.user._id,
      candidate: candidateId,
      status: 'active'
    });

    if (!agentAssignment) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const CampaignMessage = require('../models/CampaignMessage');
    const messages = await CampaignMessage.find({
      candidateId,
      status: 'published'
    })
      .sort({ postedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await CampaignMessage.countDocuments({ candidateId, status: 'published' });

    res.json({ success: true, count: messages.length, total, messages });
  } catch (error) {
    console.error('[getCampaignMessages]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Schedule a campaign event
 * Requires: manageTasks permission
 */
const scheduleCampaignEvent = asyncHandler(async (req, res) => {
  try {
    const { candidateId, name, location, startDateTime, endDateTime } = req.body;

    if (!candidateId || !name || !startDateTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify agent is assigned
    const agentAssignment = await Agent.findOne({
      user: req.user._id,
      candidate: candidateId,
      status: 'active'
    });

    if (!agentAssignment) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check permission
    if (!agentAssignment.permissions?.manageTasks) {
      return res.status(403).json({ error: 'Permission denied: manageTasks' });
    }

    const CampaignEvent = require('../models/CampaignEvent');
    const event = await CampaignEvent.create({
      candidateId,
      name,
      location,
      startDateTime: new Date(startDateTime),
      endDateTime: endDateTime ? new Date(endDateTime) : undefined,
      scheduledBy: {
        agentId: req.user._id,
        agentName: req.user.name,
        scheduledAt: new Date()
      },
      status: 'scheduled'
    });

    res.status(201).json({
      success: true,
      message: 'Event scheduled',
      data: event
    });
  } catch (error) {
    console.error('[scheduleCampaignEvent]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get campaign events for a candidate
 */
const getCampaignEvents = asyncHandler(async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Verify agent is assigned
    const agentAssignment = await Agent.findOne({
      user: req.user._id,
      candidate: candidateId,
      status: 'active'
    });

    if (!agentAssignment) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const CampaignEvent = require('../models/CampaignEvent');
    const events = await CampaignEvent.find({ candidateId })
      .sort({ startDateTime: 1 })
      .lean();

    res.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error('[getCampaignEvents]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get agent analytics
 * Requires: viewStatistics permission
 */
const getAgentAnalytics = asyncHandler(async (req, res) => {
  try {
    const agentUser = await Agent.findOne({ user: req.user._id, status: 'active' });

    if (!agentUser) {
      return res.status(400).json({ error: 'Not an active agent' });
    }

    if (!agentUser.permissions?.viewStatistics) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const CampaignMessage = require('../models/CampaignMessage');
    const CampaignEvent = require('../models/CampaignEvent');
    const Vote = require('../models/Vote');

    const messages = await CampaignMessage.countDocuments({ agentId: req.user._id });
    const events = await CampaignEvent.countDocuments({ candidateId: agentUser.candidate });
    const votes = await Vote.countDocuments({ candidateId: agentUser.candidate });

    res.json({
      success: true,
      analytics: {
        messagesPosted: messages,
        eventsScheduled: events,
        candidateVotes: votes,
        tasksPending: agentUser.tasksActive,
        tasksCompleted: agentUser.tasksCompleted
      }
    });
  } catch (error) {
    console.error('[getAgentAnalytics]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
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
};
