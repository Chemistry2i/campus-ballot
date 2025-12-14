import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';

const SecurityAudit = () => {
  const { isDarkMode, colors } = useTheme();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchUser, setSearchUser] = useState('');
  const [dateRange, setDateRange] = useState('7days');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filterType, searchUser, dateRange]);

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/security-audit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
      // Fallback dummy data
      setLogs([
        {
          id: 1,
          admin: 'Jane Doe',
          action: 'Created Election',
          target: 'Presidential Election 2024',
          type: 'CREATE',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ipAddress: '192.168.1.100',
          status: 'success'
        },
        {
          id: 2,
          admin: 'John Smith',
          action: 'Modified Election Settings',
          target: 'Guild Election 2024',
          type: 'UPDATE',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ipAddress: '192.168.1.101',
          status: 'success'
        },
        {
          id: 3,
          admin: 'Admin User',
          action: 'Failed Login Attempt',
          target: 'Invalid Credentials',
          type: 'LOGIN_FAILED',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          ipAddress: '192.168.1.150',
          status: 'failed'
        },
      ]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.type === filterType);
    }

    // Filter by user
    if (searchUser) {
      filtered = filtered.filter(log => 
        log.admin.toLowerCase().includes(searchUser.toLowerCase())
      );
    }

    // Filter by date range
    const now = new Date();
    const dateMs = {
      '7days': 7 * 24 * 60 * 60 * 1000,
      '30days': 30 * 24 * 60 * 60 * 1000,
      '90days': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }[dateRange];

    filtered = filtered.filter(log => {
      const logDate = new Date(log.timestamp);
      return (now - logDate) <= dateMs;
    });

    setFilteredLogs(filtered);
    setPage(1);
  };

  const getActionBadge = (type) => {
    const badges = {
      'CREATE': { bg: 'success', text: 'Create' },
      'UPDATE': { bg: 'info', text: 'Update' },
      'DELETE': { bg: 'danger', text: 'Delete' },
      'LOGIN': { bg: 'primary', text: 'Login' },
      'LOGIN_FAILED': { bg: 'warning', text: 'Failed Login' },
      'EXPORT': { bg: 'secondary', text: 'Export' },
      'PERMISSION_CHANGE': { bg: 'warning', text: 'Permission Change' }
    };
    const badge = badges[type] || { bg: 'secondary', text: type };
    return badge;
  };

  const exportLogs = () => {
    const csv = [
      ['Admin', 'Action', 'Target', 'Type', 'Timestamp', 'IP Address', 'Status'],
      ...filteredLogs.map(log => [
        log.admin,
        log.action,
        log.target,
        log.type,
        new Date(log.timestamp).toLocaleString(),
        log.ipAddress,
        log.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    Swal.fire('Success', 'Audit logs exported successfully', 'success');
  };

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="text-center py-5">Loading security audit logs...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Security Audit Logs</h3>
        <button className="btn btn-sm btn-outline-primary" onClick={exportLogs}>
          <i className="fa-solid fa-download me-2"></i>Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Action Type</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="LOGIN_FAILED">Failed Login</option>
                <option value="EXPORT">Export</option>
                <option value="PERMISSION_CHANGE">Permission Change</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Admin</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search admin name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Date Range</label>
              <select
                className="form-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFilterType('all');
                  setSearchUser('');
                  setDateRange('7days');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-3">
        <small className="text-muted">
          Showing {paginatedLogs.length} of {filteredLogs.length} logs
        </small>
      </div>

      {/* Logs Table */}
      <div className="table-responsive mb-4">
        <table className="table table-hover" style={{ color: colors.text }}>
          <thead style={{ background: isDarkMode ? colors.surface : '#f8f9fa', color: colors.text }}>
            <tr>
              <th style={{ color: colors.text }}>Admin</th>
              <th style={{ color: colors.text }}>Action</th>
              <th style={{ color: colors.text }}>Target</th>
              <th style={{ color: colors.text }}>Type</th>
              <th style={{ color: colors.text }}>Timestamp</th>
              <th style={{ color: colors.text }}>IP Address</th>
              <th style={{ color: colors.text }}>Status</th>
            </tr>
          </thead>
          <tbody style={{ background: isDarkMode ? colors.surface : '#fff' }}>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map(log => {
                const badge = getActionBadge(log.type);
                return (
                  <tr key={log.id}>
                    <td>
                      <strong>{log.admin}</strong>
                    </td>
                    <td>{log.action}</td>
                    <td>{log.target}</td>
                    <td>
                      <span className={`badge bg-${badge.bg}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td>
                      <small>{new Date(log.timestamp).toLocaleString()}</small>
                    </td>
                    <td>
                      <code>{log.ipAddress}</code>
                    </td>
                    <td>
                      <span className={`badge bg-${log.status === 'success' ? 'success' : 'danger'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i + 1} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default SecurityAudit;
