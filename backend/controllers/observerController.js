const asyncHandler = require("express-async-handler");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Log = require("../models/Log");
const Notification = require("../models/Notification");

// Helper: Check if observer has access to election
const hasElectionAccess = (observer, electionId) => {
  if (observer.observerInfo?.accessLevel === 'full') {
    return true;
  }
  
  return observer.observerInfo?.assignedElections?.some(
    id => id.toString() === electionId.toString()
  );
};

// Helper: Calculate actual election status based on dates
const calculateElectionStatus = (election) => {
  const now = new Date();
  const startDate = new Date(election.startDate);
  const endDate = new Date(election.endDate);

  if (now < startDate) {
    return 'upcoming';
  } else if (now >= startDate && now <= endDate) {
    return 'ongoing';
  } else {
    return 'completed';
  }
};

// @desc    Get observer dashboard overview
// @route   GET /api/observer/dashboard
// @access  Private (Observer)
const getObserverDashboard = asyncHandler(async (req, res) => {
  const observer = req.user;

  // Get assigned elections or all if full access
  let electionsQuery = {};
  if (observer.observerInfo?.accessLevel === 'election-specific') {
    electionsQuery = {
      _id: { $in: observer.observerInfo.assignedElections || [] }
    };
  }

  const elections = await Election.find(electionsQuery)
    .select('title description status startDate endDate positions')
    .sort('-createdAt')
    .populate('positions.candidates', 'name status');

  // Get counts - use actual status calculation from dates
  const activeElections = elections.filter(e => calculateElectionStatus(e) === 'ongoing').length;
  const upcomingElections = elections.filter(e => calculateElectionStatus(e) === 'upcoming').length;
  const completedElections = elections.filter(e => calculateElectionStatus(e) === 'completed').length;

  // Get voting statistics for all assigned elections
  const assignedElectionIds = elections.map(e => e._id);

  // Get voting activity by hour for today (all assigned elections) in EAT (UTC+3)
  const now = new Date();
  // Calculate EAT offset
  const eatOffsetMs = 3 * 60 * 60 * 1000;
  const eatToday = new Date(now.getTime() + eatOffsetMs);
  eatToday.setHours(0, 0, 0, 0);
  // Get UTC start of EAT day
  const utcStartOfEatDay = new Date(eatToday.getTime() - eatOffsetMs);

  const hourlyActivity = await Vote.aggregate([
    {
      $match: {
        election: { $in: assignedElectionIds },
        createdAt: { $gte: utcStartOfEatDay }
      }
    },
    {
      $addFields: {
        eatHour: {
          $mod: [
            { $add: [ { $hour: '$createdAt' }, 3 ] },
            24
          ]
        }
      }
    },
    {
      $group: {
        _id: { hour: '$eatHour' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.hour': 1 } }
  ]);

  // Format hourly activity data (create array for all hours 0-23 in EAT)
  const formattedHourlyActivity = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourData = hourlyActivity.find(item => item._id.hour === hour);
    formattedHourlyActivity.push({
      hour: hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      count: hourData ? hourData.count : 0
    });
  }

  // Get position statistics (candidates per position)
  const positionStatsMap = new Map();
  
  // Aggregate candidates per position using correct schema fields
  for (const election of elections) {
    if (Array.isArray(election.positions) && election.positions.length > 0) {
      for (const positionName of election.positions) {
        // Count candidates for this position in this election
        const candidateCount = await Candidate.countDocuments({
          election: election._id,
          position: positionName
        });
        if (candidateCount > 0) {
          if (positionStatsMap.has(positionName)) {
            positionStatsMap.get(positionName).candidateCount += candidateCount;
          } else {
            positionStatsMap.set(positionName, {
              positionName,
              candidateCount
            });
          }
        }
      }
    }
  }
  
  const positionStats = Array.from(positionStatsMap.values());

  // Calculate total votes cast
  const totalVotes = await Vote.countDocuments({
    electionId: { $in: elections.map(e => e._id) }
  });

  // Get unique voters across all elections
  const uniqueVoters = await Vote.distinct('userId', {
    electionId: { $in: elections.map(e => e._id) }
  });

  res.json({
    success: true,
    data: {
      overview: {
        totalElections: elections.length,
        activeElections,
        upcomingElections,
        completedElections,
        accessLevel: observer.observerInfo?.accessLevel || 'election-specific',
        assignedElectionsCount: observer.observerInfo?.assignedElections?.length || 0,
        totalVotes: totalVotes,
        totalUniqueVoters: uniqueVoters.length
      },
      elections: elections.map(e => ({
        id: e._id,
        title: e.title,
        status: e.status,
        startDate: e.startDate,
        endDate: e.endDate,
        positionsCount: e.positions?.length || 0
      })),
      votingStats: {
        hourlyActivity: formattedHourlyActivity,
        totalVotesToday: formattedHourlyActivity.reduce((sum, item) => sum + item.count, 0),
        peakHour: formattedHourlyActivity.reduce((max, item) => 
          item.count > max.count ? item : max, 
          { hour: 0, time: '00:00', count: 0 }
        )
      },
      positionStats: positionStats.slice(0, 10) // Limit to top 10 positions for chart
    }
  });
});

// @desc    Get real-time election statistics
// @route   GET /api/observer/elections/:electionId/statistics
// @access  Private (Observer)
const getElectionStatistics = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const observer = req.user;

  // Check access
  if (!hasElectionAccess(observer, electionId)) {
    res.status(403);
    throw new Error("Access denied: Not assigned to this election");
  }

  const election = await Election.findById(electionId)
    .populate('positions.candidates', 'name photo symbol position');

  if (!election) {
    res.status(404);
    throw new Error("Election not found");
  }

  // Get eligible voters count - students with active accounts who are verified
  const eligibleVoters = await User.countDocuments({
    role: 'student',
    accountStatus: 'active',
    isVerified: true
  });

  // Get votes count
  const votesCount = await Vote.countDocuments({ election: election._id });

  // Get unique voters count
  const uniqueVoters = await Vote.distinct('user', { election: election._id });
  const uniqueVotersCount = uniqueVoters.length;

  // Calculate turnout
  const turnoutPercentage = eligibleVoters > 0 
    ? ((uniqueVotersCount / eligibleVoters) * 100).toFixed(2)
    : 0;

  // Get votes by position with candidate details
  const votesByCandidate = await Vote.aggregate([
    { $match: { election: election._id } },
    { $group: { 
      _id: '$candidate',
      position: { $first: '$position' },
      totalVotes: { $sum: 1 }
    }},
    { $sort: { totalVotes: -1 } }
  ]);

  // Get candidate details and merge with vote counts
  const candidatesWithVotes = await Promise.all(
    votesByCandidate.map(async (voteData) => {
      const candidate = await Candidate.findById(voteData._id).select('name photo symbol position');
      return {
        _id: voteData._id,
        name: candidate?.name || 'Abstain',
        photo: candidate?.photo,
        symbol: candidate?.symbol,
        position: voteData.position,
        votes: voteData.totalVotes
      };
    })
  );

  // Get votes by position summary
  const votesByPosition = await Vote.aggregate([
    { $match: { election: election._id } },
    { $group: { 
      _id: '$position',
      totalVotes: { $sum: 1 }
    }}
  ]);

  // Get total candidates count for this election (only approved candidates)
  const candidatesCount = await Candidate.countDocuments({ 
    election: election._id,
    status: 'approved'
  });

  res.json({
    success: true,
    data: {
      election: {
        id: election._id,
        title: election.title,
        status: calculateElectionStatus(election),
        startDate: election.startDate,
        endDate: election.endDate,
        calculatedStatus: calculateElectionStatus(election)
      },
      statistics: {
        eligibleVoters,
        totalVotesCast: votesCount,
        uniqueVoters: uniqueVotersCount,
        turnoutPercentage: parseFloat(turnoutPercentage),
        positionsCount: election.positions?.length || 0,
        candidatesCount,
        votesByPosition: votesByPosition.map(v => ({
          position: v._id,
          totalVotes: v.totalVotes
        })),
        topCandidates: candidatesWithVotes.slice(0, 10)
      }
    }
  });
});

