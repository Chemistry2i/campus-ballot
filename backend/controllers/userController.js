const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Admin only
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("-password");
    console.log({ message: "Fetched all users" });
    res.json(users);
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
    console.log({ message: "User updated by admin" });
    res.json({ message: "User updated", user });
  } catch (error) {
    console.log({ message: "Error updating user", error: error.message });
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
    await user.deleteOne();
    console.log({ message: "User deleted by admin" });
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
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    user.accountStatus = "suspended";
    await user.save();
    console.log({ message: "User suspended" });
    res.json({ message: "User suspended" });
  } catch (error) {
    console.log({ message: "Error suspending user", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Activate user (admin)
// @route   PUT /api/users/:id/activate
// @access  Admin only
const activateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    user.accountStatus = "active";
    await user.save();
    console.log({ message: "User activated" });
    res.json({ message: "User activated" });
  } catch (error) {
    console.log({ message: "Error activating user", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user's profile
// @route   GET /api/users/me/profile
// @access  User
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      console.log({ message: "User not found" });
      return res.status(404).json({ message: "User not found" });
    }
    console.log({ message: "Fetched own profile" });
    res.json(user);
  } catch (error) {
    console.log({ message: "Error fetching own profile", error: error.message });
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
    Object.assign(user, req.body);
    await user.save();
    console.log({ message: "Updated own profile" });
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
    const { q } = req.query;
    const query = q
      ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] }
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
    const users = await User.find().select("-password");
    // You can format/export as CSV or Excel here if needed
    console.log({ message: "Exported users" });
    res.json(users);
  } catch (error) {
    console.log({ message: "Error exporting users", error: error.message });
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
  exportUsers
};