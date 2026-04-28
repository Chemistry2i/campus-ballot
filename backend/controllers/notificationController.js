const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
const getAllNotifications = asyncHandler(async (req, res) => {
    try {
        const audience = req.user.role === 'admin' || req.user.role === 'super_admin'
            ? 'admins'
            : 'students';

        // Only fetch active notifications for this user's audience.
        // Limit to 50 most recent — the old unbounded fetch returned ALL
        // notifications ever created, which could be thousands.
        // The compound index { targetAudience, isActive, createdAt } covers this query.
        const notifications = await Notification.find({
            isActive: true,
            $or: [
                { targetAudience: 'all' },
                { targetAudience: audience }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
});

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res) => {
    try {
        const { title, message, type, targetAudience } = req.body;

        if (!title || !message || !type) {
            console.log({ message: 'Missing required fields for notification' });
            return res.status(400).json({ message: 'Please provide title, message, and type for the notification.' });
        }

        const notification = await Notification.create({
            title,
            message,
            type,
            targetAudience,
            createdBy: req.user._id
        });

        // Emit socket event to notify connected clients in relevant rooms
        try {
            const io = req.app.get('io');
            if (io) {
                // broadcast to all clients that match the target audience
                if (!targetAudience || targetAudience === 'all') {
                    io.emit('notification:new', notification);
                } else if (targetAudience === 'admins') {
                    io.to('admins').emit('notification:new', notification);
                } else if (targetAudience === 'students') {
                    io.to('students').emit('notification:new', notification);
                }
            }
        } catch (emitErr) {
            console.log('Socket emit error (createNotification):', emitErr.message);
        }

        console.log({ message: 'Notification created' });
        res.status(201).json(notification);
    } catch (error) {
        // If this is a Mongoose validation error, return 400 with details
        console.error('Error creating notification:', error);
        if (error.name === 'ValidationError') {
            const details = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', details });
        }
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get a single notification by ID
// @route   GET /api/notifications/:id
// @access  Private
const getNotificationById = asyncHandler(async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            console.log({ message: 'Fetched notification by ID' });
            res.status(200).json(notification);
        } else {
            console.log({ message: 'Notification not found' });
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        console.log({ message: 'Error fetching notification by ID', error: error.message });
        res.status(500).json({ message: error.message });
    }
});

// @desc    Mark a notification as read by the current user
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    try {
        // Use findByIdAndUpdate with $addToSet to atomically add the userId
        // to readBy without loading the full document.
        // $addToSet guarantees no duplicates without a separate includes() check.
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { readBy: req.user._id } },
            { new: false }  // We don't need the updated doc returned
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        try {
            const io = req.app.get('io');
            if (io) {
                io.to(req.user._id.toString()).emit('notification:read', {
                    notificationId: notification._id,
                    userId: req.user._id
                });
            }
        } catch (emitErr) {
            console.log('Socket emit error (markAsRead):', emitErr.message);
        }

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = asyncHandler(async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            await notification.deleteOne();
            // Emit socket event so clients can remove the notification from their UI
            try {
                const io = req.app.get('io');
                if (io) {
                    io.emit('notification:deleted', { notificationId: notification._id });
                }
            } catch (emitErr) {
                console.log('Socket emit error (deleteNotification):', emitErr.message);
            }

            console.log({ message: 'Notification removed successfully' });
            res.status(200).json({ message: 'Notification removed successfully' });
        } else {
            console.log({ message: 'Notification not found' });
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        if (error.name === 'ValidationError') {
            const details = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', details });
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    getAllNotifications,
    createNotification,
    getNotificationById,
    markAsRead,
    deleteNotification
};