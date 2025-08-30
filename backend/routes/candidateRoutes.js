const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // You can configure storage as needed

const {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  getApprovedCandidatesVotes,
  updateCandidate,
  deleteCandidate,
  getCandidatesByElection,
  approveCandidate,
  disqualifyCandidate,
  getMyCandidacy,
  getCandidatesByElectionAndPosition,
  searchCandidates,
  withdrawMyCandidacy
} = require('../controllers/candidateController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Only admin can create a new candidate (add multer here)
router.post(
  '/',
  protect,
  adminOnly,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'symbol', maxCount: 1 }
  ]),
  createCandidate
);

// Get all candidates (admin or student)
router.get('/', protect, getAllCandidates);

// Candidate: Get my own candidacy info (must come before /:id!)
router.get('/me/candidacy', protect, getMyCandidacy);

// Candidate: Withdraw own candidacy
router.delete('/me/candidacy', protect, withdrawMyCandidacy);

// Get all candidates for a specific election
router.get('/election/:electionId', protect, getCandidatesByElection);

// Get candidates for a specific election and position
router.get('/election/:electionId/position/:position', protect, getCandidatesByElectionAndPosition);

// Search or paginate candidates
router.get('/search', protect, searchCandidates);

// Get approved candidates' votes (admin only)
router.get("/approved-votes", protect, adminOnly, getApprovedCandidatesVotes);


// Admin: Approve a candidate
router.put('/:id/approve', protect, adminOnly, approveCandidate);

// Admin: Disqualify a candidate
router.put('/:id/disqualify', protect, adminOnly, disqualifyCandidate);

// Get a candidate by ID
router.get('/:id', protect, getCandidateById);

// Update a candidate (admin or candidate themselves)
router.put('/:id', protect, updateCandidate);

// Delete a candidate (admin only)
router.delete('/:id', protect, adminOnly, deleteCandidate);


module.exports = router;