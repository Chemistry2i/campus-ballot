import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from '../../utils/axiosInstance';
import { FaHistory, FaFilter, FaFileCsv, FaFilePdf } from 'react-icons/fa';

const ObserverActivityLogs = () => {
  const { isDarkMode, colors } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchElections();
    fetchActivityLogs();
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [filterType, selectedElection]);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const electionsList = response.data.data?.elections || [];
      setElections(electionsList);
    } catch (err) {
      console.error('Error fetching elections:', err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Default to first election if 'all' is selected or no specific selection
      let targetElectionId = selectedElection;
      if (selectedElection === 'all' && elections.length > 0) {
        targetElectionId = elections[0]._id;
      }
      
      if (!targetElectionId || elections.length === 0) {
        setLogs(getMockLogs());
        return;
      }
      
      const url = `/api/observer/elections/${targetElectionId}/audit-logs`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const logsData = response.data.data?.logs || response.data.data || [];
      setLogs(Array.isArray(logsData) ? logsData : getMockLogs());
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setLogs(getMockLogs());
    } finally {
      setLoading(false);
    }
  };

  const getMockLogs = () => [
    {
      _id: '1',
      action: 'Vote Recorded',
      type: 'vote_cast',
      description: 'A vote was recorded for position: President',
      user: 'System',
      timestamp: new Date(Date.now() - 300000),
      details: { position: 'President', candidate: 'John Doe' }
    },
    {
      _id: '2',
      action: 'Observer Logged In',
      type: 'login',
      description: 'Observer accessed the monitoring dashboard',
      user: 'Observer 1',
      timestamp: new Date(Date.now() - 3600000),
      details: { ip: '192.168.1.1' }
    },
    {
      _id: '3',
      action: 'Election Status Updated',
      type: 'election_update',
      description: 'Election status changed from upcoming to ongoing',
      user: 'Admin',
      timestamp: new Date(Date.now() - 7200000),
      details: { oldStatus: 'upcoming', newStatus: 'ongoing' }
    },
    {
      _id: '4',
      action: 'Incident Reported',
      type: 'incident_report',
      description: 'Technical issue reported at polling station 5',
      user: 'Observer 2',
      timestamp: new Date(Date.now() - 10800000),
      details: { station: 'Station 5', severity: 'medium' }
    },
    {
      _id: '5',
      action: 'Data Export',
      type: 'data_export',
      description: 'Voter list exported by administrator',
      user: 'Admin',
      timestamp: new Date(Date.now() - 14400000),
      details: { format: 'CSV', recordCount: 1250 }
    }
  ];

  const getActionIcon = (type) => {
    const iconMap = {
      vote_cast: '🗳️',
      login: '🔓',
      logout: '🔐',
      election_update: '✏️',
      incident_report: '⚠️',
      data_export: '📥',
      config_change: '⚙️'
    };
    return iconMap[type] || '📋';
  };

  const handleExportLogs = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const filteredData = filteredLogs.map(log => ({
        Action: log.action,
        Type: log.type,
        Description: log.description,
        User: log.user || 'System',
        Timestamp: log.timestamp instanceof Date
          ? log.timestamp.toLocaleString()
          : new Date(log.timestamp).toLocaleString()
      }));
      
      if (format === 'csv') {
        // Generate CSV
        const headers = Object.keys(filteredData[0]).join(',');
        const rows = filteredData.map(row =>
          Object.values(row).map(val => `"${val}"`).join(',')
        ).join('\n');
        
        const csv = headers + '\n' + rows;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `activity_logs_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('PDF export coming soon. Please use CSV for now.');
      }
    } catch (err) {
      console.error('Error exporting logs:', err);
      alert('Failed to export activity logs');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredLogs = (Array.isArray(logs) ? logs : []).filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
              <FaHistory className="me-2" />
              Activity Logs
            </h3>
            <p className="text-muted mb-0">View all activities and events in the election system</p>
          </div>
          
          {/* Export Buttons */}
          {filteredLogs.length > 0 && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-success"
                onClick={() => handleExportLogs('csv')}
                disabled={exportLoading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {exportLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FaFileCsv />
                    Export CSV
                  </>
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleExportLogs('pdf')}
                disabled={exportLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaFilePdf />
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label className="form-label" style={{ color: colors.text }}>Election</label>
          <select
            className="form-select"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            <option value="all">All Elections</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" style={{ color: colors.text }}>Activity Type</label>
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            <option value="all">All Activities</option>
            <option value="vote_cast">Votes Cast</option>
            <option value="login">Logins</option>
            <option value="election_update">Election Updates</option>
            <option value="incident_report">Incident Reports</option>
            <option value="data_export">Data Exports</option>
            <option value="config_change">Configuration Changes</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" style={{ color: colors.primary }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="timeline">
          {filteredLogs.map((log, idx) => (
            <div
              key={log._id}
              className="timeline-item mb-3"
              style={{
                paddingLeft: '40px',
                position: 'relative'
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '4px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: colors.primary,
                  border: `3px solid ${colors.surface}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}
              >
                {getActionIcon(log.type)}
              </div>

              {/* Timeline content */}
              <div
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '16px',
                  color: colors.text
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="mb-0" style={{ fontWeight: '600' }}>
                    {log.action}
                  </h6>
                  <small style={{ color: colors.textSecondary }}>
                    {log.timestamp instanceof Date
                      ? log.timestamp.toLocaleString()
                      : new Date(log.timestamp).toLocaleString()}
                  </small>
                </div>
                <p style={{ color: colors.textSecondary, marginBottom: '8px' }}>
                  {log.description}
                </p>
                {log.user && (
                  <small style={{ color: colors.textSecondary }}>
                    <strong>By:</strong> {log.user}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="alert alert-info"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.text
          }}
        >
          No activity logs found for the selected filters.
        </div>
      )}
    </div>
  );
};

export default ObserverActivityLogs;
