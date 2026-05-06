const express = require('express');
const router = express.Router();

const {
  castVote,
  castBatchVotes,
  getAvailablePositions,
  getMyVotes,
  getVotesByElection,
  getVotesByCandidate,
  getAllVotes
} = require('../controllers/voteController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const { voteLimiter } = require('../middleware/rateLimiter');

// User: Cast a vote
router.post('/', protect, voteLimiter, castVote);

// ✅ User: Cast multiple votes for different positions (batch voting)
router.post('/batch', protect, voteLimiter, castBatchVotes);

// User: Get available positions to vote for in an election
router.get('/election/:electionId/available-positions', protect, getAvailablePositions);

// User: Get own voting history
router.get('/me', protect, getMyVotes);

// Admin: Get all votes for an election
router.get('/election/:electionId', protect, adminOnly, getVotesByElection);

// Admin: Get all votes for a candidate
router.get('/candidate/:candidateId', protect, adminOnly, getVotesByCandidate);

// Admin: Get all votes (system-wide)
router.get('/', protect, adminOnly, getAllVotes);

module.exports = router;