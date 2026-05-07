import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import axios from '../../utils/axiosInstance';
import { confirmLogout } from '../../utils/sweetAlerts';

const ObserverHeader = ({ user, isMobile, sidebarCollapsed, setSidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, colors, toggleTheme } = useTheme();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mark as read if current user is in readBy
      const userId = user?._id;
      const mapped = res.data.map(n => ({
        ...n,
        read: n.readBy && userId ? n.readBy.includes(userId) : false
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch notifications on mount and when showNotifications changes
  useEffect(() => {
    if (showNotifications && user) {
      fetchNotifications();
    }
  }, [showNotifications, user]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/observer/dashboard') {
      return {
        title: 'Observer Dashboard',
        subtitle: 'Monitor election activities and statistics',
        icon: 'chart-line',
        breadcrumbs: [{ label: 'Home', path: '/observer/dashboard' }]
      };
    }
    if (path.startsWith('/observer/elections/')) {
      return {
        title: 'Election Monitor',
        subtitle: 'Real-time election monitoring',
        icon: 'poll-h',
        breadcrumbs: [
          { label: 'Home', path: '/observer/dashboard' },
          { label: 'Elections', path: '/observer/elections' }
        ]
      };
    }
    if (path === '/observer/profile') {
      return {
        title: 'Profile Settings',
        subtitle: 'Manage your profile settings',
        icon: 'user-cog',
        breadcrumbs: [
          { label: 'Home', path: '/observer/dashboard' },
          { label: 'Profile', path: '/observer/profile' }
        ]
      };
    }
    return {
      title: 'Observer Panel',
      subtitle: 'Election oversight and transparency',
      icon: 'eye',
      breadcrumbs: [{ label: 'Home', path: '/observer/dashboard' }]
    };
  };

  const pageInfo = getPageInfo();

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'election': return 'poll-h';
      case 'vote': return 'vote-yea';
      case 'result': return 'chart-bar';
      case 'alert': return 'exclamation-triangle';
      case 'success': return 'check-circle';
      case 'info': 
      default: return 'info-circle';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'alert': return '#f59e0b';
      case 'success': return '#10b981';
      case 'result': return '#8b5cf6';
      case 'election': return '#3b82f6';
      case 'vote': return '#06b6d4';
      case 'info':
      default: return '#6b7280';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'OB';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className="shadow-sm"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(16, 185, 129, 0.01) 100%)'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, #ffffff 100%)',
        borderBottom: `2px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`,
        padding: isMobile ? '1rem 1rem' : '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Main Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          {isMobile && (
            <button
              className="btn btn-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.75rem)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <i className="fas fa-bars"></i>
            </button>
          )}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <div style={{
                width: 'clamp(2rem, 4vw, 2.25rem)',
                height: 'clamp(2rem, 4vw, 2.25rem)',
                borderRadius: 'clamp(0.5rem, 1.5vw, 0.625rem)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0.25rem 0.75rem rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.2s'
              }}>
                <i className={`fas fa-${pageInfo.icon}`} style={{ color: '#fff', fontSize: 'clamp(0.84rem !important, 2vw, 1rem)' }}></i>
              </div>
              <div>
                <h4 className="mb-0" style={{ 
                  color: colors.text,
                  fontWeight: 700,
                  fontSize: isMobile ? 'clamp(0.84rem !important, 3vw, 1rem)' : 'clamp(1rem, 2.5vw, 1.3rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}>
                  {pageInfo.title}
                </h4>
                {!isMobile && (
                  <small style={{ 
                    color: colors.textMuted,
                    fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                    display: 'block'
                  }}>
                    {pageInfo.subtitle}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Connection Status */}
          {!isMobile && (
            <div className="d-flex align-items-center gap-2 me-2" style={{
              padding: 'clamp(0.3rem, 1vw, 0.4rem) clamp(0.6rem, 1.5vw, 0.75rem)',
              borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
              color: colors.textMuted
            }}>
              <div style={{
                width: 'clamp(0.4rem, 1vw, 0.5rem)',
                height: 'clamp(0.4rem, 1vw, 0.5rem)',
                borderRadius: '50%',
                background: isOnline ? '#10b981' : '#ef4444',
                boxShadow: isOnline ? '0 0 0.5rem rgba(16, 185, 129, 0.5)' : '0 0 0.5rem rgba(239, 68, 68, 0.5)',
                animation: isOnline ? 'pulse 2s infinite' : 'none'
              }}></div>
              <span style={{ fontWeight: 500 }}>{formatTime(currentTime)}</span>
            </div>
          )}

          {/* Search Button */}
          <button
            className="btn btn-sm position-relative"
            onClick={() => setShowSearch(!showSearch)}
            style={{
              background: showSearch ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.text,
              borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
              padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.75rem)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              if (!showSearch) e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = colors.border;
            }}
            title="Search"
          >
            <i className="fas fa-search"></i>
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-sm position-relative"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: showNotifications ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.75rem)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                if (!showNotifications) e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = colors.border;
              }}
              title="Notifications"
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  right: '-0.25rem',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 'clamp(1rem, 2vw, 1.125rem)',
                  height: 'clamp(1rem, 2vw, 1.125rem)',
                  fontSize: 'clamp(0.6rem, 1.2vw, 0.65rem)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.2)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: 'clamp(18rem, 40vw, 21rem)',
                maxHeight: '25rem',
                overflowY: 'auto',
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.15)',
                zIndex: 1001
              }}>
                <div style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem)',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h6 className="mb-0" style={{ color: colors.text, fontWeight: 600, fontSize: 'clamp(0.84rem !important, 2vw, 0.95rem)' }}>
                    Notifications
                  </h6>
                  {unreadCount > 0 && (
                    <span style={{
                      background: '#10b981',
                      color: '#fff',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                      fontSize: 'clamp(0.65rem, 1.2vw, 0.7rem)',
                      fontWeight: 600
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div>
                  {loadingNotifications ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: colors.textMuted }}>
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
                      <p style={{ marginTop: '0.5rem', fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)' }}>Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: colors.textMuted }}>
                      <i className="fas fa-bell-slash" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                      <p style={{ marginTop: '0.5rem', fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)' }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <div 
                        key={notif._id} 
                        onClick={() => markAsRead(notif._id)}
                        style={{
                          padding: 'clamp(0.75rem, 2vw, 0.84rem !important) clamp(0.84rem !important, 2vw, 1rem)',
                          borderBottom: `1px solid ${colors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: notif.read ? 'transparent' : isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
                        onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)'}
                      >
                        <div className="d-flex align-items-start gap-2">
                          <div style={{
                            width: 'clamp(0.4rem, 1vw, 0.5rem)',
                            height: 'clamp(0.4rem, 1vw, 0.5rem)',
                            borderRadius: '50%',
                            background: notif.read ? 'transparent' : '#10b981',
                            marginTop: '0.375rem',
                            flexShrink: 0
                          }}></div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            {notif.title && (
                              <p className="mb-1" style={{
                                color: colors.text,
                                fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                                fontWeight: notif.read ? 500 : 600,
                                lineHeight: 1.4
                              }}>
                                {notif.title}
                              </p>
                            )}
                            <p className="mb-1" style={{
                              color: notif.read ? colors.textMuted : colors.text,
                              fontSize: 'clamp(0.75rem, 1.4vw, 0.8rem)',
                              fontWeight: notif.read ? 400 : 500,
                              lineHeight: 1.4,
                              wordWrap: 'break-word'
                            }}>
                              {notif.message}
                            </p>
                            <small style={{ color: colors.textMuted, fontSize: 'clamp(0.7rem, 1.3vw, 0.75rem)' }}>
                              {formatNotificationTime(notif.createdAt)}
                            </small>
                          </div>
                          <i className={`fas fa-${getNotificationIcon(notif.type)}`}
                            style={{
                              color: getNotificationColor(notif.type),
                              fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                              flexShrink: 0
                            }}
                          ></i>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div style={{
                    padding: 'clamp(0.65rem, 1.5vw, 0.75rem) clamp(0.84rem !important, 2vw, 1rem)',
                    textAlign: 'center'
                  }}>
                    <button 
                      onClick={() => {
                        navigate('/observer/notifications');
                        setShowNotifications(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#10b981',
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {!isMobile && (
            <button
              onClick={toggleTheme}
              className="btn btn-sm"
              style={{
                background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
                color: '#10b981',
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.75rem)',
                transition: 'all 0.2s',
                fontWeight: 600,
                fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
            </button>
          )}

          {/* Access Level Badge */}
          {!isMobile && user?.observerInfo?.accessLevel && (
            <span className="badge" style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.7rem, 1.5vw, 0.84rem !important)',
              fontSize: 'clamp(0.7rem, 1.4vw, 0.75rem)',
              fontWeight: 600,
              borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
              boxShadow: '0 0.125rem 0.5rem rgba(16, 185, 129, 0.25)'
            }}>
              <i className="fas fa-shield-halved me-2"></i>
              {user.observerInfo.accessLevel === 'full' ? 'Full Access' : 'Limited'}
            </span>
          )}

          {/* User Profile Menu */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-sm d-flex align-items-center gap-2"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                background: showProfileMenu ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: 'clamp(0.5rem, 1.2vw, 0.625rem)',
                padding: 'clamp(0.3rem, 0.8vw, 0.35rem) clamp(0.6rem, 1.5vw, 0.75rem)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                if (!showProfileMenu) e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <div style={{
                width: 'clamp(1.75rem, 3vw, 2rem)',
                height: 'clamp(1.75rem, 3vw, 2rem)',
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                fontWeight: 700,
                color: '#fff',
                boxShadow: '0 0.125rem 0.5rem rgba(16, 185, 129, 0.3)'
              }}>
                {getUserInitials()}
              </div>
              {!isMobile && (
                <>
                  <span style={{
                    color: colors.text,
                    fontWeight: 600,
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                    maxWidth: '7.5rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.name || 'Observer'}
                  </span>
                  <i className="fas fa-chevron-down" style={{
                    fontSize: 'clamp(0.65rem, 1.2vw, 0.7rem)',
                    color: colors.textMuted,
                    transition: 'transform 0.2s',
                    transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}></i>
                </>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: 'clamp(13rem, 30vw, 15rem)',
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.15)',
                zIndex: 1001,
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem)',
                  borderBottom: `1px solid ${colors.border}`,
                  background: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)'
                }}>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div style={{
                      width: 'clamp(2.5rem, 5vw, 3rem)',
                      height: 'clamp(2.5rem, 5vw, 3rem)',
                      borderRadius: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                      fontWeight: 700,
                      color: '#fff',
                      boxShadow: '0 0.25rem 0.75rem rgba(16, 185, 129, 0.3)'
                    }}>
                      {getUserInitials()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ 
                        color: colors.text, 
                        fontWeight: 600, 
                        fontSize: 'clamp(0.85rem, 1.8vw, 0.9rem)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user?.name || 'Observer'}
                      </div>
                      <div style={{ 
                        color: colors.textMuted, 
                        fontSize: 'clamp(0.7rem, 1.4vw, 0.75rem)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user?.email || 'observer@example.com'}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 'clamp(0.4rem, 1vw, 0.5rem)' }}>
                  <button
                    onClick={() => {
                      navigate('/observer/profile');
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.65rem, 1.5vw, 0.75rem) clamp(0.84rem !important, 2vw, 1rem)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                      color: colors.text,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <i className="fas fa-user me-3" style={{ width: '1rem', color: '#10b981' }}></i>
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/observer/dashboard');
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.65rem, 1.5vw, 0.75rem) clamp(0.84rem !important, 2vw, 1rem)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                      color: colors.text,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <i className="fas fa-chart-line me-3" style={{ width: '1rem', color: '#10b981' }}></i>
                    Dashboard
                  </button>
                  <button
                    style={{
                      width: '100%',
                      padding: 'clamp(0.65rem, 1.5vw, 0.75rem) clamp(0.84rem !important, 2vw, 1rem)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                      color: colors.text,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <i className="fas fa-cog me-3" style={{ width: '1rem', color: '#10b981' }}></i>
                    Settings
                  </button>
                  <button
                    style={{
                      width: '100%',
                      padding: 'clamp(0.65rem, 1.5vw, 0.75rem) clamp(0.84rem !important, 2vw, 1rem)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                      color: colors.text,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <i className="fas fa-question-circle me-3" style={{ width: '1rem', color: '#10b981' }}></i>
                    Help & Support
                  </button>
                </div>
                <div style={{
                  padding: 'clamp(0.4rem, 1vw, 0.5rem)',
                  borderTop: `1px solid ${colors.border}`
                }}>
                  <button
                    onClick={async () => {
                      const result = await confirmLogout(isDarkMode);
                      if (result.isConfirmed) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.65rem, 1.5vw, 0.75rem) clamp(0.84rem !important, 2vw, 1rem)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                      color: '#ef4444',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)',
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <i className="fas fa-sign-out-alt me-3" style={{ width: '1rem' }}></i>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs Row */}
      {!isMobile && pageInfo.breadcrumbs.length > 1 && (
        <div className="d-flex align-items-center gap-2" style={{ fontSize: 'clamp(0.75rem, 1.4vw, 0.8rem)', color: colors.textMuted }}>
          {pageInfo.breadcrumbs.map((crumb, index) => (
            <div key={index} className="d-flex align-items-center gap-2">
              <button
                onClick={() => navigate(crumb.path)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: index === pageInfo.breadcrumbs.length - 1 ? '#10b981' : colors.textMuted,
                  cursor: 'pointer',
                  fontWeight: index === pageInfo.breadcrumbs.length - 1 ? 600 : 400,
                  padding: 0,
                  transition: 'color 0.2s',
                  fontSize: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={(e) => {
                  if (index !== pageInfo.breadcrumbs.length - 1) {
                    e.currentTarget.style.color = colors.textMuted;
                  }
                }}
              >
                {crumb.label}
              </button>
              {index < pageInfo.breadcrumbs.length - 1 && (
                <i className="fas fa-chevron-right" style={{ fontSize: 'clamp(0.6rem, 1.2vw, 0.65rem)' }}></i>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div style={{
          marginTop: 'clamp(0.75rem, 2vw, 1rem)',
          padding: 'clamp(0.75rem, 1.8vw, 0.84rem !important)',
          background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
          borderRadius: 'clamp(0.5rem, 1.2vw, 0.625rem)',
          border: `1px solid ${colors.border}`
        }}>
          <form onSubmit={handleSearch} className="d-flex align-items-center gap-2">
            <div className="flex-grow-1 position-relative">
              <i className="fas fa-search" style={{
                position: 'absolute',
                left: 'clamp(0.75rem, 1.5vw, 0.84rem !important)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textMuted,
                fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)'
              }}></i>
              <input
                type="text"
                placeholder="Search elections, reports, statistics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: 'clamp(0.5rem, 1.2vw, 0.625rem) clamp(0.84rem !important, 2vw, 1rem) clamp(0.5rem, 1.2vw, 0.625rem) clamp(2rem, 4vw, 2.5rem)',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                  color: colors.text,
                  fontSize: 'clamp(0.8rem, 1.6vw, 0.84rem !important)',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
                onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: 'clamp(0.5rem, 1.2vw, 0.625rem) clamp(1rem, 2.5vw, 1.25rem)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                color: '#fff',
                fontSize: 'clamp(0.8rem, 1.6vw, 0.84rem !important)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0.125rem 0.5rem rgba(16, 185, 129, 0.25)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-0.125rem)';
                e.currentTarget.style.boxShadow = '0 0.25rem 0.75rem rgba(16, 185, 129, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0.125rem 0.5rem rgba(16, 185, 129, 0.25)';
              }}
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              style={{
                padding: 'clamp(0.5rem, 1.2vw, 0.625rem) clamp(0.84rem !important, 2vw, 1rem)',
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                color: colors.text,
                fontSize: 'clamp(0.8rem, 1.6vw, 0.84rem !important)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ObserverHeader;
