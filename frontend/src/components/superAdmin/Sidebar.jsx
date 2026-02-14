import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';


const navItems = [
  { label: 'System Health', icon: 'fa-solid fa-heartbeat', to: '/super-admin/system-health' },
  { label: 'Dashboard', icon: 'fa-solid fa-gauge', to: '/super-admin/dashboard' },
  { label: 'Manage Admins', icon: 'fa-solid fa-user-shield', to: '/super-admin/manage-admins' },
  { label: 'Manage Observers', icon: 'fa-solid fa-eye', to: '/super-admin/manage-observers' },
  { label: 'Admin Activity', icon: 'fa-solid fa-video', to: '/super-admin/admin-activity' },
  { label: 'Security Audit', icon: 'fa-solid fa-lock', to: '/super-admin/security-audit' },
  { label: 'Backup & Recovery', icon: 'fa-solid fa-shield', to: '/super-admin/backup-recovery' },
  { label: 'System Config', icon: 'fa-solid fa-sliders', to: '/super-admin/system-config' },
  { label: 'Election Oversight', icon: 'fa-solid fa-check-to-slot', to: '/super-admin/election-oversight' },
  { label: 'Help', icon: 'fa-solid fa-circle-question', to: '/super-admin/help' },
];


export default function SuperAdminSidebar({ user, collapsed, setCollapsed, isMobile }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleAvatarClick = () => {
    if (!collapsed) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/super-admin/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      // Reset file input so the same file can be reselected
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Bust cache by appending a timestamp to the image URL
      if (user && user.profilePicture) {
        user.profilePicture = user.profilePicture.split('?')[0] + '?t=' + Date.now();
      }
      // Optionally update user state/context here
      window.location.reload();
    } catch (err) {
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const SIDEBAR_WIDTH = 240;
  const SIDEBAR_COLLAPSED_WIDTH = 64;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA';

  // Profile image logic (admin Slidebar style)
  const getProfileImageSrc = () => {
    if (user?.profilePicture) return user.profilePicture;
    if (user?.avatarUrl) return user.avatarUrl;
    return null;
  };
  const profileImgSrc = getProfileImageSrc();

  // Sidebar style (admin Slidebar style)
  const sidebarStyle = {
    width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
    minWidth: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
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
    overflow: 'hidden',
  };

  // Overlay for mobile
  if (isMobile && !collapsed) {
    return (
      <div
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
      >
        <aside style={sidebarStyle} aria-label="Super Admin Sidebar">
          {/* ...sidebar content below... */}
        </aside>
      </div>
    );
  }

  return (
    <aside style={sidebarStyle} aria-label="Super Admin Sidebar">
      {/* Header/Profile */}
      <div
        className="sidebar-header text-center"
        style={{
          padding: collapsed ? '0.25rem 0' : '1.2rem 0 0.7rem 0',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Super Admin Panel text */}
        {!collapsed && (
          <>
            <div
              style={{
                fontWeight: 700,
                fontSize: '1.15rem',
                color: '#2563eb',
                marginBottom: '0.5rem',
                letterSpacing: '0.5px',
                marginTop: '2rem', // Increased extra space above header
              }}
            >
              Super Admin Panel
            </div>
            <hr
              style={{
                border: 'none',
                borderTop: `1.5px solid ${colors.border}`,
                margin: '0.5rem 1.2rem 1.2rem 1.2rem',
                opacity: isDarkMode ? 0.8 : 0.8,
              }}
            />
            
          </>
        )}
        <div
          className="avatar bg-primary text-white mx-auto avatar-upload-wrapper"
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: collapsed ? 0 : 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: !collapsed ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: profileImgSrc ? `url(${profileImgSrc})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: uploading ? 0.5 : 1,
          }}
          tabIndex={0}
          aria-label="Profile photo"
          onClick={handleAvatarClick}
          title={!collapsed ? 'Change profile picture' : undefined}
        >
          {!profileImgSrc && initials}
          {uploading && (
            <span style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              fontSize: 18
            }}>
              <i className="fa fa-spinner fa-spin" />
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        {!collapsed && (
          <>
            <div
              className="text-muted mb-1"
              style={{ fontWeight: 500, fontSize: '0.95rem', marginTop: 8 }}
            >
              Welcome, {user?.name || 'Super Admin'}
            </div>
            <div className="mb-1">
              <span
                className="badge"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  background: colors.success,
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                admin
              </span>
            </div>
            {/* Add New Admin Button - styled and spaced like Add Election button in admin Slidebar */}
            <div style={{ marginTop: '0.75rem', width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
              <button
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
                  boxShadow: '0 1px 2px rgba(37,99,235,0.08)',
                }}
                onMouseEnter={e => e.target.style.background = colors.primaryHover}
                onMouseLeave={e => e.target.style.background = colors.primary}
                onClick={() => navigate('/super-admin/manage-admins?add=new')}
              >
                <i className="fa-solid fa-user-plus" style={{ marginRight: '0.5rem', fontSize: '1rem' }}></i>
                <span style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Add New Admin</span>
              </button>
            </div>
            {/* Divider between Add Admin and nav links */}
            <hr
              style={{
                border: 'none',
                borderTop: `1.5px solid ${colors.border}`,
                margin: '.75rem 1.2rem 0rem 1.2rem',
                opacity: isDarkMode ? 0.8 : 0.8,
              }}
            />
          </>
        )}
        {/* Collapse/Expand Button */}
        <button
          className="btn btn-sm btn-outline-secondary"
          style={{
            position: 'absolute',
            top: 12,
            right: collapsed ? 8 : 16,
            width: collapsed ? 32 : 40,
            zIndex: 101,
            transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
          }}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i
            className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}
            style={{
              transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          ></i>
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="nav flex-column px-2 sidebar-nav-scroll"
        role="navigation"
        aria-label="Sidebar navigation"
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          paddingBottom: '0rem',
          width: '100%',
        }}
      >
      
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <div key={item.to} style={{ position: 'relative', width: '100%', flexShrink: 0, marginBottom: '0.42rem !important' }}>
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 6,
                    height: 32,
                    borderRadius: 2,
                    background: '#2563eb',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.12)',
                  }}
                  aria-hidden="true"
                />
              )}
              <Link
                to={item.to}
                className={`sidebar-nav-link nav-link d-flex align-items-center custom-superadmin-navlink ${isActive ? 'active fw-bold' : ''}`}
                style={{
                  fontSize: '.88rem !important',
                  gap: '0.95rem',
                  padding: collapsed ? '0.48rem 0.48rem' : '0.95rem 1.7rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 4,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? (isDarkMode ? colors.sidebarHover : '#e7f1ff') : 'transparent',
                  boxShadow: isActive ? (isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(37,99,235,0.07)') : 'none',
                  minWidth: collapsed ? 0 : 220,
                  width: '100%',
                  outline: 'none',
                  color: colors.text,
                  borderLeft: isActive ? `3px solid ${colors.primary}` : 'none',
                  flexShrink: 0,
                  transition: 'background 0.18s, border-left 0.18s',
                }}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={0}
                onClick={() => isMobile && setCollapsed(true)}
                title={collapsed ? item.label : undefined}
              >
                <i
                  className={item.icon}
                  style={{ fontSize: collapsed ? '1.5rem' : '1rem', color: colors.primary }}
                ></i>
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', color: colors.text }}>{item.label}</span>
                )}
              </Link>
            </div>
          );
        })}

      </nav>
      {/* High-specificity CSS for nav link font size and spacing override */}
      <style>{`
        .custom-superadmin-navlink {
          font-size: .9rem !important;
          margin-bottom: 0.5rem !important;
        }
      `}</style>

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: `1px solid ${colors.border}`,
            background: colors.surface,
            color: colors.textMuted,
            fontSize: '0.7rem',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <i className="fa fa-book-open" style={{ marginRight: '0.25rem' }}></i>
            v1.0.0 © 2026 VoteSys
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('currentUser');
              window.location.href = '/login';
            }}
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
            <i className="fa fa-sign-out-alt" style={{ marginRight: '0.25rem' }}></i>
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
