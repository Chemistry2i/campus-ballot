const asyncHandler = require("express-async-handler");
const Election = require("../models/Election");
const VoterRecord = require("../models/Vote");
const Ballot = require("../models/Ballot");
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
  try {
    const observer = req.user;
    
    if (!observer) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

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

    if (!elections || !Array.isArray(elections)) {
      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalElections: 0,
            activeElections: 0,
            upcomingElections: 0,
            completedElections: 0,
            accessLevel: observer.observerInfo?.accessLevel || 'election-specific',
            assignedElectionsCount: 0,
            totalVotes: 0,
            totalUniqueVoters: 0,
            organization: observer.observerInfo?.organization || ''
          },
          elections: [],
          votingStats: {
            hourlyActivity: [],
            totalVotesToday: 0,
            peakHour: { hour: 0, time: '00:00', count: 0 }
          },
          positionStats: []
        }
      });
    }

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

    let hourlyActivity = [];
    try {
      hourlyActivity = await Ballot.aggregate([
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
    } catch (aggErr) {
      console.error('Hourly activity aggregation error:', aggErr);
      hourlyActivity = [];
    }

    // Format hourly activity data (create array for all hours 0-23 in EAT)
    const formattedHourlyActivity = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourData = hourlyActivity.find(item => item._id?.hour === hour);
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
          try {
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
          } catch (err) {
            console.error('Error counting candidates for position:', err);
          }
        }
      }
    }
    
    const positionStats = Array.from(positionStatsMap.values());

    // Calculate total votes cast - try multiple possible field names
    let totalVotes = 0;
    try {
      // Try with 'election' field first
      totalVotes = await Ballot.countDocuments({
        election: { $in: assignedElectionIds }
      });
    } catch (err1) {
      try {
        // Fallback to 'electionId'
        totalVotes = await Ballot.countDocuments({
          electionId: { $in: assignedElectionIds }
        });
      } catch (err2) {
        console.error('Error counting votes:', err2);
        totalVotes = 0;
      }
    }

    // Get unique voters across all elections
    let uniqueVoters = [];
    try {
      uniqueVoters = await VoterRecord.distinct('user', {
        election: { $in: assignedElectionIds }
      });
    } catch (err1) {
      try {
        uniqueVoters = await VoterRecord.distinct('studentId', {
          electionId: { $in: assignedElectionIds }
        });
      } catch (err2) {
        console.error('Error getting unique voters:', err2);
        uniqueVoters = [];
      }
    }

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
          totalUniqueVoters: Array.isArray(uniqueVoters) ? uniqueVoters.length : 0,
          organization: observer.observerInfo?.organization || observer.organization || observer.observerOrganization || observer.orgName || observer.companyName || observer.organizationName || ''
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
  } catch (error) {
    console.error('getObserverDashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dashboard data'
    });
  }
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
  const votesCount = await Ballot.countDocuments({ election: election._id });

  // Get unique voters count
  const uniqueVoters = await VoterRecord.distinct('user', { election: election._id });
  const uniqueVotersCount = uniqueVoters.length;

  // Calculate turnout
  const turnoutPercentage = eligibleVoters > 0 
    ? ((uniqueVotersCount / eligibleVoters) * 100).toFixed(2)
    : 0;

  // Get votes by position with candidate details
  const votesByCandidate = await Ballot.aggregate([
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
  const votesByPosition = await Ballot.aggregate([
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

  const trends = await Ballot.aggregate([
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
  const votes = await VoterRecord.find({ election: electionId })
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

// @desc    Export election voters list
// @route   GET /api/observer/elections/:electionId/voters/export
// @access  Private (Observer with access)
const exportElectionVoters = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const { format = 'csv', search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

  const election = await Election.findById(electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Build query
  let query = { role: 'voter', accountStatus: 'active' };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } }
    ];
  }

  // Get voters
  const voters = await User.find(query)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .select('name email studentId faculty phone accountStatus createdAt');

  // Check who has voted
  const votes = await VoterRecord.find({ election: electionId }).distinct('user');
  const votersWithStatus = voters.map(voter => ({
    name: voter.name,
    email: voter.email,
    studentId: voter.studentId || 'N/A',
    faculty: voter.faculty || 'N/A',
    phone: voter.phone || 'N/A',
    accountStatus: voter.accountStatus,
    registeredAt: voter.createdAt,
    hasVoted: votes.includes(voter._id.toString()) ? 'Yes' : 'No'
  }));

  if (format === 'csv') {
    // Generate CSV
    const fields = ['name', 'email', 'studentId', 'faculty', 'phone', 'accountStatus', 'registeredAt', 'hasVoted'];
    const csvHeader = fields.join(',') + '\n';
    const csvRows = votersWithStatus.map(voter => 
      fields.map(field => {
        const value = voter[field];
        if (field === 'registeredAt') {
          return new Date(value).toLocaleDateString();
        }
        return `"${value}"`;
      }).join(',')
    ).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=voters_${electionId}.csv`);
    res.send(csv);
  } else if (format === 'pdf') {
    // For PDF, return JSON with instructions to generate PDF on frontend
    // Or implement PDF generation using a library like pdfkit
    res.status(501);
    throw new Error('PDF export not yet implemented. Please use CSV format.');
  } else {
    res.status(400);
    throw new Error('Invalid export format. Use csv or pdf.');
  }
});

// @desc    Generate election report
// @route   GET /api/observer/elections/:electionId/reports/:reportType
// @access  Private (Observer with access)
const generateElectionReport = asyncHandler(async (req, res) => {
  const { electionId, reportType } = req.params;

  const election = await Election.findById(electionId).populate('positions');
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  let reportData = {};

  switch (reportType) {
    case 'summary':
      const totalVoters = await User.countDocuments({ role: 'voter', accountStatus: 'active' });
      const totalVotes = await Ballot.countDocuments({ election: electionId });
      const candidates = await Candidate.countDocuments({ election: electionId });
      
      reportData = {
        election: {
          title: election.title,
          description: election.description,
          startDate: election.startDate,
          endDate: election.endDate,
          status: calculateElectionStatus(election)
        },
        statistics: {
          totalEligibleVoters: totalVoters,
          totalVotesCast: totalVotes,
          turnoutPercentage: totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(2) : 0,
          totalCandidates: candidates,
          totalPositions: election.positions?.length || 0
        },
        timestamp: new Date()
      };
      break;

    case 'voters':
      const voters = await User.find({ role: 'voter', accountStatus: 'active' })
        .select('name email studentId faculty createdAt');
      const votedIds = await VoterRecord.find({ election: electionId }).distinct('user');
      
      reportData = {
        election: { title: election.title },
        totalVoters: voters.length,
        totalVoted: votedIds.length,
        turnoutPercentage: voters.length > 0 ? ((votedIds.length / voters.length) * 100).toFixed(2) : 0,
        voters: voters.map(v => ({
          ...v.toObject(),
          hasVoted: votedIds.includes(v._id.toString())
        })),
        timestamp: new Date()
      };
      break;

    case 'candidates':
      const allCandidates = await Candidate.find({ election: electionId })
        .populate('userId', 'name email studentId')
        .populate('position', 'title');
      
      reportData = {
        election: { title: election.title },
        totalCandidates: allCandidates.length,
        candidates: allCandidates.map(c => ({
          name: c.userId?.name,
          email: c.userId?.email,
          studentId: c.userId?.studentId,
          position: c.position?.title,
          manifesto: c.manifesto,
          status: c.status
        })),
        timestamp: new Date()
      };
      break;

    case 'results':
      const resultCandidates = await Candidate.find({ election: electionId })
        .populate('userId', 'name')
        .populate('position', 'title');
      
      const voteCounts = await Promise.all(
        resultCandidates.map(async (candidate) => {
          const voteCount = await Ballot.countDocuments({
            election: electionId,
            position: candidate.position._id,
            candidate: candidate._id
          });
          return {
            candidate: candidate.userId?.name,
            position: candidate.position?.title,
            votes: voteCount
          };
        })
      );
      
      reportData = {
        election: { title: election.title },
        results: voteCounts,
        timestamp: new Date()
      };
      break;

    case 'audit':
      const logs = await Log.find({ 
        election: electionId 
      })
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .limit(1000);
      
      reportData = {
        election: { title: election.title },
        totalLogs: logs.length,
        logs: logs.map(log => ({
          action: log.action,
          description: log.description,
          user: log.user?.name || 'System',
          timestamp: log.timestamp,
          ipAddress: log.ipAddress
        })),
        timestamp: new Date()
      };
      break;

    default:
      res.status(400);
      throw new Error('Invalid report type');
  }

  res.json({
    success: true,
    data: reportData
  });
});

// @desc    Export election report
// @route   GET /api/observer/elections/:electionId/reports/:reportType/export
// @access  Private (Observer with access)
const exportElectionReport = asyncHandler(async (req, res) => {
  const { electionId, reportType } = req.params;
  const { format = 'pdf' } = req.query;

  // First generate the report data
  const election = await Election.findById(electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Get report data (reuse logic from generateElectionReport)
  let reportData = { election: { title: election.title }, data: 'Report data here' };

  if (format === 'csv') {
    const csv = 'Report Title,Value\n' + 
                `Election,${election.title}\n` +
                `Report Type,${reportType}\n` +
                `Generated,${new Date().toISOString()}\n`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report_${electionId}.csv`);
    res.send(csv);
  } else if (format === 'pdf' || format === 'xlsx') {
    // For now, return a simple text file
    // In production, you would use libraries like pdfkit or xlsx
    res.status(501);
    throw new Error(`${format.toUpperCase()} export not yet implemented. Please use CSV format.`);
  } else {
    res.status(400);
    throw new Error('Invalid export format');
  }
});

// @desc    Get recent reports
// @route   GET /api/observer/reports/recent
// @access  Private (Observer)
const getRecentReports = asyncHandler(async (req, res) => {
  // This would fetch from a Reports collection if implemented
  // For now, return empty array
  res.json({
    success: true,
    data: []
  });
});

// @desc    Download a report
// @route   GET /api/observer/reports/:reportId/download
// @access  Private (Observer)
const downloadReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  
  // This would fetch the actual report file
  // For now, return not found
  res.status(404);
  throw new Error('Report not found');
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
  markNotificationAsRead,
  exportElectionVoters,
  generateElectionReport,
  exportElectionReport,
  getRecentReports,
  downloadReport
};
