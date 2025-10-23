const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
const getAllNotifications = asyncHandler(async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { targetAudience: 'all' },
                { targetAudience: req.user.role === 'admin' ? 'admins' : 'students' }
            ]
        }).sort({ createdAt: -1 });

        console.log({ message: 'Fetched all notifications' });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        // Include stack in logs for debugging
        if (process.env.NODE_ENV === 'development') console.error(error.stack);
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
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            if (!notification.readBy.includes(req.user._id)) {
                notification.readBy.push(req.user._id);
                await notification.save();
            }
            // Emit socket event to notify that this notification was read
            try {
                const io = req.app.get('io');
                if (io) {
                    io.to(req.user._id.toString()).emit('notification:read', { notificationId: notification._id, userId: req.user._id });
                }
            } catch (emitErr) {
                console.log('Socket emit error (markAsRead):', emitErr.message);
            }

            console.log({ message: 'Notification marked as read' });
            res.status(200).json({ message: 'Notification marked as read' });
        } else {
            console.log({ message: 'Notification not found' });
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        if (error.name === 'ValidationError') {
            const details = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', details });
        }
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