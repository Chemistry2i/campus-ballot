const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
    getAllNotifications,
    createNotification,
    getNotificationById,
    markAsRead,
    deleteNotification
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/notifications - Get all notifications for the logged-in user
router.get('/', protect, getAllNotifications);

// POST /api/notifications - Create a new notification (admin only)
router.post('/', protect, adminOnly, createNotification);

// GET /api/notifications/:id - Get a single notification by ID
router.get('/:id', protect, getNotificationById);

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', protect, markAsRead);

// DELETE /api/notifications/:id - Delete a notification (admin only)
router.delete('/:id', protect, adminOnly, deleteNotification);

// This is the crucial part that fixes the error
module.exports = router;