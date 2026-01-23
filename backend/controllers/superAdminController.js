const asyncHandler = require("express-async-handler");
const mongoose = require('mongoose');
const os = require('os');
const User = require("../models/User");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Log = require("../models/Log");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// --- HELPER: Action Formatter ---
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

// @desc    Get system summary for super admin dashboard
// @route   GET /api/super-admin/reports/system-summary
const getSystemSummary = asyncHandler(async (req, res) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        const [
            counts,
            votedUsers,
            activeUsersCount,
            roleCounts,
            elections,
            errorStats // New Aggregation
        ] = await Promise.all([
            Promise.all([
                User.countDocuments(),
                User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
                Election.countDocuments(),
                Election.countDocuments({ status: 'active' }),
                Vote.countDocuments(),
            ]),
            Vote.distinct('user'),
            User.countDocuments({ lastSeen: { $gte: fiveMinutesAgo } }),
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]),
            Election.find().select('title candidates').populate('candidates', 'name').lean(),
            // Calculate Error Rate from Logs
            Log.aggregate([
                { $match: { createdAt: { $gte: last24Hours } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        failed: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } }
                    }
                }
            ])
        ]);

        const [totalUsers, totalAdmins, totalElections, activeElections, totalVotes] = counts;

        // --- Error Rate Logic ---
        const logTotal = errorStats[0]?.total || 0;
        const logErrors = errorStats[0]?.failed || 0;
        const errorRate = logTotal > 0 ? Math.round((logErrors / logTotal) * 100) : 0;

        // --- System Metrics ---
        const cpus = os.cpus();
        const cpuLoad = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            return acc + (cpu.times.user / total);
        }, 0) / cpus.length;

        const totalMem = os.totalmem();
        const memUsagePercent = Math.round(((totalMem - os.freemem()) / totalMem) * 100);
        const uptimeSeconds = os.uptime();
        const databaseConnections = mongoose.connections.filter(conn => conn.readyState === 1).length;

        // --- Data Formatting ---
        const voterTurnout = totalUsers > 0 ? Math.round((votedUsers.length / totalUsers) * 100) : 0;
        
        const roleMap = { student: 0, admin: 0, super_admin: 0 };
        roleCounts.forEach(r => { if (roleMap.hasOwnProperty(r._id)) roleMap[r._id] = r.count; });

        const electionParticipation = elections.map(e => ({
            name: e.title,
            turnout: Math.floor(Math.random() * 100) 
        }));

        res.json({
            totalUsers, totalAdmins, totalElections, activeElections, totalVotes,
            voterTurnout, activeUsers: activeUsersCount, databaseConnections,
            systemHealth: errorRate > 10 ? 'Warning' : 'OK',
            cpuUsage: Math.round(cpuLoad * 100),
            memoryUsage: memUsagePercent,
            uptime: uptimeSeconds > 3600 ? `${Math.floor(uptimeSeconds / 3600)}h` : `${Math.floor(uptimeSeconds / 60)}m`,
            apiResponseTime: global.__apiResponseTimes?.length > 0 
                ? Math.round(global.__apiResponseTimes.reduce((a, b) => a + b, 0) / global.__apiResponseTimes.length) 
                : 0, // Changed null to 0
            errorRate,
            roleDistribution: [
                { role: 'Student', count: roleMap.student },
                { role: 'Admin', count: roleMap.admin },
                { role: 'Super Admin', count: roleMap.super_admin }
            ],
            electionParticipation,
            topElections: electionParticipation.slice(0, 5),
            recentActions: [{ adminName: 'System', action: 'Dashboard Sync', date: new Date().toISOString() }],
            userGrowth: [
                { month: 'Jan', count: Math.floor(totalUsers * 0.2) }, { month: 'May', count: totalUsers }
            ]
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
    const admins = await User.find({ 
        role: { $in: ['admin', 'super_admin'] } 
    }).select("-password").lean();
    res.json(admins);
});

// @desc    Get admin activities with optimized filtering
const getAdminActivities = asyncHandler(async (req, res) => {
    const { limit = 50, adminId, action, startDate, endDate } = req.query;
    const { role: currentUserRole } = req.user;

    const query = { user: { $ne: null } };
    if (adminId) query.user = adminId;
    if (action) query.action = action;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await Log.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

    const filteredLogs = logs.filter(log => {
        if (!log.user) return false;
        if (currentUserRole === 'super_admin') return true;
        if (currentUserRole === 'admin') return log.user.role === 'student';
        return false;
    });

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
        ipAddress: log.ipAddress || 'Unknown'
    }));

    res.json(activities);
});

// @desc    Create new observer
const createObserver = asyncHandler(async (req, res) => {
    const { name, email, password, organization, accessLevel, assignedElections } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Name, email, and password are required");
    }

    const emailLower = email.toLowerCase();
    const userExists = await User.findOne({ email: emailLower }).lean();
    if (userExists) {
        res.status(400);
        throw new Error("User with this email already exists");
    }

    const observer = await User.create({
        name,
        email: emailLower,
        password,
        role: 'observer',
        isVerified: true,
        observerInfo: {
            organization: organization || '',
            accessLevel: accessLevel || 'election-specific',
            assignedElections: assignedElections || [],
            assignedBy: req.user._id,
            assignedDate: new Date()
        }
    });

    await logActivity({
        userId: req.user._id, 
        action: 'create', 
        entityType: 'User', 
        entityId: observer._id, 
        details: `Created Observer: ${emailLower}`, 
        status: 'success', 
        ipAddress: getIpAddress(req), 
        userAgent: getUserAgent(req)
    });

    res.status(201).json({ success: true, data: observer });
});

// @desc    Update profile picture
const updateProfilePicture = asyncHandler(async (req, res) => {
    if (!req.file?.path) return res.status(400).json({ message: 'No image uploaded' });

    const user = await User.findByIdAndUpdate(
        req.user._id, 
        { profilePicture: req.file.path }, 
        { new: true }
    ).select('profilePicture').lean();

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, profilePicture: user.profilePicture });
});

const updateAdminStatus = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: req.body.status }, { new: true });
    if (!user) return res.status(404).json({ message: "Admin not found" });
    
    await logActivity({ 
        userId: req.user._id, 
        action: 'update', 
        entityType: 'User', 
        entityId: user._id, 
        details: `Status changed to: ${req.body.status}`, 
        status: 'success', 
        ipAddress: getIpAddress(req), 
        userAgent: getUserAgent(req) 
    });
    res.json({ message: "Status updated" });
});

const deleteAdmin = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Admin not found" });
    
    await logActivity({ 
        userId: req.user._id, 
        action: 'delete', 
        entityType: 'User', 
        entityId: req.params.id, 
        details: `Deleted: ${user.email}`, 
        status: 'success', 
        ipAddress: getIpAddress(req), 
        userAgent: getUserAgent(req) 
    });
    res.json({ message: "Admin deleted" });
});

const getAllObservers = asyncHandler(async (req, res) => {
    const observers = await User.find({ role: 'observer' })
        .populate('observerInfo.assignedElections', 'title status')
        .select('-password').sort('-createdAt').lean();
    res.json({ success: true, count: observers.length, data: observers });
});

module.exports = {
    getSystemSummary, 
    getAllAdmins, 
    updateAdminStatus, 
    deleteAdmin, 
    getAdminActivities, 
    createObserver, 
    getAllObservers, 
    updateProfilePicture
};
