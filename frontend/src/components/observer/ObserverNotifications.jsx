import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from '../../utils/axiosInstance';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';

const ObserverNotifications = () => {
  const { isDarkMode, colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState('all');

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data?.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/observer/notifications/${notificationId}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
      // Still update locally even if API fails
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    }
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n._id !== notificationId));
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(n =>
          axios.post(`/api/observer/notifications/${n._id}/mark-read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      election_started: '🎯',
      milestone_reached: '🏆',
      incident_alert: '⚠️',
      system_alert: '🔔',
      vote_recorded: '🗳️'
    };
    return iconMap[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      election_started: '#3b82f6',
      milestone_reached: '#10b981',
      incident_alert: '#ef4444',
      system_alert: '#f59e0b',
      vote_recorded: '#8b5cf6'
    };
    return colorMap[type] || '#6b7280';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterRead === 'unread') return !n.isRead;
    if (filterRead === 'read') return n.isRead;
    return true;
  });

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
            <FaBell className="me-2" />
            Notifications
          </h3>
          <p className="text-muted mb-0">Stay updated with important alerts and events</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={markAllAsRead}
          >
            <FaCheck className="me-1" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          {['all', 'unread', 'read'].map(type => (
            <button
              key={type}
              className={`btn ${filterRead === type ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterRead(type)}
              style={
                filterRead === type
                  ? { background: colors.primary, border: `1px solid ${colors.primary}` }
                  : {
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text
                    }
              }
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {type === 'unread' && notifications.filter(n => !n.isRead).length > 0 && (
                <span
                  className="badge bg-danger ms-2"
                  style={{ borderRadius: '10px' }}
                >
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" style={{ color: colors.primary }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="list-group">
          {filteredNotifications.map(notification => (
            <div
              key={notification._id}
              className="list-group-item"
              style={{
                background: notification.isRead ? colors.background : `${colors.primary}10`,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                padding: '16px'
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex gap-3 flex-grow-1">
                  {/* Icon */}
                  <div
                    style={{
                      fontSize: '24px',
                      minWidth: '32px',
                      textAlign: 'center'
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="mb-0" style={{ fontWeight: '600' }}>
                        {notification.title}
                      </h6>
                      {!notification.isRead && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: colors.primary
                          }}
                        ></span>
                      )}
                    </div>
                    <p style={{ color: colors.textSecondary, marginBottom: '8px' }}>
                      {notification.message}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small style={{ color: colors.textSecondary }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2 ms-3">
                  {!notification.isRead && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => markAsRead(notification._id)}
                      title="Mark as read"
                      style={{ border: `1px solid ${colors.primary}` }}
                    >
                      <FaCheck size={14} />
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteNotification(notification._id)}
                    title="Delete"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="alert alert-info"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.text
          }}
        >
          {filterRead === 'unread' ? 'No unread notifications' : 'No notifications found'}
        </div>
      )}
    </div>
  );
};

export default ObserverNotifications;
