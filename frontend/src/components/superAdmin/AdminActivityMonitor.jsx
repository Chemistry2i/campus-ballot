import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchActivities();
    if (autoRefresh) {
      const interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, filterAdmin, filterType, dateRange]);

  useEffect(() => {
    fetchAdminList();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/super-admin/admin-activities?limit=100';
      
      if (filterAdmin !== 'all') url += `&adminId=${filterAdmin}`;
      if (filterType !== 'all') url += `&action=${filterType}`;
      if (dateRange.start) url += `&startDate=${dateRange.start}`;
      if (dateRange.end) url += `&endDate=${dateRange.end}`;
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch activities', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Activities',
        text: err.response?.data?.message || 'Could not fetch admin activities',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      setActivities([]);
      setLoading(false);
    }
  };

  const fetchAdminList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/admins-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch admin list', err);
      setAdminList([]);
    }
  };

  const getActionColor = (action) => {
    if (!action) return 'secondary';
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('created') || lowerAction.includes('login') || lowerAction.includes('approved')) return 'success';
    if (lowerAction.includes('deleted') || lowerAction.includes('rejected')) return 'danger';
    if (lowerAction.includes('updated') || lowerAction.includes('changed') || lowerAction.includes('exported')) return 'info';
    if (lowerAction.includes('deactivated') || lowerAction.includes('backup') || lowerAction.includes('restored')) return 'warning';
    return 'secondary';
  };

  const getModuleIcon = (module) => {
    if (!module) return 'fa-circle';
    const icons = {
      'Election': 'fa-check-to-slot',
      'Candidate': 'fa-user-tie',
      'User': 'fa-user-group',
      'System': 'fa-gears',
      'Vote': 'fa-vote-yea',
      'Notification': 'fa-bell',
      'Log': 'fa-clipboard-list'
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
  
  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredActivities = filteredActivities.filter(a => 
      a.adminName?.toLowerCase().includes(query) ||
      a.action?.toLowerCase().includes(query) ||
      a.target?.toLowerCase().includes(query) ||
      a.module?.toLowerCase().includes(query) ||
      a.ipAddress?.toLowerCase().includes(query)
    );
  }

  // Get unique actions and modules for filter dropdowns
  const uniqueActions = [...new Set(activities.map(a => a.action).filter(Boolean))];
  const uniqueModules = [...new Set(activities.map(a => a.module).filter(Boolean))];

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Admin Name', 'Action', 'Module', 'Target', 'Status', 'IP Address'];
    const rows = filteredActivities.map(a => [
      new Date(a.timestamp).toLocaleString(),
      a.adminName,
      a.action,
      a.module,
      a.target,
      a.status,
      a.ipAddress
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_activities_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Activity log has been exported to CSV',
      toast: true,
      position: 'top-end',
      timer: 2000,
      showConfirmButton: false
    });
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading admin activities...</p>
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      {/* Welcome Banner */}
      <div 
        className="mb-4 rounded-3 position-relative overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' 
            : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)',
          padding: '2.5rem 2rem'
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
              <i className="fa-solid fa-video" style={{ fontSize: '1.8rem' }}></i>
            </div>
            <div>
              <h2 className="mb-1 fw-bold">Activity Monitor</h2>
              <p className="mb-0 opacity-90">Real-time tracking of all user actions and administrative activities</p>
            </div>
          </div>
          <div className="d-flex gap-4 mt-3">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-clock"></i>
              <span className="small">Live Monitoring</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-shield-halved"></i>
              <span className="small">Audit Trail</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-file-export"></i>
              <span className="small">Export Reports</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div 
          className="position-absolute"
          style={{
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(40px)'
          }}
        />
        <div 
          className="position-absolute"
          style={{
            bottom: '-20px',
            right: '100px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            filter: 'blur(30px)'
          }}
        />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold" style={{ color: colors.text }}>Activity Log</h5>
        <div className="d-flex gap-2 align-items-center">
          <label className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="form-check-label" style={{ fontSize: '0.9rem', color: colors.text }}>
              Live (30s)
            </span>
          </label>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={fetchActivities}
            title="Refresh now"
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
          <button 
            className="btn btn-sm btn-success"
            onClick={exportToCSV}
            disabled={filteredActivities.length === 0}
          >
            <i className="fa-solid fa-file-export me-1"></i>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label" style={{ color: colors.text }}>Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search admin, action, target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: isDarkMode ? colors.inputBg : '#fff',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ color: colors.text }}>Filter by Admin</label>
              <select
                className="form-select"
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
                style={{
                  background: isDarkMode ? colors.inputBg : '#fff',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <option value="all">All Admins</option>
                {adminList.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ color: colors.text }}>Filter by Action</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  background: isDarkMode ? colors.inputBg : '#fff',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ color: colors.text }}>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                style={{
                  background: isDarkMode ? colors.inputBg : '#fff',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ color: colors.text }}>End Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                style={{
                  background: isDarkMode ? colors.inputBg : '#fff',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              />
            </div>
          </div>
          <div className="mt-3">
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setFilterAdmin('all');
                setFilterType('all');
                setSearchQuery('');
                setDateRange({ start: '', end: '' });
              }}
            >
              <i className="fa-solid fa-filter-circle-xmark me-1"></i>
              Reset All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <div className="card-body">
              <h6 className="card-title mb-2" style={{ color: colors.textMuted }}>Total Actions</h6>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                {filteredActivities.length}
              </div>
              <small style={{ color: colors.textMuted }}>Logged activities</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <div className="card-body">
              <h6 className="card-title mb-2" style={{ color: colors.textMuted }}>Success Rate</h6>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {filteredActivities.length > 0 
                  ? Math.round((filteredActivities.filter(a => a.status === 'success').length / filteredActivities.length) * 100)
                  : 0}%
              </div>
              <small style={{ color: colors.textMuted }}>Successful actions</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <div className="card-body">
              <h6 className="card-title mb-2" style={{ color: colors.textMuted }}>Active Admins</h6>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
                {new Set(filteredActivities.map(a => a.adminId)).size}
              </div>
              <small style={{ color: colors.textMuted }}>Unique admins</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <div className="card-body">
              <h6 className="card-title mb-2" style={{ color: colors.textMuted }}>Last 24 Hours</h6>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {filteredActivities.filter(a => {
                  const time = new Date() - new Date(a.timestamp);
                  return time < 86400000;
                }).length}
              </div>
              <small style={{ color: colors.textMuted }}>Recent actions</small>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <div className="card-header" style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <h5 className="mb-0" style={{ color: colors.text }}>
            <i className="fa-solid fa-timeline me-2"></i>
            Activity Timeline
          </h5>
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
                          borderLeft: `2px solid ${colors.border}`,
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
                          <strong style={{ fontSize: '1rem', color: colors.text }}>{activity.action || 'Unknown Action'}</strong>
                          <span className={`badge bg-${getActionColor(activity.action)} ms-2`}>
                            {activity.module || 'System'}
                          </span>
                        </div>
                        <small className="d-block mt-1" style={{ color: colors.textMuted }}>
                          by <strong>{activity.adminName || 'Unknown User'}</strong>
                          <span className={`badge ms-2 ${
                            activity.adminRole === 'super_admin' ? 'bg-danger' : 
                            activity.adminRole === 'admin' ? 'bg-warning' : 
                            'bg-info'
                          }`} style={{ fontSize: '0.7rem' }}>
                            {activity.adminRole?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          {activity.adminEmail && <span> ({activity.adminEmail})</span>}
                        </small>
                        <small className="d-block" style={{ color: colors.textMuted }}>
                          Target: <code style={{ background: isDarkMode ? colors.inputBg : '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                            {activity.target || 'N/A'}
                          </code>
                        </small>
                        <small className="d-block" style={{ color: colors.textMuted }}>
                          <i className="fa-solid fa-location-dot me-1"></i>
                          {activity.ipAddress || 'Unknown IP'}
                        </small>
                        {activity.errorMessage && (
                          <small className="d-block text-danger mt-1">
                            <i className="fa-solid fa-exclamation-triangle me-1"></i>
                            {activity.errorMessage}
                          </small>
                        )}
                      </div>
                      <div className="text-end">
                        <span
                          className={`badge bg-${activity.status === 'success' ? 'success' : 'danger'}`}
                          style={{ fontSize: '0.85rem' }}
                        >
                          {(activity.status || 'unknown').toUpperCase()}
                        </span>
                        <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginTop: '8px' }}>
                          {timeAgo(activity.timestamp)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5" style={{ color: colors.textMuted }}>
              <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
              <p className="mt-2">No activities found</p>
              <small>Try adjusting your filters or refresh the page</small>
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
