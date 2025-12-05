const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllNotifications,
  createNotification,
  getNotificationById,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// Get notification count
router.get('/count', protect, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const count = await Notification.countDocuments({
      $or: [
        { targetAudience: 'all' },
        { targetAudience: req.user.role === 'admin' ? 'admins' : 'students' }
      ]
    });
    res.json({ count });
  } catch (error) {
    console.error('Notification count error:', error);
    res.status(500).json({ message: 'Failed to get notification count', error: error.message });
  }
});

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

module.exports = router;