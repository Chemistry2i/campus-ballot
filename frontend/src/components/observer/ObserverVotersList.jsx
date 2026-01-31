import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ThemedTable from '../common/ThemedTable';

const ObserverVotersList = () => {
  const { isDarkMode, colors } = useTheme();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElection, setSelectedElection] = useState('');
  const [elections, setElections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchVoters();
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const electionsList = response.data.data?.elections || [];
      setElections(electionsList);
      if (electionsList?.length > 0) {
        setSelectedElection(electionsList[0]._id);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections');
      setElections([]);
    }
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/observer/elections/${selectedElection}/voters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Backend returns { success, data: { election, statistics, voters } }
      const data = response.data.data;
      setVoters(data?.voters || []);
      setStatistics(data?.statistics || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching voters:', err);
      setError('Failed to load voters list');
      setVoters([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredVoters = voters.filter(voter =>
    (voter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter._id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    searchTerm.length >= 0
  );

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <i className="fas fa-users me-2"></i>
          Eligible Voters
        </h3>
        <p className="text-muted mb-0">View and manage eligible voters in elections</p>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label className="form-label mb-2" style={{ color: colors.text }}>Select Election</label>
          <select
            className="form-select"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          >
            <option value="">-- Select Election --</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label mb-2" style={{ color: colors.text }}>Search Voters</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-3">
            <div
              className="card p-3"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              <small className="text-muted">Total Eligible Voters</small>
              <h4 className="fw-bold mt-2" style={{ color: colors.text }}>
                {statistics.totalEligible || 0}
              </h4>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div
              className="card p-3"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              <small className="text-muted">Total Voted</small>
              <h4 className="fw-bold mt-2" style={{ color: '#10b981' }}>
                {statistics.totalVoted || 0}
              </h4>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div
              className="card p-3"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              <small className="text-muted">Pending</small>
              <h4 className="fw-bold mt-2" style={{ color: '#f59e0b' }}>
                {statistics.pendingVoters || 0}
              </h4>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div
              className="card p-3"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              <small className="text-muted">Turnout %</small>
              <h4 className="fw-bold mt-2" style={{ color: '#3b82f6' }}>
                {parseFloat(statistics.turnoutPercentage || 0).toFixed(1)}%
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div
          className="card"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px'
          }}
        >
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{
                background: isDarkMode ? colors.surfaceHover : '#f9fafb',
                borderBottom: `2px solid ${colors.border}`
              }}>
                <tr>
                  <th style={{ color: colors.text }}>Name</th>
                  <th style={{ color: colors.text }}>Email</th>
                  <th style={{ color: colors.text }}>Phone</th>
                  <th style={{ color: colors.text }}>Status</th>
                  <th style={{ color: colors.text }}>Registered</th>
                  <th style={{ color: colors.text }}>Voted</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5" style={{ color: colors.textMuted }}>
                      <i className="fas fa-inbox mb-3" style={{ fontSize: '2rem', display: 'block' }}></i>
                      {searchTerm ? 'No matching voters found' : 'No voters to display'}
                    </td>
                  </tr>
                ) : (
                  filteredVoters.map((voter, idx) => (
                    <tr key={voter._id} style={{ borderColor: colors.border }}>
                      <td style={{ color: colors.text }}>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                            style={{
                              width: '35px',
                              height: '35px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              fontSize: '0.875rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {voter.name?.charAt(0).toUpperCase()}
                          </div>
                          {voter.name}
                        </div>
                      </td>
                      <td style={{ color: colors.text }}>{voter.email}</td>
                      <td style={{ color: colors.textSecondary }}>{voter.phoneNumber || 'N/A'}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: voter.status === 'active' ? '#10b98130' : '#f5a0a030',
                            color: voter.status === 'active' ? '#10b981' : '#f59e0b'
                          }}
                        >
                          {voter.status}
                        </span>
                      </td>
                      <td style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                        {voter.registeredAt
                          ? new Date(voter.registeredAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'
                        }
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: voter.hasVoted ? '#10b98130' : '#ef444430',
                            color: voter.hasVoted ? '#10b981' : '#ef4444'
                          }}
                        >
                          <i className={`fas fa-${voter.hasVoted ? 'check' : 'times'} me-1`}></i>
                          {voter.hasVoted ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObserverVotersList;