// @desc    Get audit logs for election
// @route   GET /api/observer/elections/:electionId/audit-logs
// @access  Private (Observer)
const getElectionAuditLogs = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const observer = req.user;
  const { page = 1, limit = 50, action, userId } = req.query;

  // Check access
  if (!hasElectionAccess(observer, electionId)) {
    res.status(403);
    throw new Error("Access denied: Not assigned to this election");
  }

  // Find logs for this election (entityType: 'Election', entityId: electionId)
  const query = {
    entityType: 'Election',
    entityId: electionId
  };
  if (action) {
    query.action = action;
  }
  if (userId) {
    query.user = userId;
  }
  const logs = await Log.find(query)
    .populate('user', 'name email role')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const total = await Log.countDocuments(query);
  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get voter turnout trends (time-based, anonymized)
// @route   GET /api/observer/elections/:electionId/turnout-trends
// @access  Private (Observer)
const getTurnoutTrends = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const observer = req.user;
  const { interval = 'hourly' } = req.query; // hourly, daily

  // Check access
  if (!hasElectionAccess(observer, electionId)) {
    res.status(403);
    throw new Error("Access denied: Not assigned to this election");
  }

  const election = await Election.findById(electionId);
  
  if (!election) {
    res.status(404);
    throw new Error("Election not found");
  }

  // Group votes by time interval
  let dateFormat;
  if (interval === 'hourly') {
    dateFormat = {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' },
      hour: { $hour: '$timestamp' }
    };
  } else {
    dateFormat = {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' }
    };
  }

  const trends = await Vote.aggregate([
    { $match: { electionId: election._id } },
    {
      $group: {
        _id: dateFormat,
        count: { $sum: 1 },
        uniqueVoters: { $addToSet: '$voterId' }
      }
    },
    {
      $project: {
        _id: 1,
        votesCount: '$count',
        uniqueVotersCount: { $size: '$uniqueVoters' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      interval,
      trends
    }
  });
});

