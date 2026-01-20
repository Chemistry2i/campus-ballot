import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import SuperAdminSidebar from './Sidebar';
import Dashboard from './Dashboard';
import ManageAdmins from './ManageAdmins';
import ManageObservers from './ManageObservers';
import GlobalSettings from './GlobalSettings';
import AuditLogs from './AuditLogs';
import ElectionOversight from './ElectionOversight';
import DataMaintenance from './DataMaintenance';
import Reporting from './Reporting';
import SystemHealth from './SystemHealth';
import SecurityAudit from './SecurityAudit';
import BackupRecovery from './BackupRecovery';
import SystemConfiguration from './SystemConfiguration';
import AdminActivityMonitor from './AdminActivityMonitor';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../admin/ThemeToggle';
import '../../styles/darkmode.css';
import axios from 'axios';

// Responsive sidebar state is managed here and passed to Sidebar
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const SuperAdmin = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'System Update Available', message: 'New security patches ready', time: '2 hours ago', read: false },
    { id: 2, type: 'warning', title: 'High CPU Usage', message: 'CPU usage at 78%', time: '5 minutes ago', read: false },
    { id: 3, type: 'success', title: 'Backup Completed', message: 'Daily backup successful', time: '1 day ago', read: true },
  ]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || user?.avatarUrl || '/logo.png');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const fileInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + ? to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
      // Cmd/Ctrl + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showShortcuts]);

  const { isDarkMode, colors } = useTheme();

  // Page breadcrumb mapping
  const breadcrumbMap = {
    'system-health': { label: 'System Health', icon: 'fa-heartbeat' },
    'dashboard': { label: 'Dashboard', icon: 'fa-chart-line' },
    'manage-admins': { label: 'Manage Admins', icon: 'fa-users-gear' },
    'manage-observers': { label: 'Manage Observers', icon: 'fa-eye' },
    'global-settings': { label: 'Global Settings', icon: 'fa-sliders' },
    'audit-logs': { label: 'Audit Logs', icon: 'fa-file-lines' },
    'election-oversight': { label: 'Election Oversight', icon: 'fa-clipboard-check' },
    'data-maintenance': { label: 'Data Maintenance', icon: 'fa-database' },
    'reporting': { label: 'Reporting', icon: 'fa-chart-pie' },
    'security-audit': { label: 'Security Audit', icon: 'fa-shield-halved' },
    'backup-recovery': { label: 'Backup & Recovery', icon: 'fa-download' },
    'system-config': { label: 'System Configuration', icon: 'fa-gears' },
    'admin-activity': { label: 'Admin Activity', icon: 'fa-person-circle-check' },
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate main content margin dynamically
  const mainMarginLeft = isMobile
    ? 0
    : (collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH);

  // SweetAlert logout confirmation
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      onLogout();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: colors.background, overflow: 'hidden' }}>
      <SuperAdminSidebar
        user={{ ...user, profilePicture: avatarUrl }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
      />
      <main
        style={{
          marginLeft: mainMarginLeft,
          width: isMobile
            ? '100vw'
            : `calc(100vw - ${collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px)`,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: colors.background,
          transition: 'margin-left 0.2s, width 0.2s'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: `1px solid ${colors.border}`,
            padding: '1.2rem 2rem', // Increased from 1rem to 1.2rem
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            minHeight: '72px', // Increased from default (if any) to 72px
            boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(37,99,235,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}
        >
          {/* LEFT - Logo & Title */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0" style={{ minWidth: 0 }}>
            {/* Kyambogo University logo for branding, increased size, reduced gap */}
            <img src="/logo.jpg" alt="Kyambogo University Logo" style={{ width: '48px', height: '48px', objectFit: 'cover', marginRight: '6px' }} />
            <span className="fw-bold" style={{ fontSize: '1.15rem', color: colors.text }}>
              Super Admin
            </span>
          </div>
          {/* CENTER - Search & Greeting */}
          <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-center" style={{ minWidth: '280px', padding: '0 8px' }}>
            <input
              type="text"
              className="form-control search-input search-animate"
              placeholder="Search users, logs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '14px',
                borderRadius: '14px',
                border: `1.5px solid ${colors.border}`,
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                color: colors.text,
                height: '42px',
                fontSize: '1rem',
                width: '700px', // Reduced width
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              aria-label="Search input"
              onFocus={e => e.target.style.boxShadow = '0 4px 16px rgba(37,99,235,0.18)'}
              onBlur={e => e.target.style.boxShadow = '0 2px 8px rgba(37,99,235,0.08)'}
            />
            {/* Customizable greeting with waving hand or sun/moon icon */}
            <span className="ms-2 text-muted d-flex align-items-center" style={{ fontWeight: 600, fontSize: '1.05rem', gap: '0.4rem', whiteSpace: 'nowrap' }}>
              {isDarkMode ? (
                <i className="fa-solid fa-moon" style={{ color: '#2563eb', fontSize: '1.1rem' }}></i>
              ) : (
                <span role="img" aria-label="wave" style={{ fontSize: '1.1rem' }}>👋</span>
              )}
              Welcome, {user?.name?.split(' ')[0] || 'Super Admin'}!
            </span>
          </div>
          {/* RIGHT - Notifications, Theme, Avatar */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0" style={{ whiteSpace: 'nowrap', paddingRight: '8px' }}>
            {/* Notifications - compact, animated hover */}
            <button 
              className="btn btn-sm d-flex align-items-center justify-content-center position-relative notif-animate"
              style={{ background: 'transparent', border: 'none', color: colors.text, width: '32px', height: '32px', fontSize: '1.1rem', padding: 0, transition: 'transform 0.18s, box-shadow 0.18s', marginRight: '16px' }}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Show notifications"
              title="Notifications"
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <i className="fa-solid fa-bell"></i>
              {notifications.some(n => !n.read) && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '2px 4px' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {/* Theme Toggle - with tooltip and animated hover */}
            <div title="Switch to light/dark mode" style={{ transition: 'transform 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              <ThemeToggle showLabel={true} />
            </div>
            {/* User Profile - compact, with dropdown menu - moved to last, animated hover */}
            <div className="d-flex align-items-center gap-1 position-relative" style={{ paddingLeft: '0.5rem', transition: 'transform 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              <div
                style={{
                  width: '45px',
                  height: '45px',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.18s, transform 0.18s',
                }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Open user menu"
                title="User menu"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setShowProfileMenu(!showProfileMenu); }}
              >
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Super Admin Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SA'
                )}
              </div>
              {showProfileMenu && (
                <div
                  className="position-absolute shadow-lg rounded"
                  style={{
                    top: '66px',
                    right: 0,
                    minWidth: '180px',
                    zIndex: 100,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    border: `1px solid ${colors.border}`,
                    padding: '0.5rem 0',
                    background: isDarkMode ? colors.surface : '#fff',
                    color: colors.text,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  <button className="dropdown-item w-100 text-start px-3 py-2 d-flex align-items-center gap-2 profile-menu-item"
                    style={{ background: 'none', border: 'none', color: colors.text, fontSize: '0.95rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-user" style={{ color: isDarkMode ? '#60a5fa' : '#2563eb', fontSize: '1rem', transition: 'color 0.25s' }}></i>
                    Profile
                  </button>
                  <button className="dropdown-item w-100 text-start px-3 py-2 d-flex align-items-center gap-2 profile-menu-item"
                    style={{ background: 'none', border: 'none', color: colors.text, fontSize: '0.95rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-gear" style={{ color: isDarkMode ? '#fbbf24' : '#2563eb', fontSize: '1rem', transition: 'color 0.25s' }}></i>
                    Settings
                  </button>
                  <button className="dropdown-item w-100 text-start px-3 py-2 d-flex align-items-center gap-2 profile-menu-item"
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.95rem', cursor: 'pointer' }} onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket" style={{ color: '#dc2626', fontSize: '1rem', transition: 'color 0.25s' }}></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Modal */}
        {showShortcuts && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className="shadow-lg rounded"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                maxWidth: '500px',
                width: '90%',
                maxHeight: '70vh',
                overflowY: 'auto',
                animation: 'slideUp 0.3s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: colors.border }}>
                <h4 className="mb-0 fw-bold" style={{ color: colors.text }}>
                  <i className="fa-solid fa-keyboard me-2"></i>Keyboard Shortcuts
                </h4>
                <button
                  className="btn-close"
                  onClick={() => setShowShortcuts(false)}
                  style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
                  aria-label="Close"
                />
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase mb-3" style={{ color: colors.primary, fontSize: '0.75rem', letterSpacing: '0.05em' }}>Navigation</h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <span style={{ color: colors.text }}>Focus Search</span>
                      <kbd style={{ background: colors.border, color: colors.text, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Ctrl/Cmd + K</kbd>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span style={{ color: colors.text }}>Show Shortcuts</span>
                      <kbd style={{ background: colors.border, color: colors.text, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Ctrl/Cmd + Shift + ?</kbd>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase mb-3" style={{ color: colors.primary, fontSize: '0.75rem', letterSpacing: '0.05em' }}>System Control</h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <span style={{ color: colors.text }}>Dashboard</span>
                      <i className="fa-solid fa-chart-line" style={{ color: colors.textMuted, fontSize: '0.9rem' }}></i>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span style={{ color: colors.text }}>Manage Admins</span>
                      <i className="fa-solid fa-users-gear" style={{ color: colors.textMuted, fontSize: '0.9rem' }}></i>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span style={{ color: colors.text }}>Audit Logs</span>
                      <i className="fa-solid fa-file-lines" style={{ color: colors.textMuted, fontSize: '0.9rem' }}></i>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span style={{ color: colors.text }}>System Health</span>
                      <i className="fa-solid fa-heartbeat" style={{ color: colors.textMuted, fontSize: '0.9rem' }}></i>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info alert-dismissible" role="alert" style={{ background: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)', border: `1px solid ${colors.primary}`, color: colors.text }}>
                  <i className="fa-solid fa-lightbulb me-2"></i>
                  <small><strong>Tip:</strong> Press <kbd style={{ background: colors.border, padding: '0.1rem 0.3rem', borderRadius: '2px', fontSize: '0.75rem' }}>Ctrl + Shift + ?</kbd> anytime to show this panel.</small>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div
          className="container-fluid"
          style={{
            flex: 1,
            padding: '2rem',
            overflowY: 'auto',
            height: '100%',
            width: '100%',
            transition: 'width 0.2s',
          }}
        >
          <Routes>
            <Route path="system-health" element={<SystemHealth />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="manage-admins" element={<ManageAdmins collapsed={collapsed} isMobile={isMobile} />} />
            <Route path="manage-observers" element={<ManageObservers />} />
            <Route path="global-settings" element={<GlobalSettings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="election-oversight" element={<ElectionOversight />} />
            <Route path="data-maintenance" element={<DataMaintenance />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="security-audit" element={<SecurityAudit />} />
            <Route path="backup-recovery" element={<BackupRecovery />} />
            <Route path="system-config" element={<SystemConfiguration />} />
            <Route path="admin-activity" element={<AdminActivityMonitor />} />
            <Route path="*" element={<SystemHealth />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;

/* Add this CSS to the file or your global stylesheet:
.profile-menu-item {
  transition: background 0.22s, color 0.22s;
}
.profile-menu-item:hover {
  background: #f3f4f6;
  color: #2563eb;
}
[data-theme="dark"] .profile-menu-item:hover {
  background: #1e293b;
  color: #60a5fa;
}
*/
