const express = require('express');
const router = express.Router();
const multer = require('multer');

const User = require('../models/User');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');
const Log = require('../models/Log');

// settings controller + auth
const settingsController = require('../controllers/settingsController');
const bulkUploadController = require('../controllers/bulkUploadController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Apply protection to all admin routes
router.use(protect);

// Configure multer for file uploads (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV and Excel files
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/csv',
      'text/plain' // Some systems send CSV as text/plain
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  }
});

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
  // match ongoing elections (legacy 'active' may still exist in db)
  { status: { $in: ['ongoing', 'active'] } },
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

// Get detailed election stats with candidates and votes grouped by position
router.get('/election/:electionId/detailed-stats', protect, async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Fetch election with positions
    const election = await Election.findById(electionId)
      .populate('candidates')
      .select('title description positions status startDate endDate');
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Get all candidates for this election with vote counts
    const candidates = await Candidate.find({ election: electionId })
      .populate('user', 'name email');

    // Get vote counts for each candidate
    const candidatesWithVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const voteCount = await Vote.countDocuments({ 
          candidate: candidate._id,
          election: electionId,
          status: 'valid'
        });
        return {
          _id: candidate._id,
          name: candidate.name,
          position: candidate.position,
          photo: candidate.photo,
          party: candidate.party,
          symbol: candidate.symbol,
          description: candidate.description,
          status: candidate.status,
          voteCount
        };
      })
    );

    // Group candidates by position
    const positionGroups = {};
    election.positions.forEach(pos => {
      positionGroups[pos] = candidatesWithVotes.filter(c => c.position === pos);
    });

    // Calculate position statistics
    const positionStats = election.positions.map(position => ({
      position,
      totalCandidates: positionGroups[position].length,
      totalVotes: positionGroups[position].reduce((sum, c) => sum + c.voteCount, 0),
      candidates: positionGroups[position]
    }));

    res.json({
      election: {
        _id: election._id,
        title: election.title,
        description: election.description,
        status: election.status,
        startDate: election.startDate,
        endDate: election.endDate
      },
      positions: election.positions,
      positionStats,
      totalVotes: candidatesWithVotes.reduce((sum, c) => sum + c.voteCount, 0),
      totalCandidates: candidatesWithVotes.length
    });
  } catch (error) {
    console.error('Error fetching detailed election stats:', error);
    res.status(500).json({ 
      message: "Failed to fetch detailed election stats",
      error: error.message 
    });
  }
});

// --- Admin settings endpoints ---
// Get current settings
router.get('/settings', protect, adminOnly, settingsController.getSettings);

// Update a section of settings (general, email, notifications, security)
router.put('/settings/:section', protect, adminOnly, settingsController.updateSettingsSection);

// Test SMTP connection (best-effort)
router.post('/settings/test-smtp', protect, adminOnly, settingsController.testSmtp);

// Update admin profile (current user)
router.put('/profile', protect, adminOnly, settingsController.updateProfile);

// Settings history
router.get('/settings/history', protect, adminOnly, settingsController.listHistory);

// --- Bulk User Upload endpoints ---
// Download template (CSV or Excel)
router.get('/users/bulk-template', protect, adminOnly, bulkUploadController.downloadTemplate);

// Validate uploaded file (preview mode)
router.post('/users/bulk-validate', protect, adminOnly, upload.single('file'), bulkUploadController.validateBulkUpload);

// Import users from file
router.post('/users/bulk-import', protect, adminOnly, upload.single('file'), bulkUploadController.bulkImportUsers);

module.exports = router;