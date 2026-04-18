import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import RoleSwitcher from '../common/RoleSwitcher';
import axios from 'axios';
import { confirmLogout } from '../../utils/sweetAlerts';
import {
  FaBell,
  FaSearch,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaCircle,
  FaChevronRight,
  FaChevronLeft,
  FaHome,
  FaBars
} from 'react-icons/fa';


const AgentHeader = ({ user, onLogout, isMobile, sidebarOpen, setSidebarOpen, isDarkMode: parentIsDarkMode, colors: parentColors, sidebarCollapsed, setSidebarCollapsed }) => {
  const { isDarkMode: hookIsDarkMode, colors: hookColors } = useTheme();
  const isDarkMode = parentIsDarkMode !== undefined ? parentIsDarkMode : hookIsDarkMode;
  const colors = parentColors || hookColors;
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userNotifications = response.data.filter(
        notif => !notif.readBy?.includes(user?._id)
      );
      
      setNotifications(userNotifications.slice(0, 5));
      setUnreadCount(userNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Agent Management', path: '/agent' }];
    
    if (pathParts.length > 1) {
      if (pathParts[1] === 'tasks') breadcrumbs.push({ label: 'Tasks', path: '/agent/tasks' });
      if (pathParts[1] === 'outreach') breadcrumbs.push({ label: 'Outreach', path: '/agent/outreach' });
    }
    
    return breadcrumbs;
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout(isDarkMode);
    if (confirmed) {
      onLogout();
    }
  };

  return (
    <header
      style={{
        background: isDarkMode ? colors.surface : '#ffffff',
        borderBottom: `1px solid ${colors.border}`,
        padding: isMobile ? 'clamp(0.5rem, 2vw, 0.75rem)' : 'clamp(0.75rem, 2vw, 1.25rem)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 1200,
        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
        minWidth: 0
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'clamp(0.5rem, 2vw, 1.5rem)',
          flexWrap: (window.innerWidth <= 480) ? 'nowrap' : 'wrap',
          overflow: 'visible',
          position: 'relative',
          width: '100%',
          margin: 0
        }}
      >
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
              border: 'none',
              color: colors.text,
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              borderRadius: '4px',
              transition: 'all 0.2s',
              width: '40px',
              height: '40px',
              marginRight: '0.75rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.15)' : '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6'}
          >
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        )}
        
        {/* Left Section - Sidebar Toggle + Agent Text + Breadcrumbs (Desktop) */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem, 2vw, 1.5rem)', flex: 1, minWidth: '200px' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: colors.text,
                marginRight: '0.5rem',
                transition: 'all 0.2s'
              }}
              title="Toggle sidebar"
              onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.15)' : '#e5e7eb'}
              onMouseLeave={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6'}
            >
              {sidebarCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
            </button>
            {/* Removed duplicate 'Agent' text */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getBreadcrumbs().map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <FaChevronRight size={12} style={{ color: colors.textSecondary }} />}
                  <button
                    onClick={() => navigate(crumb.path)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: index === getBreadcrumbs().length - 1 ? colors.primary : colors.textSecondary,
                      fontSize: index === 0 ? 'clamp(1.35rem, 2.5vw, 1.7rem)' : 'clamp(0.8rem, 1.5vw, 0.9rem)',
                      fontWeight: index === getBreadcrumbs().length - 1 ? 600 : 400,
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      transition: 'background 0.2s',
                      letterSpacing: index === 0 ? '0.01em' : undefined
                    }}
                    onMouseEnter={(e) => e.target.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    {index === 0 && <FaHome style={{ marginRight: '0.25rem' }} />}
                    {crumb.label}
                  </button>
                </React.Fragment>
              ))}
            </nav>
            <div style={{ 
              marginLeft: 'auto', 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: colors.textSecondary,
              fontSize: 'clamp(0.75rem, 1.4vw, 0.85rem)'
            }}>
              <FaCircle size={8} style={{ color: '#10b981' }} />
              <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        )}

        {/* Right Section - Actions (Right Aligned) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: (window.innerWidth <= 480) ? '0.5rem' : 'clamp(0.5rem, 1.5vw, 1rem)', 
          marginLeft: 'auto',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10
        }}>
          
          {/* Role Switcher */}
          <RoleSwitcher user={user} isDarkMode={isDarkMode} colors={colors} />
          
          {/* Search */}
          {showSearch ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              minWidth: window.innerWidth <= 768 ? 'clamp(150px, 40vw, 250px)' : 'clamp(200px, 30vw, 300px)',
              maxWidth: window.innerWidth <= 480 ? '200px' : 'none'
            }}>
              <FaSearch size={14} style={{ color: colors.textSecondary, marginRight: '0.5rem' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: colors.text,
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                  width: '100%'
                }}
                autoFocus
              />
              <button
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <FaTimes size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: 'clamp(2.25rem, 5vw, 2.5rem)',
                height: 'clamp(2.25rem, 5vw, 2.5rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: colors.text,
                transition: 'all 0.2s',
                position: 'relative',
                zIndex: 20,
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.15)' : '#e5e7eb';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <FaSearch size={16} />
            </button>
          )}

          {/* Notifications */}
          <div style={{ position: 'relative', zIndex: 20 }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: 'clamp(2.25rem, 5vw, 2.5rem)',
                height: 'clamp(2.25rem, 5vw, 2.5rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: colors.text,
                position: 'relative',
                transition: 'all 0.2s',
                zIndex: 21,
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.15)' : '#e5e7eb';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <FaBell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                  onClick={() => setShowNotifications(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  width: 'clamp(300px, 40vw, 380px)',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  <div style={{ 
                    padding: 'clamp(0.75rem, 2vw, 1rem)', 
                    borderBottom: `1px solid ${colors.border}`,
                    fontWeight: 600,
                    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                    color: colors.text
                  }}>
                    Notifications ({unreadCount})
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ 
                      padding: 'clamp(1.5rem, 3vw, 2rem)', 
                      textAlign: 'center',
                      color: colors.textSecondary,
                      fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)'
                    }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => markAsRead(notif._id)}
                        style={{
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          borderBottom: `1px solid ${colors.border}`,
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ 
                          fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)',
                          fontWeight: 500,
                          color: colors.text,
                          marginBottom: '0.25rem'
                        }}>
                          {notif.title}
                        </div>
                        <div style={{ 
                          fontSize: 'clamp(0.75rem, 1.3vw, 0.8rem)',
                          color: colors.textSecondary
                        }}>
                          {formatNotificationTime(notif.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Profile Menu - User Image */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              style={{
                width: 'clamp(36px, 8vw, 44px)',
                height: 'clamp(36px, 8vw, 44px)',
                borderRadius: '50%',
                border: `2px solid rgba(255, 255, 255, 0.4)`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                backdropFilter: user?.profilePicture ? 'none' : 'blur(10px)',
                padding: 0,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              data-bs-toggle="dropdown"
              title={user?.name || 'Profile'}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user?.name} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                style={{ 
                  display: user?.profilePicture ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontWeight: 'bold',
                  color: '#fff'
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </button>

            {showProfile && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                  onClick={() => setShowProfile(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  width: 'clamp(220px, 30vw, 260px)',
                  zIndex: 1000
                }}>
                  <div style={{ 
                    padding: 'clamp(0.75rem, 2vw, 1rem)', 
                    borderBottom: `1px solid ${colors.border}`
                  }}>
                    <div style={{ 
                      fontWeight: 600,
                      fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                      color: colors.text,
                      marginBottom: '0.25rem'
                    }}>
                      {user?.name || 'Agent'}
                    </div>
                    <div style={{ 
                      fontSize: 'clamp(0.75rem, 1.3vw, 0.8rem)',
                      color: colors.textSecondary
                    }}>
                      Campaign Agent
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/agent/settings')}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: colors.text,
                      fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <FaCog /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'none',
                      border: 'none',
                      borderTop: `1px solid ${colors.border}`,
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'background 0.2s',
                      borderRadius: '0 0 clamp(8px, 1.5vw, 12px) clamp(8px, 1.5vw, 12px)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AgentHeader;
