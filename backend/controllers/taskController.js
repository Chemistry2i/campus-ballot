const Task = require('../models/Task');
const Agent = require('../models/Agent');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Protected (Candidate, Senior Agent)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, assignedTo } = req.body;

  // Check if user is candidate or senior agent
  const userIsCandid = req.user.role === 'candidate' || 
                        req.user.additionalRoles?.includes('candidate');
  
  let creatorType = 'candidate';
  let candidateId = req.user._id;

  if (!userIsCandidate) {
    // Check if user is a senior agent
    const agent = await Agent.findOne({ 
      user: req.user._id, 
      agentRole: 'coordinator',
      status: 'active'
    }).populate('candidate');

    if (!agent) {
      return res.status(403).json({ message: 'Only candidates and senior agents can create tasks' });
    }

    creatorType = 'senior_agent';
    candidateId = agent.candidate._id;
  }

  // Validate assigned agents exist and belong to this candidate
  if (assignedTo && assignedTo.length > 0) {
    const agents = await Agent.find({
      user: { $in: assignedTo },
      candidate: candidateId,
      status: 'active'
    });

    if (agents.length !== assignedTo.length) {
      return res.status(400).json({ message: 'One or more assigned agents are invalid' });
    }
  }

  const task = await Task.create({
    title,
    description,
    priority: priority || 'medium',
    dueDate,
    createdBy: req.user._id,
    creatorType,
    candidate: candidateId,
    assignedTo: assignedTo || []
  });

  // Update agent task counts
  if (assignedTo && assignedTo.length > 0) {
    await Agent.updateMany(
      { user: { $in: assignedTo } },
      { $inc: { tasksActive: 1 } }
    );
  }

  const populatedTask = await Task.findById(task._id)
    .populate('createdBy', 'name email')
    .populate('candidate', 'name email')
    .populate('assignedTo', 'name email');

  res.status(201).json(populatedTask);
});

// @desc    Get tasks for candidate
// @route   GET /api/tasks/candidate
// @access  Protected (Candidate)
const getCandidateTasks = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;

  const query = { candidate: req.user._id };
  
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tasks = await Task.find(query)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1 });

  res.json(tasks);
});

// @desc    Get tasks for agent
// @route   GET /api/tasks/agent
// @access  Protected (Agent)
const getAgentTasks = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;

  const query = { assignedTo: req.user._id };
  
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tasks = await Task.find(query)
    .populate('createdBy', 'name email')
    .populate('candidate', 'name email')
    .sort({ dueDate: 1 });

  res.json(tasks);
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Protected
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('candidate', 'name email')
    .populate('assignedTo', 'name email')
    .populate('completedBy', 'name email');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if user has permission to view this task
  const isCreator = task.createdBy._id.toString() === req.user._id.toString();
  const isCandidate = task.candidate._id.toString() === req.user._id.toString();
  const isAssigned = task.assignedTo.some(agent => agent._id.toString() === req.user._id.toString());

  if (!isCreator && !isCandidate && !isAssigned && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Not authorized to view this task' });
  }

  res.json(task);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Protected (Candidate, Senior Agent)
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, status, assignedTo, notes } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if user has permission to update
  const isCreator = task.createdBy.toString() === req.user._id.toString();
  const isCandidate = task.candidate.toString() === req.user._id.toString();

  if (!isCreator && !isCandidate && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  // Track old assigned agents for count updates
  const oldAssigned = task.assignedTo.map(id => id.toString());
  const newAssigned = assignedTo || oldAssigned;

  // Update task fields
  if (title) task.title = title;
  if (description) task.description = description;
  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = dueDate;
  if (status) task.status = status;
  if (notes) task.notes = notes;
  if (assignedTo) task.assignedTo = assignedTo;

  // If status changed to completed, update completed fields
  if (status === 'completed' && task.status !== 'completed') {
    task.completedDate = new Date();
    task.completedBy = req.user._id;

    // Update agent counts
    await Agent.updateMany(
      { user: { $in: task.assignedTo } },
      { $inc: { tasksActive: -1, tasksCompleted: 1 } }
    );
  }

  // If assigned agents changed, update counts
  if (assignedTo) {
    const removed = oldAssigned.filter(id => !newAssigned.includes(id));
    const added = newAssigned.filter(id => !oldAssigned.includes(id));

    if (removed.length > 0) {
      await Agent.updateMany(
        { user: { $in: removed } },
        { $inc: { tasksActive: -1 } }
      );
    }

    if (added.length > 0) {
      await Agent.updateMany(
        { user: { $in: added } },
        { $inc: { tasksActive: 1 } }
      );
    }
  }

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('createdBy', 'name email')
    .populate('candidate', 'name email')
    .populate('assignedTo', 'name email')
    .populate('completedBy', 'name email');

  res.json(updatedTask);
});

// @desc    Update task status (for agents)
// @route   PATCH /api/tasks/:id/status
// @access  Protected (Agent)
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if user is assigned to this task
  const isAssigned = task.assignedTo.some(id => id.toString() === req.user._id.toString());
  
  if (!isAssigned) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  const oldStatus = task.status;
  task.status = status;

  // If marked as completed
  if (status === 'completed' && oldStatus !== 'completed') {
    task.completedDate = new Date();
    task.completedBy = req.user._id;

    // Update agent counts
    await Agent.updateMany(
      { user: { $in: task.assignedTo } },
      { $inc: { tasksActive: -1, tasksCompleted: 1 } }
    );
  }

  // If un-marking as completed
  if (status !== 'completed' && oldStatus === 'completed') {
    task.completedDate = null;
    task.completedBy = null;

    // Update agent counts
    await Agent.updateMany(
      { user: { $in: task.assignedTo } },
      { $inc: { tasksActive: 1, tasksCompleted: -1 } }
    );
  }

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('createdBy', 'name email')
    .populate('candidate', 'name email')
    .populate('assignedTo', 'name email')
    .populate('completedBy', 'name email');

  res.json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Protected (Candidate, Admin)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if user has permission to delete
  const isCandidate = task.candidate.toString() === req.user._id.toString();
  
  if (!isCandidate && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Not authorized to delete this task' });
  }

  // Update agent counts if task was active
  if (task.status !== 'completed' && task.assignedTo.length > 0) {
    await Agent.updateMany(
      { user: { $in: task.assignedTo } },
      { $inc: { tasksActive: -1 } }
    );
  }

  await task.deleteOne();

  res.json({ message: 'Task deleted successfully' });
});

// @desc    Get task statistics for candidate
// @route   GET /api/tasks/stats/candidate
// @access  Protected (Candidate)
const getCandidateTaskStats = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;

  const [
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    highPriorityTasks
  ] = await Promise.all([
    Task.countDocuments({ candidate: candidateId }),
    Task.countDocuments({ candidate: candidateId, status: 'pending' }),
    Task.countDocuments({ candidate: candidateId, status: 'in-progress' }),
    Task.countDocuments({ candidate: candidateId, status: 'completed' }),
    Task.countDocuments({ 
      candidate: candidateId, 
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    }),
    Task.countDocuments({ candidate: candidateId, priority: 'high', status: { $ne: 'completed' } })
  ]);

  res.json({
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    highPriorityTasks,
    activeTasks: pendingTasks + inProgressTasks
  });
});

module.exports = {
  createTask,
  getCandidateTasks,
  getAgentTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getCandidateTaskStats
};
