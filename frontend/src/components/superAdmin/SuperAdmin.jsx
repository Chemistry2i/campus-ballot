import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SuperAdminSidebar from './Sidebar';
import Dashboard from './Dashboard';
import ManageAdmins from './ManageAdmins';
import GlobalSettings from './GlobalSettings';
import AuditLogs from './AuditLogs';
import ElectionOversight from './ElectionOversight';
import DataMaintenance from './DataMaintenance';
import Reporting from './Reporting';

const SuperAdmin = ({ user, onLogout }) => (
  <div
    style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      background: '#f8f9fc',
      overflow: 'hidden'
    }}
  >
    <SuperAdminSidebar />
    <main
      style={{
        marginLeft: 220,
        width: 'calc(100vw - 220px)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8f9fc'
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

export default SuperAdmin;