// @desc    Get candidates overview for election
// @route   GET /api/observer/elections/:electionId/candidates
// @access  Private (Observer)
const getElectionCandidates = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const observer = req.user;

  // Check access
  if (!hasElectionAccess(observer, electionId)) {
    res.status(403);
    throw new Error("Access denied: Not assigned to this election");
  }

  const election = await Election.findById(electionId);

  if (!election) {
    res.status(404);
    throw new Error("Election not found");
  }

  // For each position, fetch candidates from Candidate model
  const candidatesData = await Promise.all(
    election.positions.map(async (positionName, idx) => {
      const candidates = await Candidate.find({
        election: election._id,
        position: positionName
      }).populate('user', 'name email faculty course yearOfStudy');
      return {
        positionId: idx, // index as ID
        positionTitle: positionName,
        candidates: candidates.map(candidate => ({
          id: candidate._id,
          name: candidate.user?.name,
          email: candidate.user?.email,
          faculty: candidate.user?.faculty,
          course: candidate.user?.course,
          yearOfStudy: candidate.user?.yearOfStudy,
          status: candidate.status,
          submittedAt: candidate.createdAt
        }))
      };
    })
  );

  res.json({
    success: true,
    data: {
      election: {
        id: election._id,
        title: election.title
      },
      positions: candidatesData
    }
  });
});

