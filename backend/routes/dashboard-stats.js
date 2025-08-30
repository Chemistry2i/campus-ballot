const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');
const Log = require('../models/Log');

router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get real stats from database
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalElections = await Election.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const totalLogs = await Log.countDocuments();
    
    // Get active elections (status = 'active' or based on current date)
    const now = new Date();
    const activeElections = await Election.countDocuments({
      $and: [
        { startDate: { $lte: now } },
        { endDate: { $gte: now } }
      ]
    });
    
    // Get pending approvals (candidates with status pending)
    const pendingApprovals = await Candidate.countDocuments({ 
      status: 'pending' 
    });
    
    // Get elections for chart data
    const elections = await Election.find().select('title');
    const electionNames = elections.map(e => e.title);
    
    // Get votes per election for chart
    const votesPerElection = await Promise.all(
      elections.map(async (election) => {
        const count = await Vote.countDocuments({ electionId: election._id });
        return count;
      })
    );
    
    // Get user role distribution
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const roles = roleStats.map(r => r._id);
    const roleCounts = roleStats.map(r => r.count);
    
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
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
});

module.exports = router;