const express = require('express');
const router = express.Router();

const {
    createElection,
    getAllElections,
    getElectionById,
    updateElection,
    deleteElection,
    publishResults,
    getElectionResults,
    getElectionCandidates,
    addPositionToElection,
    removePositionFromElection,
    getActiveElections,
    getUpcomingElections,
    getCompletedElections,
    searchElections,
    closeElection
} = require('../controllers/electionController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin: Create a new election
router.post('/', protect, adminOnly, createElection);

// Get all elections (admin or public)
router.get('/', protect, getAllElections);

// Get active (ongoing) elections
router.get('/active', protect, getActiveElections);

// Get upcoming elections
router.get('/upcoming', protect, getUpcomingElections);

// Get completed elections
router.get('/completed', protect, getCompletedElections);

// Search elections by title, status, etc.
router.get('/search', protect, searchElections);

// Get a single election by ID
router.get('/:id', protect, getElectionById);

// Admin: Update an election
router.put('/:id', protect, adminOnly, updateElection);

// Admin: Delete an election
router.delete('/:id', protect, adminOnly, deleteElection);

// Admin: Publish results for an election
router.put('/:id/publish-results', protect, adminOnly, publishResults);

// Get results for an election
router.get('/:id/results', protect, getElectionResults);

// Get all candidates for an election
router.get('/:id/candidates', protect, getElectionCandidates);

// Admin: Add a position to an election
router.post('/:id/positions', protect, adminOnly, addPositionToElection);

// Admin: Remove a position from an election
router.delete('/:id/positions/:position', protect, adminOnly, removePositionFromElection);

// Admin: Close an election (set status to completed)
router.put('/:id/close', protect, adminOnly, closeElection);

module.exports = router;