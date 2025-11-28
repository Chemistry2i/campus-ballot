import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import SuperAdminSidebar from './Sidebar';
import Dashboard from './Dashboard';
import ManageAdmins from './ManageAdmins';
import GlobalSettings from './GlobalSettings';
import AuditLogs from './AuditLogs';
import ElectionOversight from './ElectionOversight';
import DataMaintenance from './DataMaintenance';
import Reporting from './Reporting';

// Responsive sidebar state is managed here and passed to Sidebar
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const SuperAdmin = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: '#f8f9fc', overflow: 'hidden' }}>
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
          background: '#f8f9fc',
          transition: 'margin-left 0.2s, width 0.2s'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #eee',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 64
          }}
        >
          <div>
            <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#2563eb' }}>Super Admin Panel</span>
          </div>
          <div>
            <span className="me-3 text-muted">{user?.name} ({user?.email})</span>
            <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
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
            height: '100%'
          }}
        >
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="manage-admins" element={<ManageAdmins />} />
            <Route path="global-settings" element={<GlobalSettings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="election-oversight" element={<ElectionOversight />} />
            <Route path="data-maintenance" element={<DataMaintenance />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;
