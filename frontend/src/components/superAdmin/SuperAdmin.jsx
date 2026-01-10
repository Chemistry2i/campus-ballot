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
            padding: '1rem 2rem',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(37,99,235,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}
        >
          {/* LEFT - Logo & Title */}
           <div className="d-flex align-items-center justify-content-start flex-nowrap gap-3" style={{ width: 'auto', flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-3 flex-shrink-0" style={{ minWidth: 0 }}>
              <div 
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, #fffbe6 0%, #fbbf24 100%)'
                    : 'linear-gradient(135deg, #fffbe6 0%, #fbbf24 100%)',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.25)'
                }}
              >
                <i className="fa-solid fa-crown" style={{ fontSize: '28px', color: '#d97706' }}></i>
              </div>
              <div>
                <h1 className="mb-0 fw-bold" style={{ fontSize: '1.5rem', color: colors.text }}>
                  Super Admin
                </h1>
                <p className="mb-0 small" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>
                  System Control
                </p>
              </div>
            </div> 
          </div>

          {/* CENTER - Search & Status */}
          <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-center" style={{ minWidth: '380px' }}>
            {/* Search Bar */}
            <div className="flex-grow-1" style={{ maxWidth: '380px', minWidth: 0 }}>
              <div className="position-relative d-flex align-items-center gap-2">
                <i 
                  className="fa-solid fa-search position-absolute" 
                  style={{ 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: colors.textMuted 
                  }}
                  aria-label="Search icon"
                ></i>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search users, logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: '40px',
                    paddingRight: searchQuery ? '40px' : '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: colors.text,
                    height: '38px',
                    fontSize: '0.9rem'
                  }}
                  aria-label="Search input"
                />
                {searchQuery && (
                  <button
                    className="btn btn-sm position-absolute"
                    onClick={() => setSearchQuery('')}
                    style={{
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.25rem 0.5rem',
                      color: colors.textMuted
                    }}
                    aria-label="Clear search"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* System Status Badge */}
            <div
              className="d-flex align-items-center gap-2 px-2 py-1 rounded"
              style={{
                background: isDarkMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'}`,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'box-shadow 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              tabIndex={0}
              title="System Status: Healthy"
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }}
                aria-label="System healthy indicator"
              />
              <span className="small fw-bold" style={{ color: '#10b981', fontSize: '0.8rem' }}>Healthy</span>
            </div>

            {/* Notifications */}
            <div className="position-relative">
              <button 
                className="btn btn-sm d-flex align-items-center justify-content-center position-relative"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '6px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)',
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  padding: 0
                }}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Show notifications"
                title="Notifications"
              >
                <i className="fa-solid fa-bell"></i>
                {notifications.some(n => !n.read) && (
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: '0.6rem', padding: '2px 4px' }}
                  >
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div 
                  className="position-absolute shadow-lg rounded"
                  style={{
                    top: '50px',
                    right: 0,
                    width: '340px',
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: colors.border }}>
                    <h6 className="mb-0 fw-bold" style={{ color: colors.text, fontSize: '0.95rem' }}>Notifications</h6>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-link btn-sm p-0"
                        style={{ color: colors.primary, textDecoration: 'underline', fontSize: 12 }}
                        onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}
                        disabled={notifications.every(n => n.read)}
                        aria-label="Mark all as read"
                      >Mark all as read</button>
                      <button
                        className="btn btn-link btn-sm p-0"
                        style={{ color: colors.danger, textDecoration: 'underline', fontSize: 12 }}
                        onClick={() => setNotifications([])}
                        aria-label="Clear notifications"
                      >Clear all</button>
                    </div>
                  </div>
                  <div className="p-2">
                    {notifications.length === 0 ? (
                      <div className="text-center text-muted py-3">No notifications</div>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2 mb-1 rounded d-flex align-items-start gap-2`}
                        style={{
                          background: !n.read
                            ? (isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)')
                            : (isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'),
                          borderLeft: !n.read ? `3px solid ${colors.primary}` : 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => setNotifications(list => list.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        aria-label={n.title}
                      >
                        <i className={`fa-solid ${n.type === 'info' ? 'fa-circle-info text-primary' : n.type === 'warning' ? 'fa-exclamation-triangle text-warning' : 'fa-check-circle text-success'} mt-1`} style={{ fontSize: '0.9rem' }}></i>
                        <div className="flex-grow-1">
                          <p className="mb-0 small fw-bold" style={{ color: colors.text }}>{n.title}</p>
                          <p className="mb-0 small" style={{ color: colors.textMuted, fontSize: '0.85rem' }}>{n.message}</p>
                          <span className="small" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>{n.time}</span>
                        </div>
                        {!n.read && <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>New</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help & Shortcuts */}
            <button 
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '6px',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                padding: 0,
                cursor: 'pointer'
              }}
              onClick={() => setShowShortcuts(true)}
              aria-label="Keyboard shortcuts"
              title="Keyboard Shortcuts (Ctrl+Shift+?)"
            >
              <i className="fa-solid fa-keyboard"></i>
            </button>
          </div>

          {/* RIGHT - User Profile, Theme & Logout */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0" style={{ whiteSpace: 'nowrap' }}>
            {/* User Profile Brief */}
            <div className="d-flex align-items-center gap-2" style={{ paddingRight: '0.5rem', borderRight: `1px solid ${colors.border}` }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}>
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SA'}
              </div>
              <div className="d-none d-lg-block">
                <p className="mb-0 small fw-bold" style={{ color: colors.text, fontSize: '0.85rem' }}>{user?.name || 'Super Admin'}</p>
                <p className="mb-0 small" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>super_admin</p>
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle showLabel={true} />

            {/* Logout Button */}
            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
              onClick={handleLogout}
              style={{ borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              aria-label="Logout"
              title="Logout from system"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="d-none d-md-inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div
          style={{
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderBottom: `1px solid ${colors.border}`,
            padding: '0.75rem 2rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <i className="fa-solid fa-home" style={{ color: colors.primary, fontSize: '0.85rem' }}></i>
          <span style={{ color: colors.text }}>Dashboard</span>
          <i className="fa-solid fa-chevron-right" style={{ color: colors.textMuted, fontSize: '0.7rem', margin: '0 0.25rem' }}></i>
          <span style={{ color: colors.textMuted }}>System Management</span>
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
