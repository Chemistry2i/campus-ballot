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

const SuperAdmin = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <SuperAdminSidebar />
    <main style={{ marginLeft: 220, width: '100%' }}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage-admins" element={<ManageAdmins />} />
        <Route path="global-settings" element={<GlobalSettings />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="election-oversight" element={<ElectionOversight />} />
        <Route path="data-maintenance" element={<DataMaintenance />} />
        <Route path="reporting" element={<Reporting />} />
        {/* Optionally, add a default route */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </main>
  </div>
);

export default SuperAdmin;
