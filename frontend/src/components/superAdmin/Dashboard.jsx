import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import OverviewCards from '../admin/OverviewCards';
import SuperAdminCharts from './SuperAdminCharts';

// Dummy data for fallback
const dummyStats = {
  totalAdmins: 5,
  totalUsers: 120,
  totalElections: 8,
  activeElections: 2,
  pendingRequests: 3,
  systemHealth: 'OK',
  recentActions: [
    { adminName: 'Jane Doe', action: 'Created Election', date: '2024-05-10T10:00:00Z' },
    { adminName: 'John Smith', action: 'Approved Candidate', date: '2024-05-09T14:30:00Z' },
  ],
  // Add other keys as needed for OverviewCards
};

const SuperAdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/super-admin/reports/system-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data && Object.keys(res.data).length > 0 ? res.data : dummyStats);
      } catch (err) {
        setStats(dummyStats); // fallback to dummy data
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
      <div className="spinner-border text-primary" role="status" />
      <span className="ms-3">Loading dashboard...</span>
    </div>
  );

  return (
    <div
      className="container-fluid"
      style={{
        padding: '2rem',
        minHeight: '100vh',
        transition: 'margin-left 0.2s, width 0.2s',
        width: '100%',
      }}
    >
      {/* Banner */}
      <div
        className="mb-4 rounded shadow-sm"
        style={{
          background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 90,
          padding: '2.5rem 2rem',
          marginTop: '-2.5rem',
        }}
      >
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>
            <i className="fa-solid fa-crown me-2 text-warning"></i>
            Welcome, Super Admin!
          </h2>
          <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Manage your campus voting system with full control and oversight.
          </div>
        </div>
        <div>
          <img
            src="/superadmin-banner.svg"
            alt="Super Admin"
            style={{ height: 64, marginLeft: 24 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
      {/* Use the OverviewCards component for stats display */}
      <OverviewCards stats={stats} />
      <div className="mt-4">
        <Link to="/super-admin/manage-admins" className="btn btn-primary me-2">Manage Admins</Link>
        <Link to="/super-admin/global-settings" className="btn btn-secondary me-2">Global Settings</Link>
        <Link to="/super-admin/audit-logs" className="btn btn-outline-primary me-2">Audit Logs</Link>
        <Link to="/super-admin/election-oversight" className="btn btn-outline-success me-2">Election Oversight</Link>
        <Link to="/super-admin/data-maintenance" className="btn btn-outline-info me-2">Data Maintenance</Link>
        <Link to="/super-admin/reporting" className="btn btn-outline-dark me-2">Reporting</Link>
        <Link to="/super-admin/help" className="btn btn-outline-warning">Help</Link>
      </div>
      {/* Charts and Analytics */}
      <div style={{ width: '100%' }}>
        <SuperAdminCharts />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
