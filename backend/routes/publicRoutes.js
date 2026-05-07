const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const CampaignMaterial = require('../models/CampaignMaterial');
const { 
  submitQuestion, 
  getCandidateQuestions, 
  getCandidateAnnouncements,
  toggleQuestionLike,
  toggleAnnouncementLike,
  addAnnouncementComment,
  trackAnnouncementView
} = require('../controllers/engagementController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// @desc    Get all approved candidates (public)
// @route   GET /api/public/candidates
// @access  Public
router.get('/candidates', async (req, res) => {
  try {
    const { election, position, search } = req.query;
    
    const filter = { status: 'approved' };
    
    if (election) {
      filter.election = election;
    }
    
    if (position) {
      filter.position = { $regex: position, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { party: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const candidates = await Candidate.find(filter)
      .populate('election', 'title status startDate endDate')
      .populate('user', 'name email department profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching public candidates:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

// @desc    Get single candidate details (public)
// @route   GET /api/public/candidates/:id
// @access  Public
router.get('/candidates/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('election', 'title status startDate endDate description')
      .populate('user', 'name email department profilePicture bio');
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Increment view count if exists
    if (typeof candidate.views === 'number') {
      candidate.views += 1;
      await candidate.save();
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ message: 'Failed to fetch candidate' });
  }
});

// @desc    Get candidate's campaign materials (public)
// @route   GET /api/public/candidates/:id/materials
// @access  Public
router.get('/candidates/:id/materials', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Get materials uploaded by this candidate's user
    const materials = await CampaignMaterial.find({ user: candidate.user })
      .sort({ createdAt: -1 });
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching candidate materials:', error);
    res.status(500).json({ message: 'Failed to fetch materials' });
  }
});

// @desc    Get all active elections with candidates (public)
// @route   GET /api/public/elections
// @access  Public
router.get('/elections', async (req, res) => {
  try {
    const elections = await Election.find({
      status: { $in: ['active', 'upcoming', 'ongoing'] }
    })
      .populate({
        path: 'candidates',
        match: { status: 'approved' },
        populate: { path: 'user', select: 'name profilePicture department' }
      })
      .sort({ startDate: -1 });
    
    res.json(elections);
  } catch (error) {
    console.error('Error fetching public elections:', error);
    res.status(500).json({ message: 'Failed to fetch elections' });
  }
});

// @desc    Get candidates for specific election (public)
// @route   GET /api/public/elections/:id/candidates
// @access  Public
router.get('/elections/:id/candidates', async (req, res) => {
  try {
    const { position } = req.query;
    
    const filter = { 
      election: req.params.id,
      status: 'approved'
    };
    
    if (position) {
      filter.position = { $regex: position, $options: 'i' };
    }
    
    const candidates = await Candidate.find(filter)
      .populate('election', 'title status startDate endDate')
      .populate('user', 'name email department profilePicture')
      .sort({ position: 1, name: 1 });
    
    // Get unique positions for this election
    const positions = await Candidate.distinct('position', { 
      election: req.params.id,
      status: 'approved'
    });
    
    res.json({ candidates, positions });
  } catch (error) {
    console.error('Error fetching election candidates:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

// @desc    Get winners for completed elections (public)
// @route   GET /api/public/winners
// @access  Public
router.get('/winners', async (req, res) => {
  try {
    // Only include elections that have completed and have published results
    const elections = await Election.find({ status: 'completed', resultsPublished: true })
      .sort({ endDate: -1 })
      .select('title endDate positions');

    const winners = [];

    for (const election of elections) {
      const electionEntry = {
        _id: election._id,
        title: election.title,
        endDate: election.endDate,
        winners: []
      };

      // For each position, find the candidate with highest votes
      for (const position of (election.positions || [])) {
        const candidatesInPosition = await Candidate.find({ election: election._id, position })
          .sort({ votes: -1 })
          .select('name position votes party photo status');

        const top = candidatesInPosition[0];

        if (top) {
          const totalVotes = candidatesInPosition.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);
          const percentage = totalVotes > 0 ? ((top.votes || 0) / totalVotes) * 100 : 0;

          electionEntry.winners.push({
            position,
            percentage,
            totalVotes,
            candidate: top.toObject ? { ...top.toObject() } : top
          });
        }
      }

      winners.push(electionEntry);
    }

    res.json(winners);
  } catch (error) {
    console.error('Error fetching public winners:', error);
    res.status(500).json({ message: 'Failed to fetch winners' });
  }
});

// @desc    Submit a question to a candidate
// @route   POST /api/public/candidates/:candidateId/questions
// @access  Protected (Student)
router.post('/candidates/:candidateId/questions', protect, submitQuestion);

// @desc    Get Q&A for a candidate
// @route   GET /api/public/candidates/:candidateId/questions
// @access  Public (optionalAuth for like status)
router.get('/candidates/:candidateId/questions', optionalAuth, getCandidateQuestions);

// @desc    Get announcements for a candidate
// @route   GET /api/public/candidates/:candidateId/announcements
// @access  Public (optionalAuth for like status)
router.get('/candidates/:candidateId/announcements', optionalAuth, getCandidateAnnouncements);

// @desc    Toggle like on a question
// @route   POST /api/public/questions/:questionId/like
// @access  Protected
router.post('/questions/:questionId/like', protect, toggleQuestionLike);

// @desc    Toggle like on an announcement
// @route   POST /api/public/announcements/:announcementId/like
// @access  Protected
router.post('/announcements/:announcementId/like', protect, toggleAnnouncementLike);

// @desc    Add comment to announcement
// @route   POST /api/public/announcements/:announcementId/comments
// @access  Protected
router.post('/announcements/:announcementId/comments', protect, addAnnouncementComment);

// @desc    Track announcement view
// @route   POST /api/public/announcements/:announcementId/view
// @access  Protected
router.post('/announcements/:announcementId/view', protect, trackAnnouncementView);

module.exports = router;
