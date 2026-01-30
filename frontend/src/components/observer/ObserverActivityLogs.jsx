import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { FaHistory, FaFilter } from 'react-icons/fa';

const ObserverActivityLogs = () => {
  const { isDarkMode, colors } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('all');

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
      let url = '/api/observer/elections/' + (selectedElection !== 'all' ? selectedElection : elections[0]?._id) + '/audit-logs';
      
      if (selectedElection === 'all') {
        // For now, just fetch from first election
        if (elections.length === 0) {
          setLogs([]);
          return;
        }
        url = `/api/observer/elections/${elections[0]._id}/audit-logs`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.data || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      // Use mock data
      setLogs([
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredLogs = logs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <FaHistory className="me-2" />
          Activity Logs
        </h3>
        <p className="text-muted mb-0">View all activities and events in the election system</p>
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
