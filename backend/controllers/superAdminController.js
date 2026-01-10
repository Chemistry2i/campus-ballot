const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Log = require("../models/Log");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

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
    const { name, email, password, role, phone, image } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create user with proper fields - admins created by super admin are automatically verified
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the User model pre-save hook
      role: role || 'admin',
      phone,
      emailVerified: true, // Automatically verified when created by super admin
      isVerified: true, // Automatically verified when created by super admin
      accountStatus: 'active',
      profilePicture: image || null
    });

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'create',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `Created ${role || 'admin'}: ${email}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Admin created successfully and automatically verified",
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

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `Changed admin status to ${status}: ${user.email}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

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

    const userId = user._id.toString();
    const userEmail = user.email;
    await user.deleteOne();
    
    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'delete',
      entityType: 'User',
      entityId: userId,
      details: `Deleted admin: ${userEmail}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get admin activities
// @route   GET /api/super-admin/admin-activities
// @access  Admin & Super Admin (with role-based filtering)
const getAdminActivities = asyncHandler(async (req, res) => {
  try {
    const { limit = 50, adminId, action, startDate, endDate } = req.query;
    const currentUserRole = req.user.role;
    const currentUserId = req.user._id.toString();
    
    // Build query
    const query = {
      user: { $ne: null }
    };
    
    // Filter by specific admin if provided
    if (adminId) {
      query.user = adminId;
    }
    
    // Filter by action if provided
    if (action) {
      query.action = action;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const logs = await Log.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Role-based filtering:
    // - Super Admin: See all logs (admins, super_admins, and students)
    // - Admin: See only student logs (not their own or other admins' logs)
    let filteredLogs;
    
    if (currentUserRole === 'super_admin') {
      // Super admin sees all logs
      filteredLogs = logs.filter(log => log.user);
    } else if (currentUserRole === 'admin') {
      // Admin sees only student logs (excluding admins and super_admins)
      filteredLogs = logs.filter(log => 
        log.user && log.user.role === 'student'
      );
    } else {
      // Fallback: no logs for other roles
      filteredLogs = [];
    }
    
    // Transform to match frontend format
    const activities = filteredLogs.map(log => ({
      id: log._id,
      adminId: log.user._id,
      adminName: log.user.name,
      adminEmail: log.user.email,
      adminRole: log.user.role,
      action: formatAction(log.action, log.entityType),
      target: log.details || log.entityId || 'N/A',
      module: log.entityType,
      timestamp: log.createdAt,
      status: log.status,
      ipAddress: log.ipAddress || 'Unknown',
      userAgent: log.userAgent,
      errorMessage: log.errorMessage
    }));
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to format action names
const formatAction = (action, entityType) => {
  const actionMap = {
    'create': `${entityType} Created`,
    'update': `${entityType} Updated`,
    'delete': `${entityType} Deleted`,
    'login': 'Admin Login',
    'logout': 'Admin Logout',
    'vote': 'Vote Recorded',
    'view': `${entityType} Viewed`,
    'maintenance': 'Maintenance Action',
    'backup': 'Backup Created',
    'security': 'Security Action',
    'configuration': 'Settings Changed'
  };
  return actionMap[action] || `${action} - ${entityType}`;
};

// @desc    Get list of admins for filtering
// @route   GET /api/super-admin/admins-list
// @access  Super Admin only
const getAdminsList = asyncHandler(async (req, res) => {
  try {
    const admins = await User.find({ 
      $or: [{ role: 'admin' }, { role: 'super_admin' }] 
    }).select('_id name email role');
    
    const adminList = admins.map(admin => ({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }));
    
    res.json(adminList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new observer
// @route   POST /api/super-admin/observers
// @access  Super Admin only
const createObserver = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    organization, 
    accessLevel, 
    assignedElections 
  } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // Validate assigned elections if election-specific access
  if (accessLevel === 'election-specific' && (!assignedElections || assignedElections.length === 0)) {
    res.status(400);
    throw new Error("At least one election must be assigned for election-specific access");
  }

  // Create observer
  const observer = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'observer',
    isVerified: true, // Observers are pre-verified
    observerInfo: {
      organization: organization || '',
      accessLevel: accessLevel || 'election-specific',
      assignedElections: assignedElections || [],
      assignedBy: req.user._id,
      assignedDate: new Date()
    }
  });

  // Log activity
  await logActivity(
    req.user._id,
    'CREATE_OBSERVER',
    'User',
    observer._id,
    { observerEmail: email, accessLevel, organization },
    getIpAddress(req),
    getUserAgent(req)
  );

  res.status(201).json({
    success: true,
    message: "Observer created successfully",
    data: {
      id: observer._id,
      name: observer.name,
      email: observer.email,
      role: observer.role,
      organization: observer.observerInfo.organization,
      accessLevel: observer.observerInfo.accessLevel,
      assignedElections: observer.observerInfo.assignedElections
    }
  });
});

// @desc    Get all observers
// @route   GET /api/super-admin/observers
// @access  Super Admin only
const getAllObservers = asyncHandler(async (req, res) => {
  const observers = await User.find({ role: 'observer' })
    .populate('observerInfo.assignedElections', 'title status startDate endDate')
    .populate('observerInfo.assignedBy', 'name email')
    .select('-password')
    .sort('-createdAt');

  res.json({
    success: true,
    count: observers.length,
    data: observers
  });
});

// @desc    Update observer
// @route   PUT /api/super-admin/observers/:id
// @access  Super Admin only
const updateObserver = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, organization, accessLevel, assignedElections } = req.body;

  const observer = await User.findById(id);

  if (!observer || observer.role !== 'observer') {
    res.status(404);
    throw new Error("Observer not found");
  }

  // Update fields
  if (name) observer.name = name;
  if (organization !== undefined) observer.observerInfo.organization = organization;
  if (accessLevel) observer.observerInfo.accessLevel = accessLevel;
  if (assignedElections) observer.observerInfo.assignedElections = assignedElections;

  await observer.save();

  // Log activity
  await logActivity(
    req.user._id,
    'UPDATE_OBSERVER',
    'User',
    observer._id,
    { changes: req.body },
    getIpAddress(req),
    getUserAgent(req)
  );

  res.json({
    success: true,
    message: "Observer updated successfully",
    data: observer
  });
});

// @desc    Delete observer
// @route   DELETE /api/super-admin/observers/:id
// @access  Super Admin only
const deleteObserver = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const observer = await User.findById(id);

  if (!observer || observer.role !== 'observer') {
    res.status(404);
    throw new Error("Observer not found");
  }

  await observer.deleteOne();

  // Log activity
  await logActivity(
    req.user._id,
    'DELETE_OBSERVER',
    'User',
    id,
    { observerEmail: observer.email },
    getIpAddress(req),
    getUserAgent(req)
  );

  res.json({
    success: true,
    message: "Observer deleted successfully"
  });
});

// @desc    Get observer activity logs
// @route   GET /api/super-admin/observers/:id/activity
// @access  Super Admin only
const getObserverActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const observer = await User.findById(id);

  if (!observer || observer.role !== 'observer') {
    res.status(404);
    throw new Error("Observer not found");
  }

  const logs = await Log.find({ userId: id })
    .sort('-timestamp')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Log.countDocuments({ userId: id });

  res.json({
    success: true,
    data: {
      observer: {
        id: observer._id,
        name: observer.name,
        email: observer.email
      },
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total
      }
    }
  });
});

module.exports = {
  getSystemSummary,
  getAllAdmins,
  createAdmin,
  updateAdminStatus,
  deleteAdmin,
  getAdminActivities,
  getAdminsList,
  createObserver,
  getAllObservers,
  updateObserver,
  deleteObserver,
  getObserverActivity
};
