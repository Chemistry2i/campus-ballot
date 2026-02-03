import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { FaUser } from 'react-icons/fa';
import axios from 'axios';
import { confirmLogout } from '../../utils/sweetAlerts';
import getImageUrl from '../../utils/getImageUrl';

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
  const fileRef = useRef(null);
  const [assignedElections, setAssignedElections] = useState([]);
  const [profileImage, setProfileImage] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    if (user) {
      fetchAssignedElections();
      setProfileImage(user?.profilePicture || null);
    }
  }, [user]);

  // Helper function to get the correct image URL (like admin sidebar)
  const getProfileImageSrc = () => {
    if (profileImage) {
      const imageUrl = getImageUrl(profileImage);
      if (imageUrl) return imageUrl;
    }
    if (user?.profilePicture) {
      const imageUrl = getImageUrl(user.profilePicture);
      if (imageUrl) return imageUrl;
    }
    return null; // Return null to show initials
  };

  const profileImgSrc = getProfileImageSrc();

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

  // File upload handlers like admin sidebar
  const onChooseFile = () => {
    fileRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowUploadModal(true);
    }
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) return;
    
    if (!user?._id) {
      alert('User data not loaded. Please refresh the page and try again.');
      setShowUploadModal(false);
      setSelectedFile(null);
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      return;
    }
    
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('profilePicture', selectedFile);
      const res = await axios.put(`/api/users/${user._id}/photo`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.profilePicture) {
        setProfileImage(res.data.profilePicture);
        // update localStorage user if present
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.profilePicture = res.data.profilePicture;
            localStorage.setItem('user', JSON.stringify(parsed));
          }
        } catch (e) {}
      }
      setShowUploadModal(false);
      setSelectedFile(null);
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OB';

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
          padding: collapsed ? '2rem 0' : '3rem 1rem 2rem', 
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
              backgroundImage: profileImgSrc ? `url(${profileImgSrc})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.3s ease',
              border: '3px solid rgba(255, 255, 255, 0.2)'
            }}
            onClick={onChooseFile}
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
            {!profileImgSrc && initials}

            {/* Upload overlay (hidden) */}
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              aria-label="Upload profile picture"
            />

            {/* Upload overlay (hidden) */}
            <input
              type="file"
              id="profileImageUpload"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              aria-label="Upload profile picture"
            />
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
                Welcome, {user?.name || 'Observer'}
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
              <div style={{ 
                fontSize: '0.75rem', 
                color: colors.textMuted, 
                marginTop: '0.75rem',
                fontWeight: 500
              }}>
                <i className="fa-solid fa-building me-1" style={{ fontSize: '0.7rem' }}></i>
                Org: {user?.observerInfo?.organization || user?.organization || 'Independent Observer'}
              </div>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav" style={{ 
          padding: '2rem 0.5rem', 
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
        
        {/* Spacer to push footer to bottom */}
        <div style={{ flex: 1 }}></div>

        {/* Footer */}
        <div className="sidebar-footer" style={{ 
          padding: '2.5rem 1rem',
          borderTop: `1px solid ${colors.border}`, 
          flexShrink: 0,
          background: isDarkMode ? 'rgba(0,0,0,0.15)' : 'rgba(16, 185, 129, 0.02)',
          textAlign: 'center',
          minHeight: '100px'
        }}>
          {!collapsed && (
            <div>
              <div style={{ 
                fontSize: '0.65rem', 
                color: colors.textMuted,
                opacity: 0.7,
                marginBottom: '0.5rem'
              }}>
                Campus Ballot Observer v2.1.0
              </div>
              <div style={{ 
                fontSize: '0.6rem', 
                color: colors.textMuted,
                opacity: 0.6
              }}>
                © 2026 All Rights Reserved
              </div>
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

      {/* Profile Picture Upload Modal */}
      {showUploadModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div 
              className="modal-content"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="modal-header"
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  backgroundColor: colors.headerBg
                }}
              >
                <h5 
                  className="modal-title"
                  style={{ color: colors.text }}
                >
                  Update Profile Picture
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelUpload}
                  style={{
                    filter: isDarkMode ? 'invert(1)' : 'none'
                  }}
                />
              </div>
              
              <div className="modal-body text-center py-4">
                {previewUrl && (
                  <div className="mb-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #10b981',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                      }}
                    />
                  </div>
                )}
                
                <p 
                  className="mb-0"
                  style={{ color: colors.text }}
                >
                  Do you want to update your profile picture?
                </p>
              </div>
              
              <div 
                className="modal-footer"
                style={{
                  borderTop: `1px solid ${colors.border}`,
                  backgroundColor: colors.headerBg
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelUpload}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
