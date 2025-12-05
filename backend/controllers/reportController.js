const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');


const getReportSummary = async (req, res) => {
  try {
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments();
    // Populate candidates if they are refs, otherwise just use subdocs
    const elections = await Election.find().populate('candidates');

    // Calculate stats for each election
    const electionStats = await Promise.all(
      elections.map(async (election) => {
        const votes = await Vote.countDocuments({ election: election._id });
        const invalidVotes = election.invalidVotes || 0;
        const spoiledVotes = election.spoiledVotes || 0;
        const candidates = (election.candidates || []).map(c => ({
          _id: c._id,
          name: c.name,
          votes: c.votes || 0,
        }));
        const turnout = totalUsers ? Math.round((votes / totalUsers) * 100) : 0;
        return {
          _id: election._id,
          name: election.title, // Use title as name for frontend compatibility
          status: election.status,
          startDate: election.startDate,
          endDate: election.endDate,
          createdAt: election.createdAt,
          votes,
          turnout,
          invalidVotes,
          spoiledVotes,
          candidates,
        };
      })
    );

    // Voted vs Not Voted
    const voted = await Vote.distinct('user');
    const notVoted = totalUsers - voted.length;
    const voterTurnout = totalUsers ? Math.round((voted.length / totalUsers) * 100) : 0;


    // Participation by Department with turnout
    // Get all faculties
    const faculties = await User.distinct('faculty');
    const participationByDepartment = await Promise.all(
      faculties.map(async (faculty) => {
        const total = await User.countDocuments({ faculty });
        const votedUsers = await Vote.distinct('user', { faculty });
        // Find users in this faculty who voted
        // If Vote does not store faculty, you need to join with User
        // We'll join manually:
        const usersInFaculty = await User.find({ faculty }, '_id');
        const userIds = usersInFaculty.map(u => u._id.toString());
        const votesInFaculty = await Vote.find({ user: { $in: userIds } }).distinct('user');
        const turnout = total ? Math.round((votesInFaculty.length / total) * 100) : 0;
        return {
          department: faculty || 'Unknown',
          turnout,
          total,
        };
      })
    );

    // Audit Logs (recent 10 actions)
    let auditLogs = [];
    try {
      const Log = require('../models/Log');
      auditLogs = await Log.find().sort({ date: -1 }).limit(10);
    } catch (e) {
      // If Log model doesn't exist, skip
    }

    // Top Candidate (across all elections)
    let topCandidate = { name: '-', votes: 0 };
    electionStats.forEach(election => {
      (election.candidates || []).forEach(c => {
        if (c.votes > topCandidate.votes) {
          topCandidate = { name: c.name, votes: c.votes };
        }
      });
    });

    // Voter Demographics (by yearOfStudy, gender if available)
    const demographics = await User.aggregate([
      { $group: { _id: { yearOfStudy: '$yearOfStudy', gender: '$gender' }, total: { $sum: 1 } } }
    ]);

    res.json({
      totalElections,
      totalVotes,
      totalUsers,
      voterTurnout,
      voted: voted.length,
      notVoted,
      elections: electionStats,
      participationByDepartment,
      auditLogs,
      topCandidate,
      demographics,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report summary', error: err.message });
  }
};

const getSystemSummary = async (req, res) => {
  try {
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Basic system summary for super admin dashboard
    const summary = {
      totalAdmins: await User.countDocuments({ role: 'admin' }),
      totalUsers,
      totalElections,
      activeElections: await Election.countDocuments({ status: 'ongoing' }),
      pendingRequests: 0, // placeholder
      systemHealth: 'OK',
      recentActions: [],
      // Add dummy data for charts
      userGrowth: [
        { month: 'Jan', count: 20 },
        { month: 'Feb', count: 35 },
        { month: 'Mar', count: 50 },
        { month: 'Apr', count: 65 },
        { month: 'May', count: 80 },
      ],
      electionParticipation: [
        { name: 'Presidential', turnout: 75 },
        { name: 'Guild', turnout: 60 },
        { name: 'Faculty', turnout: 45 },
        { name: 'Class Rep', turnout: 30 },
      ],
    };
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch system summary', error: err.message });
  }
};

module.exports = { 
  getReportSummary,
  getSystemSummary 
};