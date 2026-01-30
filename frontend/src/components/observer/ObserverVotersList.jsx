import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ThemedTable from '../common/ThemedTable';

const ObserverVotersList = () => {
  const { isDarkMode, colors } = useTheme();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElection, setSelectedElection] = useState('all');
  const [elections, setElections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection !== 'all') {
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
      setVoters(response.data.data?.voters || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching voters:', err);
      setError('Failed to load voters list');
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVoters = voters.filter(voter =>
    voter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <option value="all">Select Election</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or student ID..."
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

      {/* Stats Cards */}
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
            <small className="text-muted">Total Voters</small>
            <h5 className="fw-bold mt-2" style={{ color: colors.text }}>
              {filteredVoters.length}
            </h5>
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
            <small className="text-muted">Voted</small>
            <h5 className="fw-bold mt-2" style={{ color: '#10b981' }}>
              {filteredVoters.filter(v => v.hasVoted).length}
            </h5>
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
            <small className="text-muted">Not Voted</small>
            <h5 className="fw-bold mt-2" style={{ color: '#f59e0b' }}>
              {filteredVoters.filter(v => !v.hasVoted).length}
            </h5>
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
            <small className="text-muted">Turnout</small>
            <h5 className="fw-bold mt-2" style={{ color: colors.text }}>
              {filteredVoters.length > 0 
                ? ((filteredVoters.filter(v => v.hasVoted).length / filteredVoters.length) * 100).toFixed(1) 
                : '0'}%
            </h5>
          </div>
        </div>
      </div>

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
        <ThemedTable striped bordered hover responsive>
          <thead style={{
            background: isDarkMode ? '#334155' : '#f9fafb',
            color: colors.text
          }}>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Faculty</th>
              <th>Voted</th>
              <th>Voted At</th>
            </tr>
          </thead>
          <tbody>
            {filteredVoters.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No voters found
                </td>
              </tr>
            ) : (
              filteredVoters.map(voter => (
                <tr key={voter._id}>
                  <td style={{ color: colors.text }}>{voter.name}</td>
                  <td style={{ color: colors.text }}>{voter.email}</td>
                  <td style={{ color: colors.text }}>{voter.studentId}</td>
                  <td style={{ color: colors.text }}>{voter.faculty}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: voter.hasVoted ? '#10b98130' : '#ef444430',
                        color: voter.hasVoted ? '#10b981' : '#ef4444'
                      }}
                    >
                      {voter.hasVoted ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ color: colors.text }}>
                    {voter.votedAt 
                      ? new Date(voter.votedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </ThemedTable>
      )}
    </div>
  );
};

export default ObserverVotersList;
