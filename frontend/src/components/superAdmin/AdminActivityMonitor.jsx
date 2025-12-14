import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';

const AdminActivityMonitor = () => {
  const { isDarkMode, colors } = useTheme();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterAdmin, setFilterAdmin] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [adminList, setAdminList] = useState([]);

  useEffect(() => {
    fetchActivities();
    if (autoRefresh) {
      const interval = setInterval(fetchActivities, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    fetchAdminList();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/admin-activities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch activities', err);
      // Fallback dummy data
      setActivities([
        {
          id: 1,
          adminId: 'admin1',
          adminName: 'Jane Doe',
          action: 'Election Created',
          target: 'Presidential Election 2024',
          module: 'Elections',
          timestamp: new Date(),
          status: 'success',
          ipAddress: '192.168.1.100'
        },
        {
          id: 2,
          adminId: 'admin2',
          adminName: 'John Smith',
          action: 'Candidate Approved',
          target: 'John Candidate',
          module: 'Candidates',
          timestamp: new Date(Date.now() - 300000),
          status: 'success',
          ipAddress: '192.168.1.101'
        },
        {
          id: 3,
          adminId: 'admin3',
          adminName: 'Admin User',
          action: 'User Deactivated',
          target: 'student.email@kyu.ac.ug',
          module: 'Users',
          timestamp: new Date(Date.now() - 600000),
          status: 'success',
          ipAddress: '192.168.1.102'
        },
      ]);
      setLoading(false);
    }
  };

  const fetchAdminList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/admins-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminList(res.data);
    } catch (err) {
      console.error('Failed to fetch admin list', err);
    }
  };

  const getActionColor = (action) => {
    const actions = {
      'Election Created': 'success',
      'Election Updated': 'info',
      'Election Deleted': 'danger',
      'Candidate Approved': 'success',
      'Candidate Rejected': 'danger',
      'User Created': 'success',
      'User Deactivated': 'warning',
      'Settings Changed': 'info',
      'Report Generated': 'secondary',
      'Data Exported': 'info',
      'Backup Created': 'success',
      'Backup Restored': 'warning',
    };
    return actions[action] || 'secondary';
  };

  const getModuleIcon = (module) => {
    const icons = {
      'Elections': 'fa-check-to-slot',
      'Candidates': 'fa-users',
      'Users': 'fa-user-group',
      'Settings': 'fa-sliders',
      'Reports': 'fa-chart-bar',
      'Backups': 'fa-database',
      'System': 'fa-gears'
    };
    return icons[module] || 'fa-circle';
  };

  const timeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Filter activities
  let filteredActivities = activities;
  if (filterAdmin !== 'all') {
    filteredActivities = filteredActivities.filter(a => a.adminId === filterAdmin);
  }
  if (filterType !== 'all') {
    filteredActivities = filteredActivities.filter(a => a.action === filterType);
  }

  // Get unique actions for filter dropdown
  const uniqueActions = [...new Set(activities.map(a => a.action))];

  if (loading) return <div className="text-center py-5">Loading admin activities...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">
          <i className="fa-solid fa-video me-2"></i>
          Admin Activity Monitor
        </h3>
        <div className="d-flex gap-2">
          <label className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="form-check-label" style={{ fontSize: '0.9rem' }}>
              Live (10s)
            </span>
          </label>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={fetchActivities}
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Filter by Admin</label>
              <select
                className="form-select"
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
              >
                <option value="all">All Admins</option>
                {adminList.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter by Action</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">&nbsp;</label>
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFilterAdmin('all');
                  setFilterType('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted mb-2">Total Actions</h5>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                {filteredActivities.length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted mb-2">Success Rate</h5>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {filteredActivities.length > 0 
                  ? Math.round((filteredActivities.filter(a => a.status === 'success').length / filteredActivities.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted mb-2">Active Admins</h5>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
                {new Set(filteredActivities.map(a => a.adminId)).size}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted mb-2">Last 24 Hours</h5>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {filteredActivities.filter(a => {
                  const time = new Date() - new Date(a.timestamp);
                  return time < 86400000;
                }).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Activity Timeline</h5>
        </div>
        <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredActivities.length > 0 ? (
            <div className="timeline">
              {filteredActivities.map((activity, idx) => (
                <div key={activity.id} className="timeline-item d-flex gap-3 pb-4">
                  {/* Timeline marker */}
                  <div style={{ minWidth: '40px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: `#${getActionColor(activity.action) === 'success' ? '10b981' : getActionColor(activity.action) === 'danger' ? 'ef4444' : getActionColor(activity.action) === 'warning' ? 'f59e0b' : '2563eb'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem'
                      }}
                    >
                      <i className={`fa-solid ${getModuleIcon(activity.module)}`}></i>
                    </div>
                    {idx < filteredActivities.length - 1 && (
                      <div
                        style={{
                          height: '30px',
                          borderLeft: '2px solid #e5e7eb',
                          margin: '5px 0'
                        }}
                      />
                    )}
                  </div>

                  {/* Activity details */}
                  <div style={{ flex: 1, paddingTop: '5px' }}>
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <div>
                          <strong style={{ fontSize: '1rem' }}>{activity.action}</strong>
                          <span className={`badge bg-${getActionColor(activity.action)} ms-2`}>
                            {activity.module}
                          </span>
                        </div>
                        <small className="text-muted d-block mt-1">
                          by <strong>{activity.adminName}</strong>
                        </small>
                        <small className="text-muted d-block">
                          Target: <code>{activity.target}</code>
                        </small>
                        <small className="text-muted d-block">
                          <i className="fa-solid fa-location-dot me-1"></i>
                          {activity.ipAddress}
                        </small>
                      </div>
                      <div className="text-end">
                        <span
                          className={`badge bg-${activity.status === 'success' ? 'success' : 'danger'}`}
                          style={{ fontSize: '0.85rem' }}
                        >
                          {activity.status.toUpperCase()}
                        </span>
                        <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px' }}>
                          {timeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
              <p className="mt-2">No activities found</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .timeline-item {
          position: relative;
        }
        .timeline-item:hover {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding-left: 10px;
          padding-right: 10px;
          margin-left: -10px;
          margin-right: -10px;
        }
      `}</style>
    </div>
  );
};

export default AdminActivityMonitor;
