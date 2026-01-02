import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import SuperAdminSidebar from './Sidebar';
import Dashboard from './Dashboard';
import ManageAdmins from './ManageAdmins';
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

  const { isDarkMode, colors } = useTheme();

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
            flexDirection: 'column',
            gap: '0.5rem', // reduce gap
            boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(37,99,235,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1100
          }}
        >
          {/* Top Row */}
          <div className="d-flex align-items-center justify-content-between flex-nowrap gap-3" style={{ width: '100%' }}>
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
                <img 
                  src="/logo.png" 
                  alt="Concept Crashers Logo" 
                  style={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'contain', background: 'transparent' }}
                />
              </div>
              <div>
                <h1 className="mb-0 fw-bold" style={{ fontSize: '1.5rem', color: colors.text }}>
                  Super Admin Panel
                </h1>
                <p className="mb-0 small" style={{ color: colors.textMuted }}>
                  Complete system control and monitoring
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 position-relative flex-shrink-0" style={{ minWidth: 0 }}>
              {/* User Profile Avatar & Dropdown */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.primary}`, cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                  tabIndex={0}
                  aria-label="Upload profile picture"
                  title="Upload profile picture"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('profilePicture', file);
                    try {
                      const token = localStorage.getItem('token');
                      const res = await axios.put(`/api/users/${user._id}/photo`, formData, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'multipart/form-data',
                        },
                      });
                      if (res.data?.profilePicture) {
                        setAvatarUrl(res.data.profilePicture);
                      }
                    } catch (err) {
                      alert('Failed to upload image.');
                    }
                  }}
                />
                <span className="fw-bold d-none d-md-inline ms-2" style={{ color: colors.text, whiteSpace: 'nowrap' }}>{user?.name || 'Super Admin'}</span>
                <i
                  className={`fa-solid fa-chevron-down text-muted small d-none d-md-inline`}
                  style={{
                    transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                    transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                ></i>
                {showProfileMenu && (
                  <div
                    className="shadow rounded position-absolute"
                    style={{
                      top: '110%',
                      right: 0,
                      minWidth: 180,
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      zIndex: 2000,
                    }}
                  >
                    <div className="p-2 border-bottom" style={{ borderColor: colors.border }}>
                      <span className="fw-bold" style={{ color: colors.primary }}>{user?.name || 'Super Admin'}</span>
                      <div className="small text-muted">{user?.email || 'superadmin@example.com'}</div>
                    </div>
                    <button className="dropdown-item w-100 text-start" style={{ padding: '0.75rem 1rem', color: colors.text, background: 'none', border: 'none' }}>
                      <i className="fa-solid fa-user me-2"></i>Profile
                    </button>
                    <button className="dropdown-item w-100 text-start" style={{ padding: '0.75rem 1rem', color: colors.text, background: 'none', border: 'none' }}>
                      <i className="fa-solid fa-gear me-2"></i>Settings
                    </button>
                    <button className="dropdown-item w-100 text-start" style={{ padding: '0.75rem 1rem', color: colors.danger, background: 'none', border: 'none' }} onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket me-2"></i>Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row - Search and Quick Actions */}
          <div className="d-flex align-items-center gap-3 flex-wrap w-100" style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            {/* Search Bar */}
            {/* Enhanced Search Bar with Filter */}
            <div className="flex-grow-1" style={{ maxWidth: '340px', minWidth: isMobile ? '100%' : 0 }}>
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
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: '40px',
                    paddingRight: searchQuery ? '40px' : '12px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: colors.text,
                    height: '42px',
                    minWidth: isMobile ? '100%' : 0
                  }}
                  aria-label="Search input"
                />
                <select
                  className="form-select"
                  style={{ maxWidth: 120, minWidth: 90, fontSize: 14, borderRadius: 8, border: `1px solid ${colors.border}` }}
                  aria-label="Search filter"
                >
                  <option>All</option>
                  <option>Users</option>
                  <option>Elections</option>
                  <option>Logs</option>
                </select>
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

            {/* Quick Actions (Dynamic) */}
            <div className="d-flex align-items-center gap-2">
              {[
                {
                  key: 'new-admin',
                  icon: 'fa-plus',
                  label: 'New Admin',
                  color: '#10b981',
                  bg: isDarkMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)',
                  border: isDarkMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
                  onClick: () => {},
                },
                {
                  key: 'export-data',
                  icon: 'fa-download',
                  label: 'Export Data',
                  color: '#3b82f6',
                  bg: isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                  border: isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)',
                  onClick: () => {},
                },
                {
                  key: 'settings',
                  icon: 'fa-gear',
                  label: 'Settings',
                  color: '#a855f7',
                  bg: isDarkMode ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.05)',
                  border: isDarkMode ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)',
                  onClick: () => {},
                },
              ].map(action => (
                <button
                  key={action.key}
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{
                    borderRadius: '4px',
                    background: action.bg,
                    border: `1px solid ${action.border}`,
                    color: action.color,
                    padding: '0.5rem 1rem'
                  }}
                  onClick={action.onClick}
                >
                  <i className={`fa-solid ${action.icon}`}></i>
                  <span className="d-none d-lg-inline">{action.label}</span>
                </button>
              ))}
            </div>

            {/* System Status Badge (Clickable) */}
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded"
              style={{
                background: isDarkMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'}`,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'box-shadow 0.2s',
              }}
              tabIndex={0}
              aria-label="Show system health details"
              title="Click for system health details"
              onClick={() => alert('System is healthy. All services operational.')} // Replace with modal in real app
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }}
                aria-label="System healthy indicator"
              />
              <span className="small fw-bold" style={{ color: '#10b981' }}>System Healthy</span>
            </div>

            {/* Notifications */}
            <div className="position-relative">
              <button 
                className="btn btn-sm d-flex align-items-center justify-content-center position-relative"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Show notifications"
              >
                <i className="fa-solid fa-bell"></i>
                {notifications.some(n => !n.read) && (
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: '0.65rem' }}
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
                    <h6 className="mb-0 fw-bold" style={{ color: colors.text }}>Notifications</h6>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-link btn-sm p-0"
                        style={{ color: colors.primary, textDecoration: 'underline', fontSize: 13 }}
                        onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}
                        disabled={notifications.every(n => n.read)}
                        aria-label="Mark all as read"
                      >Mark all as read</button>
                      <button
                        className="btn btn-link btn-sm p-0"
                        style={{ color: colors.danger, textDecoration: 'underline', fontSize: 13 }}
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
                        className={`p-2 mb-1 rounded d-flex align-items-start gap-2 ${!n.read ? 'bg-light' : ''}`}
                        style={{
                          background: !n.read
                            ? (isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)')
                            : (isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'),
                          borderLeft: !n.read ? `4px solid ${colors.primary}` : 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => setNotifications(list => list.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        aria-label={n.title}
                      >
                        <i className={`fa-solid ${n.type === 'info' ? 'fa-circle-info text-primary' : n.type === 'warning' ? 'fa-exclamation-triangle text-warning' : 'fa-check-circle text-success'} mt-1`}></i>
                        <div className="flex-grow-1">
                          <p className="mb-0 small fw-bold" style={{ color: colors.text }}>{n.title}</p>
                          <p className="mb-0 small" style={{ color: colors.textMuted }}>{n.message}</p>
                          <span className="small" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>{n.time}</span>
                        </div>
                        {!n.read && <span className="badge bg-primary ms-2">New</span>}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-top text-center" style={{ borderColor: colors.border }}>
                    <a href="#" className="small fw-bold" style={{ color: colors.primary, textDecoration: 'none' }}>
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Changelog/Announcements Icon */}
            <button
              className="btn btn-link p-0 ms-2"
              style={{ color: colors.primary, fontSize: 22 }}
              aria-label="View changelog"
              title="View recent updates"
              onClick={() => alert('Show changelog modal here.')}
            >
              <i className="fa-solid fa-bullhorn"></i>
            </button>

            {/* Theme Toggle (Far Right) */}
            <div className="ms-auto">
              <ThemeToggle />
            </div>

            {/* Logout Button (Outline, same row) */}
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
              style={{ borderRadius: '4px', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
              aria-label="Logout"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="d-none d-md-inline">Logout</span>
            </button>
          </div>
        </div>
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
