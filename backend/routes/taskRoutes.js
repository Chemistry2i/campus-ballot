const express = require('express');
const router = express.Router();
const {
  createTask,
  getCandidateTasks,
  getAgentTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getCandidateTaskStats
} = require('../controllers/taskController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// Task routes
router.post('/', protect, hasRole('student', 'candidate'), createTask);
router.get('/candidate', protect, hasRole('student', 'candidate'), getCandidateTasks);
router.get('/agent', protect, getAgentTasks);
router.get('/stats/candidate', protect, hasRole('student', 'candidate'), getCandidateTaskStats);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.patch('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);

module.exports = router;
