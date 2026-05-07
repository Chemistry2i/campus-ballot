import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import OverviewCards from '../admin/OverviewCards';
import SuperAdminCharts from './SuperAdminCharts';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDarkMode, colors } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Debug: Log user role and permissions
  useEffect(() => {
    console.log('[Dashboard] Super Admin User:', {
      role: user?.role,
      additionalRoles: user?.additionalRoles,
      canAccessAdminRoutes: user?.role === 'super_admin' || user?.role === 'admin'
    });
  }, [user]);

  const handleNavigate = (path, actionTitle) => {
    console.log(`[Dashboard] Navigating to ${path} from: ${actionTitle}`);
    navigate(path, { state: { from: '/super-admin/dashboard' } });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/super-admin/reports/system-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data || dummyStats);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setStats(dummyStats); // fallback to dummy data
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
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
        marginTop: "-40px"
      }}
    >
      {/* Banner */}
      <div 
        className="mb-4 mt-0 rounded-3 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)',
          padding: '2.5rem 2rem',
          // marginTop: "-10px"
        }}
      >
        <div className="position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <i className="fa-solid fa-crown text-warning" style={{ fontSize: '1.8rem' }}></i>
            </div>
            <div>
              <h2 className="mb-1 fw-bold">Welcome, Super Admin!</h2>
              <p className="mb-0 opacity-90">Manage your campus voting system with full control and oversight</p>
            </div>
          </div>
          <div className="d-flex gap-4 mt-3">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-shield-halved"></i>
              <span className="small">Full Access</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-users-gear"></i>
              <span className="small">Admin Management</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-chart-line"></i>
              <span className="small">System Analytics</span>
            </div>
          </div>
        </div>
      </div>
      {/* Use the OverviewCards component for stats display */}
      {/* <OverviewCards stats={stats} /> */}
      <OverviewCards stats={stats} />

      {/* Charts and Analytics */}
      <div style={{ width: '100%' }}>
        <SuperAdminCharts />
      </div>

      {/* Professional Quick Actions Grid */}
      <div className="mt-5">
        <h5 className="fw-bold mb-3" style={{ color: colors.text }}>Quick Actions</h5>
        <div className="row g-3">
          {[
            {
              title: 'Manage Students',
              icon: 'fa-users',
              description: 'View and manage all registered students',
              color: '#0d6efd',
              action: () => handleNavigate('/admin/users', 'Manage Students'),
              tone: '#e7f1ff'
            },
            {
              title: 'Manage Admins',
              icon: 'fa-user-tie',
              description: 'Add or remove administrator accounts',
              color: '#6f42c1',
              action: () => handleNavigate('/super-admin/manage-admins', 'Manage Admins'),
              tone: '#f3f0ff'
            },
            {
              title: 'Manage Candidates',
              icon: 'fa-user-check',
              description: 'Review and manage candidate nominations',
              color: '#198754',
              action: () => handleNavigate('/admin/candidates', 'Manage Candidates'),
              tone: '#f1f9f6'
            },
            {
              title: 'Manage Elections',
              icon: 'fa-poll',
              description: 'Create and oversee elections',
              color: '#fd7e14',
              action: () => handleNavigate('/admin/elections', 'Manage Elections'),
              tone: '#fff8f3'
            },
            {
              title: 'Global Settings',
              icon: 'fa-sliders',
              description: 'Configure system-wide settings',
              color: '#0dcaf0',
              action: () => handleNavigate('/super-admin/global-settings', 'Global Settings'),
              tone: '#f1f9fc'
            },
            {
              title: 'Audit Logs',
              icon: 'fa-file-lines',
              description: 'Review system activity logs',
              color: '#6c757d',
              action: () => handleNavigate('/super-admin/audit-logs', 'Audit Logs'),
              tone: '#f8f9fa'
            },
            {
              title: 'Election Oversight',
              icon: 'fa-clipboard-check',
              description: 'Oversee pending elections',
              color: '#198754',
              action: () => handleNavigate('/super-admin/election-oversight', 'Election Oversight'),
              tone: '#f1f9f6'
            },
            {
              title: 'System Health',
              icon: 'fa-heartbeat',
              description: 'Monitor system status',
              color: '#dc3545',
              action: () => handleNavigate('/super-admin/system-health', 'System Health'),
              tone: '#ffe7f0'
            },
            {
              title: 'Data Maintenance',
              icon: 'fa-database',
              description: 'Manage and backup system data',
              color: '#0dcaf0',
              action: () => handleNavigate('/super-admin/data-maintenance', 'Data Maintenance'),
              tone: '#f1f9fc'
            },
            {
              title: 'Reporting',
              icon: 'fa-chart-pie',
              description: 'Generate system reports',
              color: '#ffc107',
              action: () => handleNavigate('/super-admin/reporting', 'Reporting'),
              tone: '#fffbf0'
            },
            {
              title: 'Security Audit',
              icon: 'fa-shield-halved',
              description: 'Review security metrics',
              color: '#dc3545',
              action: () => handleNavigate('/super-admin/security-audit', 'Security Audit'),
              tone: '#ffe7f0'
            },
            {
              title: 'Help & Support',
              icon: 'fa-circle-question',
              description: 'Access documentation and support',
              color: '#17a2b8',
              action: () => handleNavigate('/super-admin/help', 'Help & Support'),
              tone: '#f0f8fb'
            }
          ].map((item, idx) => (
            <div key={idx} className="col-lg-3 col-md-4 col-sm-6">
              <button
                onClick={item.action}
                className="btn w-100 h-100 text-start"
                style={{
                  background: isDarkMode ? `${item.color}15` : item.tone,
                  border: `2px solid ${item.color}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '80px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px ${item.color}30`;
                  e.currentTarget.style.borderColor = item.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: item.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1" style={{ color: item.color }}>
                      {item.title}
                    </h6>
                    <small className="text-muted d-block">
                      {item.description}
                    </small>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default SuperAdminDashboard;
