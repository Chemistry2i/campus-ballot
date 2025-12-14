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
            background: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 64,
            boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(37,99,235,0.07)'
          }}
        >
          <div className="d-flex align-items-center">
            <span className="fw-bold" style={{ fontSize: '1.2rem', color: colors.primary }}>
              <i className="fa-solid fa-crown me-2 text-warning"></i>
              Super Admin Panel
            </span>
            <span className="badge bg-primary ms-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
              Welcome, {user?.name}
            </span>
          </div>
          <div className="d-flex align-items-center">
            <ThemeToggle />
            <span className="me-3 ms-3" style={{ color: colors.textSecondary }}>{user?.email}</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket me-1"></i> Logout
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
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="manage-admins" element={<ManageAdmins collapsed={collapsed} isMobile={isMobile} />} />
            <Route path="global-settings" element={<GlobalSettings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="election-oversight" element={<ElectionOversight />} />
            <Route path="data-maintenance" element={<DataMaintenance />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="system-health" element={<SystemHealth />} />
            <Route path="security-audit" element={<SecurityAudit />} />
            <Route path="backup-recovery" element={<BackupRecovery />} />
            <Route path="system-config" element={<SystemConfiguration />} />
            <Route path="admin-activity" element={<AdminActivityMonitor />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;
