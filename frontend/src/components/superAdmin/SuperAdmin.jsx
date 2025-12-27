import React, { useState, useEffect } from 'react';
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

// Responsive sidebar state is managed here and passed to Sidebar
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const SuperAdmin = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
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
        user={user}
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
            gap: '1rem',
            boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(37,99,235,0.08)'
          }}
        >
          {/* Top Row */}
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div 
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.25)'
                }}
              >
                <i className="fa-solid fa-crown" style={{ fontSize: '1.5rem', color: '#fff' }}></i>
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

            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-primary" style={{ fontSize: '0.9rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '10px' }}>
                Welcome, {user?.name}
              </span>
            </div>
          </div>

          {/* Bottom Row - Search and Quick Actions */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {/* Search Bar */}
            <div className="flex-grow-1" style={{ maxWidth: '500px' }}>
              <div className="position-relative">
                <i 
                  className="fa-solid fa-search position-absolute" 
                  style={{ 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: colors.textMuted 
                  }}
                ></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users, elections, logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: '40px',
                    paddingRight: searchQuery ? '40px' : '12px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: colors.text,
                    height: '42px'
                  }}
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
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  borderRadius: '4px',
                  background: isDarkMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'}`,
                  color: '#10b981',
                  padding: '0.5rem 1rem'
                }}
              >
                <i className="fa-solid fa-plus"></i>
                <span className="d-none d-lg-inline">New Admin</span>
              </button>
              <button 
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  borderRadius: '4px',
                  background: isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'}`,
                  color: '#3b82f6',
                  padding: '0.5rem 1rem'
                }}
              >
                <i className="fa-solid fa-download"></i>
                <span className="d-none d-lg-inline">Export Data</span>
              </button>
              <button 
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  borderRadius: '4px',
                  background: isDarkMode ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)'}`,
                  color: '#a855f7',
                  padding: '0.5rem 1rem'
                }}
              >
                <i className="fa-solid fa-gear"></i>
                <span className="d-none d-lg-inline">Settings</span>
              </button>
            </div>

            {/* System Status Badge */}
            <div className="d-flex align-items-center gap-2 px-3 py-2 rounded"
              style={{
                background: isDarkMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'}`
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }}
              />
              <span className="small fw-bold" style={{ color: '#10b981' }}>System Healthy</span>
            </div>

            {/* Notifications */}
            <div className="position-relative">
              <button 
                className="btn btn-sm d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <i className="fa-solid fa-bell"></i>
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.65rem' }}
                >
                  3
                </span>
              </button>
              
              {showNotifications && (
                <div 
                  className="position-absolute shadow-lg rounded"
                  style={{
                    top: '50px',
                    right: 0,
                    width: '320px',
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <div className="p-3 border-bottom" style={{ borderColor: colors.border }}>
                    <h6 className="mb-0 fw-bold" style={{ color: colors.text }}>Notifications</h6>
                  </div>
                  <div className="p-2">
                    <div className="p-2 mb-1 rounded" style={{ background: isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)' }}>
                      <div className="d-flex align-items-start gap-2">
                        <i className="fa-solid fa-circle-info text-primary mt-1"></i>
                        <div className="flex-grow-1">
                          <p className="mb-0 small fw-bold" style={{ color: colors.text }}>System Update Available</p>
                          <p className="mb-0 small" style={{ color: colors.textMuted }}>New security patches ready</p>
                          <span className="small" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>2 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 mb-1 rounded" style={{ background: isDarkMode ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)' }}>
                      <div className="d-flex align-items-start gap-2">
                        <i className="fa-solid fa-exclamation-triangle text-warning mt-1"></i>
                        <div className="flex-grow-1">
                          <p className="mb-0 small fw-bold" style={{ color: colors.text }}>High CPU Usage</p>
                          <p className="mb-0 small" style={{ color: colors.textMuted }}>CPU usage at 78%</p>
                          <span className="small" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>5 minutes ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded" style={{ background: isDarkMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)' }}>
                      <div className="d-flex align-items-start gap-2">
                        <i className="fa-solid fa-check-circle text-success mt-1"></i>
                        <div className="flex-grow-1">
                          <p className="mb-0 small fw-bold" style={{ color: colors.text }}>Backup Completed</p>
                          <p className="mb-0 small" style={{ color: colors.textMuted }}>Daily backup successful</p>
                          <span className="small" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-top text-center" style={{ borderColor: colors.border }}>
                    <a href="#" className="small fw-bold" style={{ color: colors.primary, textDecoration: 'none' }}>
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout Button */}
            <button 
              className="btn btn-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
              style={{ borderRadius: '4px', padding: '0.5rem 1rem' }}
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
