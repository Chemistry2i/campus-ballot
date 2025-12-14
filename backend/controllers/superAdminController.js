const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");

// @desc    Get system summary for super admin dashboard
// @route   GET /api/super-admin/reports/system-summary
// @access  Super Admin only
const getSystemSummary = asyncHandler(async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ 
      $or: [{ role: 'admin' }, { role: 'super_admin' }] 
    });
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    const totalVotes = await Vote.countDocuments();
    
    // Calculate voter turnout
    const votedUsers = await Vote.distinct('user');
    const voterTurnout = totalUsers > 0 ? Math.round((votedUsers.length / totalUsers) * 100) : 0;

    // Recent actions (mock data for now)
    const recentActions = [
      { adminName: 'System', action: 'Dashboard accessed', date: new Date().toISOString() }
    ];

    // User growth (mock data - replace with real aggregation)
    const userGrowth = [
      { month: 'Jan', count: Math.floor(totalUsers * 0.2) },
      { month: 'Feb', count: Math.floor(totalUsers * 0.4) },
      { month: 'Mar', count: Math.floor(totalUsers * 0.6) },
      { month: 'Apr', count: Math.floor(totalUsers * 0.8) },
      { month: 'May', count: totalUsers },
    ];

    // Election participation
    const elections = await Election.find().populate('candidates');
    const electionParticipation = elections.map(election => ({
      name: election.title,
      turnout: Math.floor(Math.random() * 100) // Replace with real calculation
    }));

    // Role distribution
    const roleDistribution = [
      { role: 'Student', count: await User.countDocuments({ role: 'student' }) },
      { role: 'Admin', count: await User.countDocuments({ role: 'admin' }) },
      { role: 'Super Admin', count: await User.countDocuments({ role: 'super_admin' }) },
    ];

    res.json({
      totalUsers,
      totalAdmins,
      totalElections,
      activeElections,
      totalVotes,
      voterTurnout,
      pendingRequests: 0, // Add real logic if needed
      systemHealth: 'OK',
      recentActions,
      userGrowth,
      electionParticipation,
      roleDistribution,
      adminActivity: [
        { month: 'Jan', count: 10 },
        { month: 'Feb', count: 15 },
        { month: 'Mar', count: 20 },
        { month: 'Apr', count: 25 },
        { month: 'May', count: 30 },
      ],
      systemHealthHistory: [
        { date: '2024-05-01', status: 'OK' },
        { date: '2024-05-02', status: 'OK' },
        { date: '2024-05-03', status: 'OK' },
        { date: '2024-05-04', status: 'OK' },
        { date: '2024-05-05', status: 'OK' },
      ],
      topElections: electionParticipation.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all admins (super admin only)
// @route   GET /api/super-admin/admins
// @access  Super Admin only
const getAllAdmins = asyncHandler(async (req, res) => {
  try {
    const admins = await User.find({ 
      $or: [{ role: 'admin' }, { role: 'super_admin' }] 
    }).select("-password");
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new admin (super admin only)
// @route   POST /api/super-admin/admins
// @access  Super Admin only
const createAdmin = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role, phone, emailVerified } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'admin',
      phone,
      emailVerified: emailVerified || false,
      accountStatus: 'active'
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Admin created successfully",
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update admin status
// @route   PUT /api/super-admin/admins/:id/status
// @access  Super Admin only
const updateAdminStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    user.accountStatus = status;
    await user.save();

    res.json({ message: `Admin status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete admin
// @route   DELETE /api/super-admin/admins/:id
// @access  Super Admin only
const deleteAdmin = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await user.deleteOne();
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getSystemSummary,
  getAllAdmins,
  createAdmin,
  updateAdminStatus,
  deleteAdmin
};
