import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from '../../utils/axiosInstance';
import { FaChartLine, FaChartBar, FaChartPie, FaUsers, FaVoteYea } from 'react-icons/fa';

const ObserverAnalytics = () => {
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const electionsList = response.data.data?.elections || [];
      setElections(electionsList);
      if (electionsList.length > 0) {
        setSelectedElection(electionsList[0]._id);
        fetchAnalytics(electionsList[0]._id);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
    }
  };

  const fetchAnalytics = async (electionId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/observer/elections/${electionId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData(response.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleElectionChange = (electionId) => {
    setSelectedElection(electionId);
    fetchAnalytics(electionId);
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <FaChartLine className="me-2" />
          Analytics & Insights
        </h3>
        <p className="text-muted mb-0">Detailed analysis of election statistics</p>
      </div>

      {/* Election Selection */}
      <div className="mb-4">
        <label className="form-label mb-2" style={{ color: colors.text }}>Select Election</label>
        <select
          className="form-select w-100"
          style={{ 
            maxWidth: '400px',
            background: colors.surface,
            color: colors.text,
            border: `1px solid ${colors.border}`
          }}
          value={selectedElection}
          onChange={(e) => handleElectionChange(e.target.value)}
        >
          <option value="">-- Select Election --</option>
          {elections.map(election => (
            <option key={election._id} value={election._id}>
              {election.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : analyticsData ? (
        <>
          {/* Overview Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      }}
                    >
                      <FaVoteYea style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div className="ms-3">
                      <h6 className="text-muted small mb-0">Total Votes</h6>
                      <h4 className="fw-bold mb-0" style={{ color: colors.text }}>
                        {analyticsData.statistics?.totalVotesCast || 0}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                    >
                      <FaUsers style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div className="ms-3">
                      <h6 className="text-muted small mb-0">Unique Voters</h6>
                      <h4 className="fw-bold mb-0" style={{ color: colors.text }}>
                        {analyticsData.statistics?.uniqueVoters || 0}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      }}
                    >
                      <FaChartPie style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div className="ms-3">
                      <h6 className="text-muted small mb-0">Turnout</h6>
                      <h4 className="fw-bold mb-0" style={{ color: colors.text }}>
                        {parseFloat(analyticsData.statistics?.turnoutPercentage || 0).toFixed(1)}%
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                      }}
                    >
                      <i className="fas fa-users me-1" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div className="ms-3">
                      <h6 className="text-muted small mb-0">Eligible</h6>
                      <h4 className="fw-bold mb-0" style={{ color: colors.text }}>
                        {analyticsData.statistics?.eligibleVoters || 0}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vote Distribution */}
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div
                className="card border-0 shadow-sm"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <FaChartPie className="me-2" style={{ color: '#3b82f6' }} />
                    Top Candidates
                  </h5>
                  <div className="list-group">
                    {analyticsData.statistics?.topCandidates && analyticsData.statistics.topCandidates.length > 0 ? (
                      analyticsData.statistics.topCandidates.map((candidate, idx) => (
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
                            <span className="fw-medium">{candidate.name}</span>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>
                              {candidate.votes} vote{candidate.votes !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              style={{
                                width: '100%',
                                height: '8px',
                                borderRadius: '4px',
                                background: colors.border,
                                overflow: 'hidden'
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${
                                    (candidate.votes / (analyticsData.statistics.topCandidates[0]?.votes || 1)) * 100
                                  }%`,
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                  borderRadius: '4px',
                                  transition: 'width 0.3s ease'
                                }}
                              ></div>
                            </div>
                            <small style={{ color: colors.textSecondary, minWidth: '45px' }}>
                              {(
                                (candidate.votes / (analyticsData.statistics.totalVotesCast || 1)) *
                                100
                              ).toFixed(1)}
                              %
                            </small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-center py-3">No candidate data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div
                className="card border-0 shadow-sm"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <FaChartBar className="me-2" style={{ color: '#10b981' }} />
                    Positions Overview
                  </h5>
                  <div className="list-group">
                    {analyticsData.statistics?.votesByPosition && analyticsData.statistics.votesByPosition.length > 0 ? (
                      analyticsData.statistics.votesByPosition.map((item, idx) => (
                        <div
                          key={idx}
                          className="list-group-item d-flex justify-content-between align-items-center"
                          style={{
                            background: colors.background,
                            border: `1px solid ${colors.border}`,
                            color: colors.text
                          }}
                        >
                          <span className="fw-medium">{item.position}</span>
                          <span
                            style={{
                              background: 'linear-gradient(135deg, #10b98130 0%, #05966930 100%)',
                              color: '#10b981',
                              padding: '6px 14px',
                              borderRadius: '12px',
                              fontSize: '0.84rem !important',
                              fontWeight: 'bold'
                            }}
                          >
                            {item.totalVotes} vote{item.totalVotes !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-center py-3">No position data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Election Details */}
          <div className="row g-3 mt-2">
            <div className="col-12">
              <div
                className="card border-0 shadow-sm"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-3">Election Details</h5>
                  <div className="row">
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <small className="text-muted">Title</small>
                        <br />
                        <span style={{ color: colors.text, fontWeight: '500' }}>
                          {analyticsData.election?.title}
                        </span>
                      </p>
                    </div>
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <small className="text-muted">Status</small>
                        <br />
                        <span
                          style={{
                            display: 'inline-block',
                            background: analyticsData.election?.calculatedStatus === 'ongoing'
                              ? '#10b98130'
                              : analyticsData.election?.calculatedStatus === 'completed'
                              ? '#8b5cf630'
                              : '#f59e0b30',
                            color: analyticsData.election?.calculatedStatus === 'ongoing'
                              ? '#10b981'
                              : analyticsData.election?.calculatedStatus === 'completed'
                              ? '#8b5cf6'
                              : '#f59e0b',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.84rem !important',
                            fontWeight: '500'
                          }}
                        >
                          {analyticsData.election?.calculatedStatus}
                        </span>
                      </p>
                    </div>
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <small className="text-muted">Start Date</small>
                        <br />
                        <span style={{ color: colors.text }}>
                          {new Date(analyticsData.election?.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    </div>
                    <div className="col-12 col-md-6">
                      <p className="mb-2">
                        <small className="text-muted">End Date</small>
                        <br />
                        <span style={{ color: colors.text }}>
                          {new Date(analyticsData.election?.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-info-circle mb-3" style={{ fontSize: '3rem', color: colors.textMuted }}></i>
          <p style={{ color: colors.textMuted }}>Select an election to view analytics</p>
        </div>
      )}
    </div>
  );
};

export default ObserverAnalytics;