// @desc    Get assigned elections for observer
// @route   GET /api/observer/assigned-elections
// @access  Private (Observer)
const getAssignedElections = asyncHandler(async (req, res) => {
  const observer = req.user;

  let electionsQuery = {};
  if (observer.observerInfo?.accessLevel === 'election-specific') {
    electionsQuery = {
      _id: { $in: observer.observerInfo.assignedElections || [] }
    };
  }

  const elections = await Election.find(electionsQuery)
    .select('title description status startDate endDate positions')
    .sort('-startDate');

  // Calculate actual status based on dates and add more details
  const electionsWithCalculatedStatus = elections.map(election => {
    const calculatedStatus = calculateElectionStatus(election);
    return {
      _id: election._id,
      title: election.title,
      description: election.description,
      status: calculatedStatus, // Use calculated status
      storedStatus: election.status, // Keep original for reference
      startDate: election.startDate,
      endDate: election.endDate,
      positions: election.positions
    };
  });

  res.json({
    success: true,
    data: {
      accessLevel: observer.observerInfo?.accessLevel || 'election-specific',
      elections: electionsWithCalculatedStatus
    }
  });
});

// @desc    Get eligible voters for an election
// @route   GET /api/observer/elections/:electionId/voters
// @access  Private (Observer with access)
const getElectionVoters = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const { page = 1, limit = 50, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
  const observer = req.user;

  // Check observer access to election
  if (!hasElectionAccess(observer, electionId)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this election'
    });
  }

  // Get election to verify it exists
  const election = await Election.findById(electionId);
  if (!election) {
    return res.status(404).json({
      success: false,
      message: 'Election not found'
    });
  }

  // Get votes for this election to count participating voters - use 'user' field not 'voter'
  const votes = await Vote.find({ election: electionId })
    .select('user')
    .lean();

  const votedUserIds = [...new Set(votes.map(v => v.user.toString()))];

  // Build search query for students
  let studentQuery = {
    role: 'student',
    accountStatus: 'active',
    isVerified: true
  };

  // Add search functionality
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    studentQuery.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { studentId: searchRegex }
    ];
  }

  // Get total count for pagination
  const totalVoters = await User.countDocuments(studentQuery);

  // Build sort object
  let sortObj = {};
  if (sortBy === 'name') {
    sortObj.name = sortOrder === 'desc' ? -1 : 1;
  } else if (sortBy === 'email') {
    sortObj.email = sortOrder === 'desc' ? -1 : 1;
  } else if (sortBy === 'createdAt') {
    sortObj.createdAt = sortOrder === 'desc' ? -1 : 1;
  } else {
    sortObj.name = 1; // Default sort
  }

  // Get paginated students who should be eligible voters
  const eligibleVoters = await User.find(studentQuery)
    .select('_id name email phone accountStatus createdAt studentId faculty course yearOfStudy')
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Mark who voted
  const votersData = eligibleVoters.map(voter => ({
    _id: voter._id,
    name: voter.name,
    email: voter.email,
    phone: voter.phone || 'N/A',
    studentId: voter.studentId,
    faculty: voter.faculty,
    course: voter.course,
    yearOfStudy: voter.yearOfStudy,
    accountStatus: voter.accountStatus,
    registeredAt: voter.createdAt,
    hasVoted: votedUserIds.includes(voter._id.toString())
  }));

  // Get overall statistics (not just for current page)
  const totalEligibleAll = await User.countDocuments({
    role: 'student',
    accountStatus: 'active',
    isVerified: true
  });
  const totalVoted = votedUserIds.length;
  const turnoutPercentage = totalEligibleAll > 0 ? ((totalVoted / totalEligibleAll) * 100).toFixed(2) : 0;

  res.json({
    success: true,
    data: {
      election: {
        id: election._id,
        title: election.title,
        status: election.status
      },
      statistics: {
        totalEligible: totalEligibleAll,
        totalVoted,
        pendingVoters: totalEligibleAll - totalVoted,
        turnoutPercentage: parseFloat(turnoutPercentage)
      },
      voters: votersData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVoters / limit),
        totalVoters,
        limit: parseInt(limit),
        hasNext: page * limit < totalVoters,
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Get incidents for elections
// @route   GET /api/observer/incidents
// @access  Private (Observer)
const getIncidents = asyncHandler(async (req, res) => {
  const observer = req.user;
  const { electionId, status } = req.query;

  // Build query based on observer access
  let logsQuery = {
    $or: [
      { type: 'election_incident' },
      { type: 'system_alert' },
      { type: 'security_issue' }
    ]
  };

  if (electionId && hasElectionAccess(observer, electionId)) {
    logsQuery.election = electionId;
  } else if (observer.observerInfo?.accessLevel === 'election-specific') {
    // Only get logs from assigned elections
    logsQuery.election = { $in: observer.observerInfo.assignedElections || [] };
  }

  if (status) {
    logsQuery.severity = status;
  }

  const incidents = await Log.find(logsQuery)
    .populate('election', 'title status')
    .populate('user', 'name email role')
    .select('type severity description election user createdAt data')
    .sort('-createdAt')
    .lean();

  // Format incidents with more detail
  const formattedIncidents = incidents.map(incident => ({
    _id: incident._id,
    title: incident.description || 'Incident Report',
    type: incident.type,
    severity: incident.severity || 'low',
    election: incident.election?.title || 'Unknown Election',
    electionId: incident.election?._id,
    description: incident.description,
    reportedBy: incident.user?.name || 'System',
    reportedByRole: incident.user?.role,
    timestamp: incident.createdAt,
    data: incident.data
  }));

  // Get statistics
  const severityCount = {
    critical: formattedIncidents.filter(i => i.severity === 'critical').length,
    high: formattedIncidents.filter(i => i.severity === 'high').length,
    medium: formattedIncidents.filter(i => i.severity === 'medium').length,
    low: formattedIncidents.filter(i => i.severity === 'low').length
  };

  res.json({
    success: true,
    data: {
      statistics: {
        total: formattedIncidents.length,
        ...severityCount
      },
      incidents: formattedIncidents
    }
  });
});

// @desc    Report an incident
// @route   POST /api/observer/incidents
// @access  Private (Observer)
const reportIncident = asyncHandler(async (req, res) => {
  const { electionId, title, description, severity, type } = req.body;
  const observer = req.user;

  // Validate required fields
  if (!electionId || !title || !description || !severity) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Check observer access
  if (!hasElectionAccess(observer, electionId)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this election'
    });
  }

  // Create incident log
  const incident = await Log.create({
    type: type || 'election_incident',
    severity,
    description,
    election: electionId,
    user: observer._id,
    data: {
      title,
      reportedAt: new Date()
    }
  });

  const populatedIncident = await incident.populate([
    { path: 'election', select: 'title status' },
    { path: 'user', select: 'name email role' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Incident reported successfully',
    data: {
      _id: populatedIncident._id,
      title: populatedIncident.data?.title,
      description: populatedIncident.description,
      severity: populatedIncident.severity,
      election: populatedIncident.election?.title,
      timestamp: populatedIncident.createdAt
    }
  });
});

// @desc    Get notifications for observer
// @route   GET /api/observer/notifications
// @access  Private (Observer)
const getNotifications = asyncHandler(async (req, res) => {
  const observer = req.user;
  const { limit = 50, skip = 0 } = req.query;

  // Get notifications for this observer
  const notifications = await Notification.find({
    targetAudience: { $in: ['all', 'observers'] }
  })
    .select('title message type createdAt readBy')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  // Mark which ones are read by this observer
  const notificationsWithReadStatus = notifications.map(notif => ({
    ...notif,
    isRead: notif.readBy?.includes(observer._id.toString())
  }));

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    targetAudience: { $in: ['all', 'observers'] },
    readBy: { $ne: observer._id }
  });

  res.json({
    success: true,
    data: {
      notifications: notificationsWithReadStatus,
      unreadCount,
      total: notificationsWithReadStatus.length
    }
  });
});

// @desc    Mark notification as read
// @route   POST /api/observer/notifications/:notificationId/mark-read
// @access  Private (Observer)
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const observer = req.user;

  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { $addToSet: { readBy: observer._id } },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

module.exports = {
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
};
