const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const fs = require('fs');
const path = require('path');
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// Helper to escape regex special characters
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// @desc    Get all users (admin) with pagination and search
// @route   GET /api/users
// @access  Admin only
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    // Extract pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? escapeRegex(String(req.query.search)) : '';
    const role = req.query.role || ''; // Add role filter
    const searchField = req.query.searchField || ''; // Specific field to search
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build search query
    let query = {};
    
    // Add role filter if provided
    if (role && role.trim()) {
      query.role = role.trim();
    }
    
    if (search && search.trim()) {
      // If specific field is selected, search only that field
      if (searchField && searchField !== 'all') {
        query[searchField] = { $regex: search, $options: "i" };
      } else {
        // Search across all fields
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { studentId: { $regex: search, $options: "i" } }
        ];
      }
    }
    
    // Execute queries
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);
    
    console.log({ 
      message: "Fetched users with pagination", 
      page, 
      limit, 
      totalUsers, 
      totalPages,
      search: search || 'none'
    });
    
    res.json({
      users,
      totalUsers,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.log({ message: "Error fetching users", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user by ID (admin)
// @route   GET /api/users/:id
// @access  Admin only
const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    console.log({ message: "Fetched user by ID" });
    res.json(user);
  } catch (error) {
    console.log({ message: "Error fetching user by ID", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user by ID (admin)
// @route   PUT /api/users/:id
// @access  Admin only
const updateUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    Object.assign(user, req.body);
    await user.save();
    
    // Log activity if admin updated user
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      await logActivity({
        userId: req.user._id,
        action: 'update',
        entityType: 'User',
        entityId: user._id.toString(),
        details: `Updated user: ${user.email}`,
        status: 'success',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
      });
    }
    
    console.log({ message: "User updated by admin" });
    try {
      const io = req.app.get('io');
      if (io) io.emit('user:updated', { user });
    } catch (e) {
      console.error('Socket emit error (user updated):', e.message);
    }
    res.json({ message: "User updated", user });
  } catch (error) {
    console.log({ message: "Error updating user", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user photo (admin or owner)
// @route   PUT /api/users/:id/photo
// @access  Protected (admin or owner)
const updateUserPhoto = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Authorization: allow if admin or owner
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Store the Cloudinary URL directly from req.file.path
    user.profilePicture = req.file.path;
    await user.save();

    try {
      const io = req.app.get('io');
      if (io) io.emit('user:photo:updated', { userId: user._id, profilePicture: user.profilePicture });
    } catch (e) {
      console.error('Socket emit error (user photo updated):', e.message);
    }

    res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user's profile photo (admin or owner)
// @route   DELETE /api/users/:id/photo
// @access  Protected (admin or owner)
const deleteUserPhoto = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Authorization: allow if admin or owner
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!user.profilePicture) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    // Extract public_id from Cloudinary URL to delete from Cloudinary
    const cloudinary = require('../config/cloudinary').cloudinary;
    try {
      // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v.../public_id
      const urlParts = user.profilePicture.split('/');
      const fileName = urlParts[urlParts.length - 1].split('.')[0]; // Get filename without extension
      const publicId = `campus-ballot/profiles/${fileName}`;
      
      await cloudinary.uploader.destroy(publicId);
      console.log('✅ Deleted from Cloudinary:', publicId);
    } catch (cloudErr) {
      console.error('Error deleting from Cloudinary:', cloudErr.message);
      // Continue to clear DB even if Cloudinary deletion fails
    }

    user.profilePicture = null;
    await user.save();

    try {
      const io = req.app.get('io');
      if (io) io.emit('user:photo:deleted', { userId: user._id });
    } catch (e) {
      console.error('Socket emit error (user photo deleted):', e.message);
    }

    res.json({ message: 'Profile picture deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user by ID (admin)
// @route   DELETE /api/users/:id
// @access  Admin only
const deleteUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
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
      details: `Deleted user: ${userEmail}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    console.log({ message: "User deleted by admin" });
    try {
      const io = req.app.get('io');
      if (io) io.emit('user:deleted', { id: userId });
    } catch (e) {
      console.error('Socket emit error (user deleted):', e.message);
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    console.log({ message: "Error deleting user", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Suspend user (admin)
// @route   PUT /api/users/:id/suspend
// @access  Admin only
const suspendUser = asyncHandler(async (req, res) => {
  try {
    // Atomic targeted update — no full document load or save required
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { accountStatus: 'suspended' } },
      { new: true, select: '_id email' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fire-and-forget audit log
    logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `Suspended user: ${user.email}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    }).catch(err => console.error('[USER] suspendUser log failed:', err.message));

    try {
      const io = req.app.get('io');
      if (io) io.emit('user:suspended', { id: user._id });
    } catch (e) {
      console.error('Socket emit error (user suspended):', e.message);
    }
    res.json({ message: 'User suspended' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Activate user (admin)
// @route   PUT /api/users/:id/activate
// @access  Admin only
const activateUser = asyncHandler(async (req, res) => {
  try {
    // Atomic targeted update — no full document load or save required
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { accountStatus: 'active' } },
      { new: true, select: '_id email' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fire-and-forget audit log
    logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `Activated user: ${user.email}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    }).catch(err => console.error('[USER] activateUser log failed:', err.message));

    try {
      const io = req.app.get('io');
      if (io) io.emit('user:activated', { id: user._id });
    } catch (e) {
      console.error('Socket emit error (user activated):', e.message);
    }
    res.json({ message: 'User activated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user's profile
// @route   GET /api/users/me/profile
// @access  User
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  try {
    // .lean() returns a plain JS object instead of a Mongoose Document.
    // Since we immediately serialize this to JSON, the Mongoose overhead
    // (getters, virtuals tracking, change detection) is wasted work.
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('organization', '_id name code type parent')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update current user's profile
// @route   PUT /api/users/me/profile
// @access  User
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    
    // SECURITY: Whitelist allowed fields to prevent privilege escalation (e.g. changing role to admin)
    const allowedUpdates = ['name', 'phone', 'faculty', 'course', 'yearOfStudy', 'gender', 'department', 'bio', 'profilePicture'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = req.body[key];
      }
    });
    
    // Object.assign(user, req.body); // VULNERABLE CODE REMOVED
    await user.save();
    console.log({ message: "Updated own profile" });
    try {
      const io = req.app.get('io');
      if (io) io.emit('user:profile:updated', { user });
    } catch (e) {
      console.error('Socket emit error (profile updated):', e.message);
    }
    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.log({ message: "Error updating own profile", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search or filter users (admin)
// @route   GET /api/users/search
// @access  Admin only
const searchUsers = asyncHandler(async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q) : '';
    const safeQ = escapeRegex(q);
    const query = safeQ
      ? { $or: [{ name: { $regex: safeQ, $options: "i" } }, { email: { $regex: safeQ, $options: "i" } }] }
      : {};
    const users = await User.find(query).select("-password");
    console.log({ message: "Searched users" });
    res.json(users);
  } catch (error) {
    console.log({ message: "Error searching users", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Change user role (admin)
// @route   PUT /api/users/:id/role
// @access  Admin only
const changeUserRole = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    user.role = req.body.role;
    await user.save();
    console.log({ message: "User role changed" });
    try {
      const io = req.app.get('io');
      if (io) io.emit('user:role:changed', { user });
    } catch (e) {
      console.error('Socket emit error (user role changed):', e.message);
    }
    res.json({ message: "User role updated", user });
  } catch (error) {
    console.log({ message: "Error changing user role", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user's voting history
// @route   GET /api/users/me/votes
// @access  User
const getUserVotingHistory = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("votingStatus");
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    console.log({ message: "Fetched voting history" });
    res.json(user.votingStatus);
  } catch (error) {
    console.log({ message: "Error fetching voting history", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user's notifications (dummy)
// @route   GET /api/users/me/notifications
// @access  User
const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    // Replace with real notification logic if you have a Notification model
    console.log({ message: "Fetched notifications" });
    res.json([{ message: "No notifications yet." }]);
  } catch (error) {
    console.log({ message: "Error fetching notifications", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Deactivate own account
// @route   PUT /api/users/me/deactivate
// @access  User
const deactivateOwnAccount = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    user.accountStatus = "deactivated";
    await user.save();
    console.log({ message: "Account deactivated" });
    res.json({ message: "Account deactivated" });
  } catch (error) {
    console.log({ message: "Error deactivating account", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reactivate own account
// @route   PUT /api/users/me/reactivate
// @access  User
const reactivateOwnAccount = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    user.accountStatus = "active";
    await user.save();
    console.log({ message: "Account reactivated" });
    res.json({ message: "Account reactivated" });
  } catch (error) {
    console.log({ message: "Error reactivating account", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Export users (admin)
// @route   GET /api/users/export
// @access  Admin only
const exportUsers = asyncHandler(async (req, res) => {
  try {
    // Hard cap at 10,000 rows with .lean() to prevent OOM.
    // The original unbounded User.find() could return 50,000+ Mongoose
    // documents eating gigabytes of RAM during peak elections.
    const users = await User.find()
      .select('-password')
      .limit(10000)
      .lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users for dropdown/select (without pagination)
// @route   GET /api/users/all
// @access  Admin only
const getAllUsersForSelect = asyncHandler(async (req, res) => {
  try {
    const search = req.query.search || '';
    
    // Build search query
    let query = {};
    if (search && search.trim()) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { studentId: { $regex: search, $options: "i" } }
        ]
      };
    }
    
    // Fetch all users without pagination, only essential fields for dropdown
    const users = await User.find(query)
      .select("name email studentId _id")
      .sort({ name: 1 }); // Sort by name alphabetically
    
    console.log({ 
      message: "Fetched all users for select dropdown", 
      totalUsers: users.length,
      search: search || 'none'
    });
    
    res.json({
      users,
      totalUsers: users.length
    });
  } catch (error) {
    console.log({ message: "Error fetching users for select", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  suspendUser,
  activateUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  searchUsers,
  changeUserRole,
  getUserVotingHistory,
  getUserNotifications,
  deactivateOwnAccount,
  reactivateOwnAccount,
  exportUsers,
  updateUserPhoto,
  deleteUserPhoto,
  getAllUsersForSelect
};
