const express = require('express');

// Import necessary controllers and middlewares
const {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Create a new router instance
const router = express.Router();

// Register a new user (student or admin)
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', protect, logout);

// Email verification
router.get('/verify/:token', verifyEmail);

// Forgot password (send reset link)
router.post('/forgot-password', forgotPassword);

// Reset password using token
router.post('/reset-password/:token', resetPassword);

// Get current user's profile
router.get('/profile', protect, getProfile);

// Update current user's profile
router.put('/profile', protect, updateProfile);

// Change password for logged-in user
router.put('/change-password', protect, changePassword);

module.exports = router;