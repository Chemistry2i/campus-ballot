import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
import getImageUrl from '../../utils/getImageUrl';
import Swal from 'sweetalert2';
import {
  faTachometerAlt,
  faUsers,
  faVoteYea,
  faUserTie,
  faChartBar,
  faSignOutAlt,
  faBell,
  faCog,
  faChartPie,
  faQuestionCircle,
  faBookOpen,
  faHistory,
  faPlusCircle,
  faUserCircle,
  faBullhorn,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from '../../contexts/ThemeContext';

function Sidebar({ user, navigate, onOpenCreateElection, onLogout, collapsed, setCollapsed, isMobile }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePicture || '/default-avatar.png');
  const profileImgSrc = getImageUrl(profilePic);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const { isDarkMode, colors } = useTheme();

  const SIDEBAR_WIDTH = 280;
  const SIDEBAR_COLLAPSED_WIDTH = 64;

  useEffect(() => {
    // Sync profile picture from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.profilePicture) {
          setProfilePic(parsed.profilePicture);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const [notifRes, logRes] = await Promise.all([
          axios.get('/api/notifications/count', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/logs/count', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setNotificationCount(notifRes.data.count || 0);
        setLogCount(logRes.data.count || 0);
      } catch (err) {
        console.error('Error fetching counts', err);
      }
    };
    fetchCounts();
  }, []);

  const onChooseFile = () => {
    setShowUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewUrl(null);
    }
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('profilePicture', selectedFile);
      const res = await axios.put(`/api/users/${user._id}/photo`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.profilePicture) {
        setProfilePic(res.data.profilePicture);
        // notify parent if provided
        if (typeof onProfileUpdated === 'function') {
          try { onProfileUpdated({ ...user, profilePicture: res.data.profilePicture }); } catch (e) {}
        }
        // update localStorage user if present
        try {
          const stored = localStorage.getItem('currentUser');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.profilePicture = res.data.profilePicture;
            localStorage.setItem('currentUser', JSON.stringify(parsed));
          }
        } catch (e) {}
      }
      setShowUploadModal(false);
      setSelectedFile(null);
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      // Replaced alert with SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Profile picture updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Upload error', err);
      // Replaced alert with SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.response?.data?.message || 'Failed to upload profile picture'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
  };

  const sidebarStyle = {
    width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    background: isDarkMode 
      ? 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'
      : '#fff',
    borderRight: `1px solid ${colors.border}`,
    zIndex: 1000,
    transition: 'width 0.2s ease-in-out, background-color 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: isDarkMode 
      ? '4px 0 15px rgba(0,0,0,0.3)'
      : '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  if (isMobile) {
    sidebarStyle.transform = collapsed ? 'translateX(-100%)' : 'translateX(0)';
    sidebarStyle.width = SIDEBAR_WIDTH;
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !collapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.08)',
            zIndex: 999,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside style={sidebarStyle}>
        {/* Header */}
        <div
          style={{
            padding: collapsed ? '1rem 0.5rem' : '1rem 1.5rem',
            borderBottom: `1px solid ${colors.border}`,
            background: colors.surface,
            textAlign: collapsed ? 'center' : 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', color: colors.primary }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: colors.primary }}>Admin Panel</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.textMuted,
                padding: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
            </button>
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: `1px solid ${colors.border}`,
              background: colors.surface,
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: isDarkMode ? '#475569' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: colors.text,
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onClick={onChooseFile}
                title="Change profile picture"
              >
                {uploading ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : profilePic && profilePic !== '/default-avatar.png' ? (
                  <img 
                    src={profileImgSrc} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{ 
                  display: profilePic && profilePic !== '/default-avatar.png' ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}>
                  {initials}
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text, marginBottom: '0.25rem' }}>
                Welcome, {user?.name}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#fff', 
                background: colors.success, 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px',
                fontWeight: '500'
              }}>
                {user?.role}
              </div>
            </div>
            
            {/* Quick Action Button */}
            <div className="mt-3">
              <button
                onClick={onOpenCreateElection}
                style={{
                  background: colors.primary,
                  border: 'none',
                  color: '#fff',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={e => e.target.style.background = colors.primaryHover}
                onMouseLeave={e => e.target.style.background = colors.primary}
              >
                <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: '0.5rem' }} />
                New Election
              </button>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faTachometerAlt} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/admin/users"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faUsers} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Users</span>}
          </NavLink>

          <NavLink
            to="/admin/elections"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faBullhorn} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Elections</span>}
          </NavLink>

          <NavLink
            to="/admin/candidates"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faUserTie} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Candidates</span>}
          </NavLink>

          <NavLink
            to="/admin/results"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faChartBar} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Results</span>}
          </NavLink>

          <NavLink
            to="/admin/logs"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faHistory} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Logs</span>}
            {logCount > 0 && !collapsed && (
              <span className="badge bg-danger ms-auto" style={{ fontSize: '0.625rem' }}>
                {logCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/notifications"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faBell} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Notifications</span>}
            {notificationCount > 0 && !collapsed && (
              <span className="badge bg-danger ms-auto" style={{ fontSize: '0.625rem' }}>
                {notificationCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/reports"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faChartPie} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Reports</span>}
          </NavLink>

          <NavLink
            to="/admin/settings"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faCog} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <NavLink
            to="/admin/help"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '0.75rem' : '0.75rem 1.5rem',
              color: isActive ? colors.primary : colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
              background: isActive ? colors.sidebarHover : 'transparent',
              transition: 'all 0.2s ease',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? colors.sidebarHover : 'transparent';
              e.currentTarget.style.color = isActive ? colors.primary : colors.textSecondary;
            }}
          >
            <FontAwesomeIcon 
              icon={faQuestionCircle} 
              style={{
                fontSize: collapsed ? '1.5rem' : '1rem',
                width: collapsed ? 'auto' : '1rem',
                marginRight: collapsed ? '0' : '0.75rem',
              }}
            />
            {!collapsed && <span>Help</span>}
          </NavLink>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.textMuted,
              fontSize: '0.75rem',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '0.25rem' }} />
              v1.0.0 © 2025 VoteSys
            </div>
            <button
              onClick={onLogout ? onLogout : () => navigate("/login")}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '0.25rem',
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '0.25rem' }} />
              Logout
            </button>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Upload Profile Picture</h5>
                  <button type="button" className="btn-close" onClick={() => setShowUploadModal(false)}></button>
                </div>
                <div className="modal-body text-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <div className="mb-3 text-muted">No file selected</div>
                  )}
                  <div className="mt-3">
                    <input className="form-control" type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      setSelectedFile(file);
                      try {
                        const url = URL.createObjectURL(file);
                        setPreviewUrl(url);
                      } catch (err) {
                        setPreviewUrl(null);
                      }
                    }} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" type="button" onClick={handleCancelUpload}>Cancel</button>
                  <button className="btn btn-primary" type="button" onClick={handleSaveUpload} disabled={uploading || !selectedFile}>
                    {uploading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
      </aside>

      {/* Mobile toggle button */}
      {isMobile && collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1001,
            background: '#2563eb',
            border: 'none',
            color: '#fff',
            padding: '0.75rem',
            borderRadius: '50%',
            width: 48,
            height: 48,
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          }}
        >
          <FontAwesomeIcon icon={faBullhorn} />
        </button>
      )}
    </>
  );
}

export default Sidebar;
