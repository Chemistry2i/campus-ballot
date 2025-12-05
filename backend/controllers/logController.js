const asyncHandler = require("express-async-handler");
const Log = require("../models/Log");

// @desc    Get all logs
// @route   GET /api/logs
// @access  Admin only
const getAllLogs = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 50, level, date, search } = req.query;
    
    const query = {};
    
    // Filter by level if provided
    if (level && level !== 'all') {
      if (level === 'error') {
        query.status = 'failure';
      } else if (level === 'success') {
        query.status = 'success';
        query.errorMessage = { $exists: false };
      } else if (level === 'warning') {
        query.status = 'success';
        query.errorMessage = { $exists: true };
      }
    }
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }
    
    const logs = await Log.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Log.countDocuments(query);
    
    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get logs', error: error.message });
  }
});

// @desc    Create a new log
// @route   POST /api/logs
// @access  Admin only
const createLog = asyncHandler(async (req, res) => {
  try {
    const { action, entityType, entityId, details, status, ipAddress, userAgent } = req.body;
    
    if (!action || !entityType || !details) {
      return res.status(400).json({ message: 'Action, entityType, and details are required' });
    }
    
    const log = await Log.create({
      user: req.user._id,
      action,
      entityType,
      entityId,
      details,
      status: status || 'success',
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent')
    });
    
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create log', error: error.message });
  }
});

// @desc    Delete a log
// @route   DELETE /api/logs/:id
// @access  Admin only
const deleteLog = asyncHandler(async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    
    await log.deleteOne();
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete log', error: error.message });
  }
});

// @desc    Search logs
// @route   GET /api/logs/search
// @access  Admin only
const searchLogs = asyncHandler(async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const logs = await Log.find({
      $or: [
        { action: { $regex: q, $options: 'i' } },
        { details: { $regex: q, $options: 'i' } },
        { entityType: { $regex: q, $options: 'i' } },
        { ipAddress: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(100);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search logs', error: error.message });
  }
});

// @desc    Clear all logs
// @route   DELETE /api/logs
// @access   Admin only
const clearAllLogs = asyncHandler(async (req, res) => {
  try {
    const result = await Log.deleteMany({});
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} log entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear logs', error: error.message });
  }
});

module.exports = {
  getAllLogs,
  createLog,
  deleteLog,
  searchLogs,
  clearAllLogs
};