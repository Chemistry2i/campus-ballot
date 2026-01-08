import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  FaChartLine, 
  FaUsers, 
  FaTrophy,
  FaPercentage,
  FaCalendar,
  FaChartBar,
  FaChartPie,
  FaDownload,
  FaArrowLeft
} from 'react-icons/fa';
import Loader from '../common/Loader';

const ElectionStats = () => {
  const { id: electionId } = useParams();
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [elections, setElections] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // all, week, day

  // Fetch list of elections if no electionId provided
  const fetchElections = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidates/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.elections) {
        setElections(response.data.elections);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching elections:', error);
      setError('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchElectionStats = useCallback(async () => {
    // If no electionId or electionId is 'undefined' string, fetch elections list instead
    if (!electionId || electionId === 'undefined') {
      fetchElections();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/candidates/election/${electionId}/stats?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.response?.data?.message || 'Failed to load statistics');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [electionId, timeRange, fetchElections]);

  useEffect(() => {
    fetchElectionStats();
  }, [fetchElectionStats]);

  const exportReport = () => {
    if (!stats) return;
    // Generate CSV report
    const csvContent = `Election Statistics Report
Election: ${stats.election?.title || 'N/A'}
Candidate: ${stats.candidate?.name || 'N/A'}
Total Votes: ${stats.candidate?.currentVotes || 0}
Vote Percentage: ${stats.candidate?.votePercentage || 0}%
Ranking: #${stats.candidate?.ranking || 'N/A'}

Department Breakdown:
${(stats.departmentBreakdown || []).map(d => `${d.department},${d.votes},${d.percentage}%`).join('\n')}
`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `election-stats-${electionId}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%' }}>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader message="Loading election statistics..." size="medium" />
        </div>
      </div>
    );
  }

  // If no electionId or 'undefined', show election selection
  if (!electionId || electionId === 'undefined') {
    return (
      <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%' }}>
        <div className="mb-4">
          <h4 className="fw-bold mb-2" style={{ color: colors.text, fontSize: '1.25rem' }}>
            <FaChartLine className="me-2" style={{ color: '#3b82f6' }} />
            Election Statistics
          </h4>
          <p className="text-muted mb-0">Select an election to view detailed statistics</p>
        </div>

        {error ? (
          <div
            className="card text-center p-5"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${colors.border}`,
              borderRadius: '12px'
            }}
          >
            <FaChartBar size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <h5 style={{ color: colors.text }}>Error Loading Elections</h5>
            <p style={{ color: colors.textSecondary }}>{error}</p>
            <button onClick={fetchElections} className="btn btn-primary">
              Try Again
            </button>
          </div>
        ) : elections.length === 0 ? (
          <div
            className="card text-center p-5"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${colors.border}`,
              borderRadius: '12px'
            }}
          >
            <FaChartBar size={48} style={{ color: colors.textSecondary, marginBottom: '1rem' }} />
            <h5 style={{ color: colors.text }}>No Elections Found</h5>
            <p style={{ color: colors.textSecondary }}>
              You're not participating in any elections yet.
            </p>
            <Link to="/candidate" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {elections.map((election) => (
              <div key={election._id || election.electionId} className="col-12 col-md-6 col-lg-4">
                <Link
                  to={`/candidate/stats/${election.electionId || election._id}`}
                  className="text-decoration-none"
                >
                  <div
                    className="card h-100"
                    style={{
                      background: isDarkMode ? colors.surface : '#fff',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="card-body p-4">
                      <h5 className="fw-bold mb-2" style={{ color: colors.text }}>
                        {election.title}
                      </h5>
                      <p className="mb-2" style={{ color: colors.textSecondary }}>
                        Position: <span className="badge bg-secondary">{election.position}</span>
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                          {election.currentVotes} votes
                        </span>
                        <span className="badge bg-primary">#{election.ranking || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // If stats failed to load or error occurred
  if (!stats || error) {
    return (
      <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%' }}>
        <div
          className="card text-center p-5"
          style={{
            background: isDarkMode ? colors.surface : '#fff',
            border: `1px solid ${colors.border}`,
            borderRadius: '12px'
          }}
        >
          <FaChartBar size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h5 style={{ color: colors.text }}>Unable to Load Statistics</h5>
          <p style={{ color: colors.textSecondary }}>
            {error || 'Could not fetch statistics for this election.'}
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button onClick={fetchElectionStats} className="btn btn-outline-primary">
              Try Again
            </button>
            <Link to="/candidate/stats" className="btn btn-primary">
              <FaArrowLeft className="me-2" />
              Select Another Election
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="flex-grow-1">
            <Link to="/candidate/stats" className="btn btn-sm btn-outline-secondary mb-2">
              <FaArrowLeft className="me-1" /> Back to Elections
            </Link>
            <h4 className="fw-bold mb-2" style={{ color: colors.text, fontSize: '1.25rem' }}>
              <FaChartLine className="me-2" style={{ color: '#3b82f6' }} />
              Election Statistics
            </h4>
            <p className="text-muted mb-0">{stats.election?.title || 'Election'}</p>
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                maxWidth: '150px'
              }}
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="day">Today</option>
            </select>
            <button 
              className="btn btn-primary" 
              onClick={exportReport}
              style={{
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd',
                color: '#fff',
                fontWeight: '500'
              }}
            >
              <FaDownload className="me-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card h-100"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                  }}
                >
                  <FaUsers size={24} color="#3b82f6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#3b82f6' }}>
                    {stats.candidate?.currentVotes || 0}
                  </h3>
                  <p className="mb-0 small" style={{ color: colors.textSecondary }}>Total Votes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card h-100"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                  }}
                >
                  <FaPercentage size={24} color="#10b981" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#10b981' }}>
                    {stats.candidate?.votePercentage || 0}%
                  </h3>
                  <p className="mb-0 small" style={{ color: colors.textSecondary }}>Vote Share</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card h-100"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)'
                  }}
                >
                  <FaTrophy size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#f59e0b' }}>
                    #{stats.candidate?.ranking || 'N/A'}
                  </h3>
                  <p className="mb-0 small" style={{ color: colors.textSecondary }}>Current Ranking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card h-100"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                  }}
                >
                  <FaChartBar size={24} color="#8b5cf6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#8b5cf6' }}>
                    {stats.candidate?.totalCandidates || 0}
                  </h3>
                  <p className="mb-0 small" style={{ color: colors.textSecondary }}>Competitors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row g-4 mb-4">
        {/* Votes Trend */}
        <div className="col-12 col-lg-8">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaChartLine className="me-2" />
                Votes Over Time
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.votesTrend || []}>
                  <defs>
                    <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="time" stroke={colors.text} />
                  <YAxis stroke={colors.text} />
                  <Tooltip 
                    contentStyle={{ 
                      background: colors.surface, 
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      color: colors.text
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="votes" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorVotes)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Year Distribution */}
        <div className="col-12 col-lg-4">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaChartPie className="me-2" />
                Votes by Year
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.yearBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ year, votes }) => `${year}: ${votes}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                  >
                    {(stats.yearBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: colors.surface, 
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-4 mb-4">
        {/* Department Breakdown */}
        <div className="col-12 col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaChartBar className="me-2" />
                Department Breakdown
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.departmentBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="department" stroke={colors.text} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke={colors.text} />
                  <Tooltip 
                    contentStyle={{ 
                      background: colors.surface, 
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      color: colors.text
                    }}
                  />
                  <Bar dataKey="votes" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="col-12 col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaTrophy className="me-2" />
                Competitor Comparison
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className={`table table-striped table-hover mb-0 ${isDarkMode ? 'table-dark' : ''}`}>
                  <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                    <tr>
                      <th>Rank</th>
                      <th>Candidate</th>
                      <th>Votes</th>
                      <th>Percentage</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.competitionData || []).map((competitor, index) => (
                      <tr key={index} style={{ background: index === (stats.candidate?.ranking - 1) ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                        <td style={{ color: colors.text }}>
                          <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-info'}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td style={{ fontWeight: index === (stats.candidate?.ranking - 1) ? 'bold' : 'normal', color: colors.text }}>
                          {competitor.name} {index === (stats.candidate?.ranking - 1) && <span className="badge bg-primary ms-1">You</span>}
                        </td>
                        <td style={{ color: colors.text }}>{competitor.votes}</td>
                        <td style={{ color: colors.text }}>{competitor.percentage}%</td>
                        <td>
                          <div className="progress" style={{ height: '20px' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ 
                                width: `${competitor.percentage}%`,
                                background: index === (stats.candidate?.ranking - 1) ? '#3b82f6' : '#6b7280'
                              }}
                              aria-valuenow={competitor.percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Distribution - only show if data available */}
      {stats.hourlyDistribution && stats.hourlyDistribution.length > 0 && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="card"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px'
              }}
            >
              <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                  <FaCalendar className="me-2" />
                  Hourly Voting Distribution
                </h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="hour" stroke={colors.text} />
                    <YAxis stroke={colors.text} />
                    <Tooltip 
                      contentStyle={{ 
                        background: colors.surface, 
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        color: colors.text
                      }}
                    />
                    <Bar dataKey="votes" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionStats;