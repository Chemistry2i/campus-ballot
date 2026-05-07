import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import ThemedTable from '../common/ThemedTable';
import { useTheme } from '../../contexts/ThemeContext';

const ElectionMonitor = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('statistics');
  const [statistics, setStatistics] = useState(null);
  const [candidates, setCandidates] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/observer/elections/${electionId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setStatistics(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/observer/elections/${electionId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setCandidates(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/observer/elections/${electionId}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setAuditLogs(response.data.data.logs);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'statistics') {
      fetchStatistics();
    } else if (activeTab === 'candidates') {
      fetchCandidates();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId, activeTab]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading election data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-danger mb-3" style={{ fontSize: '4rem' }}></i>
          <h4 className="text-danger mb-3">{error}</h4>
          <button className="btn btn-primary" onClick={() => {
            if (activeTab === 'statistics') fetchStatistics();
            else if (activeTab === 'candidates') fetchCandidates();
            else fetchAuditLogs();
          }}>
            <i className="fas fa-redo me-2"></i>Retry
          </button>
          <button className="btn btn-outline-secondary ms-2" onClick={() => navigate('/observer/dashboard')}>
            <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="mb-2 mb-md-0">
              <button
                className="btn btn-outline-secondary btn-sm me-3"
                onClick={() => navigate('/observer/dashboard')}
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <i className="fas fa-arrow-left me-2"></i>Back
              </button>
              <span className="fs-4 fw-bold" style={{ color: colors.text }}>
                <i className="fas fa-vote-yea me-2" style={{ color: '#10b981' }}></i>
                {statistics?.election?.title || candidates?.election?.title || 'Election Monitor'}
              </span>
              {(statistics?.election?.status || candidates?.election?.status) && (
                <span className={`badge ms-3`} style={{
                  background: (statistics?.election?.status || candidates?.election?.status) === 'active' ? '#10b98130' : 
                             (statistics?.election?.status || candidates?.election?.status) === 'upcoming' ? '#f59e0b30' : '#6b728030',
                  color: (statistics?.election?.status || candidates?.election?.status) === 'active' ? '#10b981' : 
                         (statistics?.election?.status || candidates?.election?.status) === 'upcoming' ? '#f59e0b' : '#6b7280'
                }}>
                  {statistics?.election?.status || candidates?.election?.status}
                </span>
              )}
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => {
                if (activeTab === 'statistics') fetchStatistics();
                else if (activeTab === 'candidates') fetchCandidates();
                else fetchAuditLogs();
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none'
              }}
            >
              <i className="fas fa-sync-alt me-2"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveTab('statistics')}
                style={{ 
                  border: 'none', 
                  borderBottom: activeTab === 'statistics' ? '3px solid #10b981' : 'none',
                  background: 'transparent',
                  color: activeTab === 'statistics' ? '#10b981' : colors.text
                }}
              >
                <i className="fas fa-chart-pie me-2"></i>Statistics
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'candidates' ? 'active' : ''}`}
                onClick={() => setActiveTab('candidates')}
                style={{ 
                  border: 'none', 
                  borderBottom: activeTab === 'candidates' ? '3px solid #10b981' : 'none',
                  background: 'transparent',
                  color: activeTab === 'candidates' ? '#10b981' : colors.text
                }}
              >
                <i className="fas fa-users me-2"></i>Candidates
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
                style={{ 
                  border: 'none', 
                  borderBottom: activeTab === 'audit' ? '3px solid #10b981' : 'none',
                  background: 'transparent',
                  color: activeTab === 'audit' ? '#10b981' : colors.text
                }}
              >
                <i className="fas fa-clipboard-list me-2"></i>Audit Logs
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container-fluid py-4">
        {activeTab === 'statistics' && statistics && <StatisticsView data={statistics} />}
        {activeTab === 'candidates' && candidates && <CandidatesView data={candidates} />}
        {activeTab === 'audit' && <AuditLogsView logs={auditLogs} />}
      </div>
    </div>
  );
};

// Statistics View Component
const StatisticsView = ({ data }) => {
  const { isDarkMode, colors } = useTheme();
  const { election, statistics } = data;

  return (
    <div>
      {/* Info Alert */}
      <div 
        className="alert d-flex align-items-center mb-4" 
        role="alert"
        style={{
          background: isDarkMode ? '#10b98120' : '#d1fae5',
          border: `1px solid ${isDarkMode ? '#10b98140' : '#10b981'}`,
          color: colors.text
        }}
      >
        <i className="fas fa-info-circle me-3 fs-4" style={{ color: '#10b981' }}></i>
        <div>
          <strong>Election Period:</strong> {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div 
            className="card border-0 h-100"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: '12px',
                    borderRadius: '50%',
                    opacity: 0.9
                  }}>
                    <i className="fas fa-users text-white fs-3"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1" style={{ color: colors.textMuted }}>Eligible Voters</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{statistics.eligibleVoters.toLocaleString()}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div 
            className="card border-0 h-100"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '12px',
                    borderRadius: '50%',
                    opacity: 0.9
                  }}>
                    <i className="fas fa-user-check text-white fs-3"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1" style={{ color: colors.textMuted }}>Voters Participated</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{statistics.uniqueVoters.toLocaleString()}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div 
            className="card border-0 h-100"
            style={{
              background: colors.surface,
              border: `2px solid #10b981`,
              boxShadow: isDarkMode ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.2)'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '12px',
                    borderRadius: '50%',
                    opacity: 0.9
                  }}>
                    <i className="fas fa-percentage text-white fs-3"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1" style={{ color: colors.textMuted }}>Voter Turnout</h6>
                  <h2 className="mb-0 fw-bold text-success">{statistics.turnoutPercentage}%</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div 
            className="card border-0 h-100"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    padding: '12px',
                    borderRadius: '50%',
                    opacity: 0.9
                  }}>
                    <i className="fas fa-vote-yea text-white fs-3"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1" style={{ color: colors.textMuted }}>Total Votes Cast</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{statistics.totalVotesCast.toLocaleString()}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div 
            className="card border-0 h-100"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    padding: '12px',
                    borderRadius: '50%',
                    opacity: 0.9
                  }}>
                    <i className="fas fa-user-tie text-white fs-3"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1" style={{ color: colors.textMuted }}>Total Candidates</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{(statistics.candidatesCount || 0).toLocaleString()}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div 
            className="card border-0 h-100"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    padding: '12px',
                    borderRadius: '50%',
                    opacity: 0.9
                  }}>
                    <i className="fas fa-trophy text-white fs-3"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1" style={{ color: colors.textMuted }}>Positions</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{statistics.positionsCount}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Turnout Progress */}
      <div 
        className="card border-0"
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div 
          className="card-header py-3"
          style={{
            background: colors.surface,
            borderBottom: `1px solid ${colors.border}`
          }}
        >
          <h5 className="mb-0" style={{ color: colors.text }}>
            <i className="fas fa-chart-bar text-success me-2"></i>
            Voter Turnout Progress
          </h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span style={{ color: colors.textMuted }}>Participation Rate</span>
            <span className="fw-bold text-success fs-5">{statistics.turnoutPercentage}%</span>
          </div>
          <div className="progress" style={{ height: '30px' }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-success"
              role="progressbar"
              style={{ width: `${statistics.turnoutPercentage}%` }}
              aria-valuenow={statistics.turnoutPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {statistics.turnoutPercentage}%
            </div>
          </div>
          <div className="d-flex justify-content-between mt-2">
            <small style={{ color: colors.textMuted }}>
              <i className="fas fa-user-check me-1"></i>
              {statistics.uniqueVoters} voted
            </small>
            <small style={{ color: colors.textMuted }}>
              <i className="fas fa-user-clock me-1"></i>
              {statistics.eligibleVoters - statistics.uniqueVoters} pending
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

// Candidates View Component
const CandidatesView = ({ data }) => {
  const { isDarkMode } = useTheme();
  
  if (!data.positions || data.positions.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="fas fa-users-slash text-muted mb-3" style={{ fontSize: '4rem' }}></i>
          <h5 className="text-muted">No candidates found</h5>
        </div>
      </div>
    );
  }

  return (
    <div>
      {data.positions.map((position, index) => (
        <div key={position.positionId} className={index > 0 ? 'mt-4' : ''}>
          <div className="card border-0 shadow-sm">
            <div className="card-header text-white py-3" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <h5 className="mb-0">
                <i className="fas fa-trophy me-2"></i>
                {position.positionTitle}
                <span className="badge bg-white text-success ms-2">
                  {position.candidates.length} Candidate{position.candidates.length !== 1 ? 's' : ''}
                </span>
              </h5>
            </div>
            <div className="card-body p-0">
              <ThemedTable striped bordered hover responsive>
                <thead>
                  <tr>
                    <th><i className="fas fa-user me-2"></i>Name</th>
                    <th><i className="fas fa-envelope me-2"></i>Email</th>
                    <th><i className="fas fa-graduation-cap me-2"></i>Faculty</th>
                    <th><i className="fas fa-book me-2"></i>Course</th>
                    <th><i className="fas fa-calendar me-2"></i>Year</th>
                    <th><i className="fas fa-info-circle me-2"></i>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {position.candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td className="fw-medium">{candidate.name}</td>
                      <td>{candidate.email}</td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {candidate.faculty}
                        </span>
                      </td>
                      <td>{candidate.course}</td>
                      <td>
                        <span className="badge bg-info">
                          Year {candidate.yearOfStudy}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${
                          candidate.status === 'approved' ? 'success' : 
                          candidate.status === 'pending' ? 'warning' : 'secondary'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ThemedTable>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Audit Logs View Component
const AuditLogsView = ({ logs }) => {
  const { isDarkMode } = useTheme();
  
  if (!logs || logs.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="fas fa-clipboard-list text-muted mb-3" style={{ fontSize: '4rem' }}></i>
          <h5 className="text-muted">No audit logs available</h5>
        </div>
      </div>
    );
  }

  const getActionIcon = (action) => {
    const icons = {
      'VOTE_CAST': 'fa-vote-yea',
      'CANDIDATE_ADDED': 'fa-user-plus',
      'ELECTION_STARTED': 'fa-play-circle',
      'ELECTION_ENDED': 'fa-stop-circle',
      'SETTINGS_UPDATED': 'fa-cog',
      'USER_LOGIN': 'fa-sign-in-alt',
      'USER_LOGOUT': 'fa-sign-out-alt',
    };
    return icons[action] || 'fa-info-circle';
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      'VOTE_CAST': 'success',
      'CANDIDATE_ADDED': 'primary',
      'ELECTION_STARTED': 'info',
      'ELECTION_ENDED': 'warning',
      'SETTINGS_UPDATED': 'secondary',
      'USER_LOGIN': 'info',
      'USER_LOGOUT': 'secondary',
    };
    return colors[action] || 'secondary';
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-0 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-clipboard-list text-primary me-2"></i>
            Activity Audit Log
          </h5>
          <span className="badge bg-secondary">{logs.length} entries</span>
        </div>
      </div>
      <div className="card-body p-0">
        <ThemedTable striped bordered hover responsive>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>
                <i className="fas fa-clock me-2"></i>Timestamp
              </th>
              <th style={{ width: '20%' }}>
                <i className="fas fa-bolt me-2"></i>Action
              </th>
              <th style={{ width: '15%' }}>
                <i className="fas fa-user me-2"></i>User
              </th>
              <th>
                <i className="fas fa-info-circle me-2"></i>Details
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log._id || index}>
                <td>
                  <small className="text-muted">
                    {new Date(log.timestamp).toLocaleString()}
                  </small>
                </td>
                <td>
                  <span className={`badge bg-${getActionBadgeColor(log.action)}`}>
                    <i className={`fas ${getActionIcon(log.action)} me-1`}></i>
                    {log.action}
                  </span>
                </td>
                <td>
                  <span className="text-muted">
                    <i className="fas fa-user-circle me-1"></i>
                    {log.userId?.name || 'System'}
                  </span>
                </td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </ThemedTable>
      </div>
    </div>
  );
};

export default ElectionMonitor;
