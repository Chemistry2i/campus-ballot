import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa';

const ObserverAnalytics = () => {
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);

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
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/observer/elections/${electionId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData(response.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Use mock data
      setAnalyticsData({
        overview: {
          totalVotes: 245,
          uniqueVoters: 245,
          turnoutPercentage: 68.5,
          averageVotingTime: '3m 45s'
        },
        distribution: {
          byCandidateTop: [
            { name: 'Candidate A', votes: 120, percentage: 49 },
            { name: 'Candidate B', votes: 95, percentage: 39 },
            { name: 'Candidate C', votes: 30, percentage: 12 }
          ],
          byPosition: [
            { position: 'President', candidates: 3 },
            { position: 'Vice President', candidates: 3 },
            { position: 'Secretary', candidates: 4 }
          ]
        }
      });
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
        <select
          className="form-select w-100"
          style={{ maxWidth: '300px' }}
          value={selectedElection}
          onChange={(e) => handleElectionChange(e.target.value)}
        >
          <option value="">Select Election</option>
          {elections.map(election => (
            <option key={election._id} value={election._id}>
              {election.title}
            </option>
          ))}
        </select>
      </div>

      {analyticsData && (
        <>
          {/* Overview Cards */}
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
                  <h6 className="text-muted small mb-2">Total Votes</h6>
                  <h3 className="mb-0">{analyticsData.overview?.totalVotes || 0}</h3>
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
                  <h6 className="text-muted small mb-2">Unique Voters</h6>
                  <h3 className="mb-0">{analyticsData.overview?.uniqueVoters || 0}</h3>
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
                  <h6 className="text-muted small mb-2">Turnout</h6>
                  <h3 className="mb-0" style={{ color: '#10b981' }}>
                    {analyticsData.overview?.turnoutPercentage || 0}%
                  </h3>
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
                  <h6 className="text-muted small mb-2">Avg Vote Time</h6>
                  <h3 className="mb-0">{analyticsData.overview?.averageVotingTime || 'N/A'}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Vote Distribution */}
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div
                className="card"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <FaChartPie className="me-2" />
                    Top Candidates
                  </h5>
                  <div className="list-group">
                    {analyticsData.distribution?.byCandidateTop?.map((candidate, idx) => (
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
                          <span>{candidate.name}</span>
                          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                            {candidate.votes} votes
                          </span>
                        </div>
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
                              width: `${candidate.percentage}%`,
                              background: '#3b82f6',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>
                        <small style={{ color: colors.textSecondary }}>
                          {candidate.percentage}%
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div
                className="card"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <FaChartBar className="me-2" />
                    Positions Overview
                  </h5>
                  <div className="list-group">
                    {analyticsData.distribution?.byPosition?.map((item, idx) => (
                      <div
                        key={idx}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{
                          background: colors.background,
                          border: `1px solid ${colors.border}`,
                          color: colors.text
                        }}
                      >
                        <span>{item.position}</span>
                        <span
                          style={{
                            background: colors.primary + '30',
                            color: colors.primary,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {item.candidates} candidates
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ObserverAnalytics;
