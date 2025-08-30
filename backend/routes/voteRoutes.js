const express = require('express');
const router = express.Router();

const {
  castVote,
  getMyVotes,
  getVotesByElection,
  getVotesByCandidate,
  getAllVotes
} = require('../controllers/voteController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// User: Cast a vote
router.post('/', protect, castVote);

// User: Get own voting history
router.get('/me', protect, getMyVotes);

// Admin: Get all votes for an election
router.get('/election/:electionId', protect, adminOnly, getVotesByElection);

// Admin: Get all votes for a candidate
router.get('/candidate/:candidateId', protect, adminOnly, getVotesByCandidate);

// Admin: Get all votes (system-wide)
router.get('/', protect, adminOnly, getAllVotes);

module.exports = router;