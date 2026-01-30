import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { confirmLogout } from '../../utils/sweetAlerts';

const navItems = [
  { label: 'Dashboard', icon: 'fa-solid fa-gauge', to: '/observer/dashboard' },
  { label: 'All Elections', icon: 'fa-solid fa-ballot-check', to: '/observer/elections' },
  { label: 'Monitor', icon: 'fa-solid fa-binoculars', to: '/observer/monitor' },
  { label: 'Voters List', icon: 'fa-solid fa-users', to: '/observer/voters' },
  { label: 'Reports', icon: 'fa-solid fa-chart-line', to: '/observer/reports' },
  { label: 'Analytics', icon: 'fa-solid fa-chart-pie', to: '/observer/analytics' },
  { label: 'Activity Logs', icon: 'fa-solid fa-history', to: '/observer/logs' },
  { label: 'Incidents', icon: 'fa-solid fa-triangle-exclamation', to: '/observer/incidents' },
  { label: 'Notifications', icon: 'fa-solid fa-bell', to: '/observer/notifications' },
  { label: 'Settings', icon: 'fa-solid fa-gear', to: '/observer/settings' },
];

export default function ObserverSidebar({ user, collapsed, setCollapsed, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [assignedElections, setAssignedElections] = useState([]);
  const [profileImage, setProfileImage] = useState(user?.profilePicture || null);
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    if (user) {
      fetchAssignedElections();
      setProfileImage(user?.profilePicture || null);
    }
  }, [user]);

  const fetchAssignedElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignedElections(response.data.data || []);
    } catch (err) {
      console.error('Error fetching assigned elections:', err);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/observer/upload-profile-picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.profilePicture) {
        setProfileImage(response.data.profilePicture);
        // Update user in localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.profilePicture = response.data.profilePicture;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OB';

  const handleLogout = async () => {
    const result = await confirmLogout(isDarkMode);
    if (result.isConfirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <>
      {/* Overlay for mobile drawer */}
      {isMobile && !collapsed && (
        <div
          className="observer-sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.08)',
            zIndex: 99,
          }}
          onClick={() => setCollapsed(true)}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={`observer-sidebar shadow-sm${collapsed ? ' collapsed' : ''}`}
        style={{
          minWidth: collapsed ? 64 : 280,
          width: collapsed ? 64 : 280,
          height: '100vh',
          position: 'fixed',
          left: isMobile && collapsed ? -280 : 0,
          top: 0,
          zIndex: 100,
          transition: 'left 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s, width 0.3s',
          boxShadow: isDarkMode ? '0 0 12px rgba(0,0,0,0.3)' : '0 0 12px rgba(16, 185, 129, 0.07)',
          background: isDarkMode ? 'linear-gradient(180deg, #1e293b 0%, #334155 100%)' : '#fff',
          color: colors.text,
          borderRight: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        aria-label="Observer Sidebar"
      >
        {/* Header with Profile */}
        <div className="sidebar-header text-center" style={{ 
          padding: collapsed ? '1rem 0' : '1.5rem 1rem', 
          position: 'relative', 
          flexShrink: 0,
          borderBottom: `1px solid ${colors.border}`,
          background: isDarkMode 
            ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, transparent 100%)'
        }}>
          
          {/* Collapse Toggle Button */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                position: 'absolute',
                top: 'clamp(0.75rem, 2vw, 1rem)',
                right: collapsed ? '50%' : 'clamp(0.75rem, 2vw, 1rem)',
                transform: collapsed ? 'translateX(50%)' : 'none',
                width: 'clamp(1.75rem, 3vw, 2rem)',
                height: 'clamp(1.75rem, 3vw, 2rem)',
                borderRadius: '50%',
                border: `2px solid ${colors.border}`,
                background: colors.surface,
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontWeight: 'bold',
                boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#10b981';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = collapsed ? 'translateX(50%) scale(1.1)' : 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 0.25rem 0.75rem rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.surface;
                e.currentTarget.style.color = '#10b981';
                e.currentTarget.style.transform = collapsed ? 'translateX(50%) scale(1)' : 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0.125rem 0.5rem rgba(0,0,0,0.1)';
              }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
            </button>
          )}

          {/* Profile Avatar */}
          <div
            className="avatar text-white mx-auto"
            style={{
              width: collapsed ? 40 : 70,
              height: collapsed ? 40 : 70,
              borderRadius: '50%',
              fontSize: collapsed ? '1rem' : '1.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: collapsed ? 0 : '0.75rem',
              boxShadow: isDarkMode 
                ? '0 4px 16px rgba(16, 185, 129, 0.3), 0 0 0 3px rgba(16, 185, 129, 0.1)'
                : '0 4px 16px rgba(16, 185, 129, 0.25), 0 0 0 3px rgba(16, 185, 129, 0.08)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              backgroundImage: profileImage ? `url(${profileImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.3s ease',
              border: '3px solid rgba(255, 255, 255, 0.2)'
            }}
            onClick={() => {
              if (!collapsed) {
                setShowDropdown(!showDropdown);
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 6px 20px rgba(16, 185, 129, 0.4), 0 0 0 3px rgba(16, 185, 129, 0.15)'
                : '0 6px 20px rgba(16, 185, 129, 0.35), 0 0 0 3px rgba(16, 185, 129, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 4px 16px rgba(16, 185, 129, 0.3), 0 0 0 3px rgba(16, 185, 129, 0.1)'
                : '0 4px 16px rgba(16, 185, 129, 0.25), 0 0 0 3px rgba(16, 185, 129, 0.08)';
            }}
            tabIndex={0}
            aria-label="Profile photo"
          >
            {!profileImage && initials}
            
            {/* Online Status Indicator */}
            {!collapsed && (
              <div style={{
                position: 'absolute',
                bottom: 3,
                right: 3,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#10b981',
                border: `2.5px solid ${colors.surface}`,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.6)',
              }} />
            )}

            {/* Upload overlay (hidden) */}
            <input
              type="file"
              id="profileImageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              aria-label="Upload profile picture"
            />
            
            {/* Dropdown */}
            {!collapsed && showDropdown && (
              <div
                className="profile-dropdown"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 80,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: colors.surface,
                  color: colors.text,
                  borderRadius: 12,
                  boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)',
                  minWidth: 220,
                  zIndex: 200,
                  padding: '0.5rem 0',
                  border: `1px solid ${colors.border}`,
                  animation: 'slideDown 0.2s ease-out'
                }}
              >
                <button
                  onClick={() => document.getElementById('profileImageUpload').click()}
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'none',
                    border: 'none',
                    color: colors.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.surfaceHover;
                    e.currentTarget.style.paddingLeft = '1.5rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '1.25rem';
                  }}
                >
                  <i className="fa-solid fa-camera" style={{ width: 16 }}></i>
                  Change Photo
                </button>
                <Link
                  to="/observer/profile"
                  className="dropdown-item"
                  style={{
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    color: colors.text,
                    transition: 'all 0.2s',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.surfaceHover;
                    e.currentTarget.style.paddingLeft = '1.5rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '1.25rem';
                  }}
                >
                  <i className="fa-solid fa-user" style={{ width: 16 }}></i>
                  My Profile
                </Link>
                <Link
                  to="/observer/settings"
                  className="dropdown-item"
                  style={{
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    color: colors.text,
                    transition: 'all 0.2s',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.surfaceHover;
                    e.currentTarget.style.paddingLeft = '1.5rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '1.25rem';
                  }}
                >
                  <i className="fa-solid fa-gear" style={{ width: 16 }}></i>
                  Settings
                </Link>
                <div style={{ 
                  height: 1, 
                  background: colors.border, 
                  margin: '0.5rem 0' 
                }} />
                <button
                  onClick={handleLogout}
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.paddingLeft = '1.5rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '1.25rem';
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket" style={{ width: 16 }}></i>
                  Logout
                </button>
              </div>
            )}
          </div>
          {!collapsed && (
            <>
              <div style={{ 
                fontWeight: 700, 
                marginTop: '1rem',
                fontSize: '1rem',
                color: colors.text,
                letterSpacing: '0.3px'
              }}>
                Welcome, {user?.name?.split(' ')[0] || 'Observer'}!
              </div>
              <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginTop: '0.5rem' }}>
                <span className="badge" style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}>
                  <i className="fa-solid fa-shield-halved me-1"></i>
                  Observer Access
                </span>
              </div>
              {user?.observerInfo?.organization && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: colors.textMuted, 
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 500
                }}>
                  <i className="fa-solid fa-building" style={{ fontSize: '0.7rem' }}></i>
                  {user.observerInfo.organization}
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav" style={{ 
          flex: 1, 
          padding: '0.5rem 0.5rem', 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {/* Main Navigation */}
          {navItems.map(item => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                className="nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : '0.75rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '0.5rem' : '0.6rem 1rem',
                  margin: '0.15rem 0',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : colors.text,
                  background: isActive 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'transparent',
                  borderRadius: '6px',
                  borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                  transition: 'all 0.2s',
                  position: 'relative',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  boxShadow: isActive 
                    ? '0 2px 8px rgba(16, 185, 129, 0.25)'
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDarkMode 
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(16, 185, 129, 0.05)';
                    e.currentTarget.style.borderLeft = '3px solid rgba(16, 185, 129, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderLeft = '3px solid transparent';
                  }
                }}
              >
                <i className={item.icon} style={{ 
                  fontSize: collapsed ? '1.2rem' : '1rem',
                  color: isActive ? '#fff' : '#10b981',
                  minWidth: 20
                }}></i>
                {!collapsed && <span style={{ letterSpacing: '0.2px' }}>{item.label}</span>}
              </Link>
            );
          })}

          {/* Assigned Elections Section */}
          {!collapsed && assignedElections.length > 0 && (
            <>
              <div style={{ 
                padding: '1rem 1rem 0.5rem 1rem', 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <i className="fa-solid fa-vote-yea" style={{ fontSize: '0.8rem' }}></i>
                <span>Assigned Elections</span>
              </div>
              {assignedElections.map((election) => {
                const electionPath = `/observer/elections/${election._id}`;
                const isActive = location.pathname === electionPath;
                return (
                  <Link
                    key={election._id}
                    to={electionPath}
                    className="nav-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 1rem 0.6rem 1.5rem',
                      margin: '0.15rem 0',
                      textDecoration: 'none',
                      color: isActive ? '#fff' : colors.text,
                      background: isActive 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'transparent',
                      borderRadius: '6px',
                      borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                      transition: 'all 0.2s',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 500,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isActive 
                        ? '0 2px 8px rgba(16, 185, 129, 0.25)'
                        : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = isDarkMode 
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(16, 185, 129, 0.05)';
                        e.currentTarget.style.borderLeft = '3px solid rgba(16, 185, 129, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeft = '3px solid transparent';
                      }
                    }}
                  >
                    <i className="fa-solid fa-poll-h" style={{ 
                      fontSize: '0.9rem',
                      color: isActive ? '#fff' : '#10b981',
                      minWidth: 16
                    }}></i>
                    <span style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      letterSpacing: '0.2px',
                      flex: 1
                    }}>
                      {election.title}
                    </span>
                    {election.status === 'active' && (
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isActive ? '#fff' : '#10b981',
                        boxShadow: `0 0 6px ${isActive ? 'rgba(255, 255, 255, 0.6)' : 'rgba(16, 185, 129, 0.6)'}`,
                        flexShrink: 0,
                        animation: 'pulse 2s ease-in-out infinite'
                      }} title="Active Election" />
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer with Logout */}
        <div className="sidebar-footer" style={{ 
          padding: 0,
          borderTop: `1px solid ${colors.border}`, 
          flexShrink: 0,
          background: isDarkMode ? 'rgba(0,0,0,0.15)' : 'rgba(16, 185, 129, 0.02)'
        }}>
          {/* System Status - Minimal */}
          {!collapsed && (
            <div style={{ 
              padding: '0.75rem 1rem', 
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div className="d-flex align-items-center gap-2">
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: colors.textMuted,
                  fontWeight: 500 
                }}>
                  Online
                </span>
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                color: colors.textMuted,
                opacity: 0.7
              }}>
                v2.1.0
              </span>
            </div>
          )}

          {/* Logout Button */}
          <div style={{ padding: '0 1rem 1rem' }}>
            <button
              onClick={handleLogout}
              className="btn w-100"
              style={{
                background: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                padding: collapsed ? '0.6rem' : '0.75rem',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : '0.75rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '1rem' }}></i>
              {!collapsed && <span>Logout</span>}
            </button>
          </div>

          {/* Copyright */}
          {!collapsed && (
            <div style={{ 
              padding: '0.75rem 1.5rem', 
              textAlign: 'center',
              borderTop: `1px solid ${colors.border}`,
              background: isDarkMode ? 'rgba(0,0,0,0.15)' : 'rgba(16, 185, 129, 0.02)'
            }}>
              <p style={{ 
                fontSize: '0.7rem', 
                color: colors.textMuted, 
                margin: 0,
                fontWeight: 500
              }}>
                <i className="fa-solid fa-shield-halved me-1"></i>
                Campus Ballot System
              </p>
              <p style={{ 
                fontSize: '0.65rem', 
                color: colors.textMuted, 
                margin: '0.25rem 0 0',
                opacity: 0.7
              }}>
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
          )}
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* Custom Scrollbar for Sidebar */
          .sidebar-nav::-webkit-scrollbar {
            width: 6px;
          }

          .sidebar-nav::-webkit-scrollbar-track {
            background: transparent;
          }

          .sidebar-nav::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'};
            border-radius: 10px;
          }

          .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.3)'};
          }
        `}</style>
      </aside>
    </>
  );
}
