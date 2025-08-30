const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');
const Log = require('../models/Log');

router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalElections = await Election.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const totalLogs = await Log.countDocuments();

    // Get active elections based on current date and status
    const now = new Date();
    const activeElections = await Election.countDocuments({
      $or: [
        { status: 'active' },
        {
          $and: [
            { startDate: { $lte: now } },
            { endDate: { $gte: now } }
          ]
        }
      ]
    });

    // Get pending approvals (candidates with pending status)
    const pendingApprovals = await Candidate.countDocuments({ 
      status: 'pending' 
    });

    const elections = await Election.find({}, 'title');
    const electionNames = elections.map(e => e.title);

    // Count votes per election
    const votesPerElection = await Promise.all(
      elections.map(async (e) => await Vote.countDocuments({ election: e._id }))
    );

    // User roles distribution
    const roles = ['admin', 'student', 'staff'];
    const roleCounts = await Promise.all(
      roles.map(async (role) => await User.countDocuments({ role }))
    );

    res.json({
      totalUsers,
      totalVotes,
      totalElections,
      totalCandidates,
      activeElections,
      pendingApprovals,
      totalNotifications,
      totalLogs,
      electionNames,
      votesPerElection,
      roles,
      roleCounts,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: "Failed to fetch dashboard stats",
      error: error.message 
    });
  }
});

module.exports = router;