import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { FaBinoculars, FaCheckCircle, FaClock, FaUsers, FaVoteYea } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ObserverMonitor = () => {
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [electionStats, setElectionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchElectionStats(selectedElection);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const electionsList = response.data.data?.elections || [];
      setElections(electionsList);
      if (electionsList.length > 0) {
        setSelectedElection(electionsList[0]._id);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
      setElections([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchElectionStats = async (electionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/observer/elections/${electionId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElectionStats(response.data.data);
    } catch (err) {
      console.error('Error fetching election stats:', err);
      setElectionStats(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ongoing: { label: 'Ongoing', color: '#10b981', bgColor: '#10b98130', icon: <FaClock /> },
      upcoming: { label: 'Upcoming', color: '#f59e0b', bgColor: '#f59e0b30', icon: <FaClock /> },
      completed: { label: 'Completed', color: '#6b7280', bgColor: '#6b728030', icon: <FaCheckCircle /> }
    };
    const config = statusMap[status] || statusMap.upcoming;
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '8px',
          backgroundColor: config.bgColor,
          color: config.color,
          fontWeight: '600'
        }}
      >
        {config.icon}
        {config.label}
      </div>
    );
  };

  const selectedElectionData = elections.find(e => e._id === selectedElection);

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <FaBinoculars className="me-2" />
          Election Monitor
        </h3>
        <p className="text-muted mb-0">Real-time monitoring of election activities</p>
      </div>

      {/* Election Selection */}
      {!loading && elections.length > 0 && (
        <div className="mb-4">
          <select
            className="form-select"
            style={{ maxWidth: '350px', background: colors.surface, color: colors.text, border: `1px solid ${colors.border}` }}
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
          >
            {elections.map(e => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>
      )}

      {selectedElectionData && electionStats && (
        <>
          {/* Key Statistics */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div
                className="card"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <div className="card-body">
                  <p className="text-muted small mb-2">Status</p>
                  {getStatusBadge(electionStats.election?.calculatedStatus || 'upcoming')}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div
                className="card"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <div className="card-body">
                  <p className="text-muted small mb-2">Eligible Voters</p>
                  <h4 className="mb-0">{electionStats.statistics?.eligibleVoters || 0}</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div
                className="card"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <div className="card-body">
                  <p className="text-muted small mb-2">Votes Cast</p>
                  <h4 className="mb-0" style={{ color: '#3b82f6' }}>
                    {electionStats.statistics?.totalVotesCast || 0}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div
                className="card"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <div className="card-body">
                  <p className="text-muted small mb-2">Turnout</p>
                  <h4 className="mb-0" style={{ color: '#10b981' }}>
                    {electionStats.statistics?.turnoutPercentage || 0}%
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <div className="btn-group" role="group">
              {['overview', 'votes', 'candidates'].map(tab => (
                <button
                  key={tab}
                  className={`btn ${selectedTab === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedTab(tab)}
                  style={
                    selectedTab === tab
                      ? { background: colors.primary, border: `1px solid ${colors.primary}`, color: 'white' }
                      : { background: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }
                  }
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <div
              className="card"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text
              }}
            >
              <div className="card-body">
                <h5 className="card-title mb-4">Election Overview</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small">Title</p>
                    <h6>{selectedElectionData.title}</h6>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small">Period</p>
                    <h6>
                      {new Date(selectedElectionData.startDate).toLocaleDateString()} - {new Date(selectedElectionData.endDate).toLocaleDateString()}
                    </h6>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small">Total Positions</p>
                    <h6>{electionStats.statistics?.positionsCount || 0}</h6>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted small">Unique Voters</p>
                    <h6>{electionStats.statistics?.uniqueVoters || 0}</h6>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'votes' && (
            <div
              className="card"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text
              }}
            >
              <div className="card-body">
                <h5 className="card-title mb-4">Votes by Position</h5>
                {electionStats.statistics?.votesByPosition && electionStats.statistics.votesByPosition.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={electionStats.statistics.votesByPosition}>
                        <CartesianGrid stroke={colors.border} />
                        <XAxis dataKey="position" stroke={colors.text} />
                        <YAxis stroke={colors.text} />
                        <Tooltip
                          contentStyle={{
                            background: colors.surface,
                            border: `1px solid ${colors.border}`,
                            color: colors.text
                          }}
                        />
                        <Bar dataKey="totalVotes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted">No voting data available</p>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'candidates' && (
            <div
              className="card"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text
              }}
            >
              <div className="card-body">
                <h5 className="card-title mb-4">Top Candidates by Votes</h5>
                {electionStats.statistics?.topCandidates && electionStats.statistics.topCandidates.length > 0 ? (
                  <div className="list-group">
                    {electionStats.statistics.topCandidates.map((candidate, idx) => (
                      <div
                        key={idx}
                        className="list-group-item"
                        style={{
                          background: colors.background,
                          border: `1px solid ${colors.border}`,
                          color: colors.text
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <h6 className="mb-0">{candidate.name}</h6>
                            <small style={{ color: colors.textSecondary }}>{candidate.position}</small>
                          </div>
                          <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            {candidate.votes}
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: colors.border,
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min((candidate.votes / (electionStats.statistics.topCandidates[0]?.votes || 1)) * 100, 100)}%`,
                              background: '#3b82f6',
                              borderRadius: '3px'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No candidate data available</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="text-center p-5">
          <div className="spinner-border" style={{ color: colors.primary }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObserverMonitor;
