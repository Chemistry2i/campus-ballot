const asyncHandler = require("express-async-handler");
const Log = require("../models/Log");

// @desc    Get all logs
// @route   GET /api/logs
// @access  Admin only
const getAllLogs = asyncHandler(async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).populate('user', 'name email role');
    console.log({ message: "Fetched all logs" });
    res.json(logs);
  } catch (error) {
    console.log({ message: "Error fetching logs", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a log by ID
// @route   GET /api/logs/:id
// @access  Admin only
const getLogById = asyncHandler(async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).populate('user', 'name email role');
    if (!log) {
      console.log({ message: "Log not found" });
      return res.status(404).json({ message: "Log not found" });
    }
    console.log({ message: "Fetched log by ID" });
    res.json(log);
  } catch (error) {
    console.log({ message: "Error fetching log by ID", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a log entry
// @route   POST /api/logs
// @access  Admin only
const createLog = asyncHandler(async (req, res) => {
  try {
    const {
      action,
      entityType,
      entityId,
      details,
      status = 'success',
      errorMessage = null,
      location = null
    } = req.body;

    if (!action || !entityType || !entityId) {
      console.log({ message: "Missing required fields for log" });
      return res.status(400).json({ message: "Action, entityType, and entityId are required" });
    }

    const log = await Log.create({
      user: req.user._id,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      status,
      errorMessage,
      location
    });

    console.log({ message: "Log created", ip: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json(log);
  } catch (error) {
    console.log({ message: "Error creating log", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a log entry
// @route   DELETE /api/logs/:id
// @access  Admin only
const deleteLog = asyncHandler(async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) {
      console.log({ message: "Log not found" });
      return res.status(404).json({ message: "Log not found" });
    }
    await log.deleteOne();
    console.log({ message: "Log deleted" });
    res.json({ message: "Log deleted" });
  } catch (error) {
    console.log({ message: "Error deleting log", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search logs
// @route   GET /api/logs/search?q=...&action=...
// @access  Admin only
const searchLogs = asyncHandler(async (req, res) => {
  try {
    const { q, action } = req.query;
    let filter = {};
    if (q) {
      filter.details = { $regex: q, $options: "i" };
    }
    if (action) {
      filter.action = action;
    }
    const logs = await Log.find(filter).sort({ createdAt: -1 }).populate('user', 'name email role');
    console.log({ message: "Searched logs" });
    res.json(logs);
  } catch (error) {
    console.log({ message: "Error searching logs", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getAllLogs,
  getLogById,
  createLog,
  deleteLog,
  searchLogs
};