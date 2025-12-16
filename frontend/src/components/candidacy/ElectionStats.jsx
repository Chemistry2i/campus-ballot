import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  FaDownload
} from 'react-icons/fa';
import Loader from '../common/Loader';

const ElectionStats = () => {
  const { electionId } = useParams();
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // all, week, day

  const fetchElectionStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/candidate/election/${electionId}/stats?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback dummy data
      setStats({
        election: {
          title: 'Student Council President 2025',
          position: 'President',
          startDate: '2025-01-15',
          endDate: '2025-01-20',
          status: 'active'
        },
        candidate: {
          name: 'John Kamau',
          currentVotes: 245,
          votePercentage: 32.5,
          ranking: 2,
          totalCandidates: 5
        },
        votesTrend: [
          { date: '2025-01-15', votes: 45, time: 'Day 1' },
          { date: '2025-01-16', votes: 87, time: 'Day 2' },
          { date: '2025-01-17', votes: 156, time: 'Day 3' },
          { date: '2025-01-18', votes: 203, time: 'Day 4' },
          { date: '2025-01-19', votes: 245, time: 'Day 5' }
        ],
        departmentBreakdown: [
          { department: 'Engineering', votes: 78, percentage: 31.8 },
          { department: 'Business', votes: 56, percentage: 22.9 },
          { department: 'Sciences', votes: 45, percentage: 18.4 },
          { department: 'Arts', votes: 38, percentage: 15.5 },
          { department: 'Medicine', votes: 28, percentage: 11.4 }
        ],
        yearBreakdown: [
          { year: 'First Year', votes: 89, color: '#3b82f6' },
          { year: 'Second Year', votes: 67, color: '#10b981' },
          { year: 'Third Year', votes: 54, color: '#f59e0b' },
          { year: 'Fourth Year', votes: 35, color: '#8b5cf6' }
        ],
        hourlyDistribution: [
          { hour: '6-9 AM', votes: 23 },
          { hour: '9-12 PM', votes: 45 },
          { hour: '12-3 PM', votes: 67 },
          { hour: '3-6 PM', votes: 78 },
          { hour: '6-9 PM', votes: 32 }
        ],
        competitorComparison: [
          { name: 'You', votes: 245, percentage: 32.5 },
          { name: 'Candidate A', votes: 198, percentage: 26.3 },
          { name: 'Candidate B', votes: 156, percentage: 20.7 },
          { name: 'Candidate C', votes: 102, percentage: 13.5 },
          { name: 'Candidate D', votes: 52, percentage: 6.9 }
        ],
        engagement: {
          totalVoters: 753,
          turnoutRate: 65.3,
          profileViews: 1247,
          materialDownloads: 89
        }
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectionStats();
  }, [electionId, timeRange]);

  const exportReport = () => {
    // Generate CSV report
    const csvContent = `Election Statistics Report
Election: ${stats.election.title}
Candidate: ${stats.candidate.name}
Total Votes: ${stats.candidate.currentVotes}
Vote Percentage: ${stats.candidate.votePercentage}%
Ranking: #${stats.candidate.ranking}

Department Breakdown:
${stats.departmentBreakdown.map(d => `${d.department},${d.votes},${d.percentage}%`).join('\n')}
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-2" style={{ color: colors.text, fontSize: '1.25rem' }}>
              <FaChartLine className="me-2" style={{ color: '#3b82f6' }} />
              Election Statistics
            </h4>
            <p className="text-muted mb-0">{stats.election.title}</p>
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
      <div className="row g-3 mb-4" style={{ margin: '0', width: '100%' }}>
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaUsers size={24} color="#3b82f6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#3b82f6' }}>
                    {stats.candidate.currentVotes}
                  </h3>
                  <p className="text-muted mb-0 small">Total Votes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaPercentage size={24} color="#10b981" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#10b981' }}>
                    {stats.candidate.votePercentage}%
                  </h3>
                  <p className="text-muted mb-0 small">Vote Share</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaTrophy size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#f59e0b' }}>
                    #{stats.candidate.ranking}
                  </h3>
                  <p className="text-muted mb-0 small">Current Ranking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaChartBar size={24} color="#8b5cf6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#8b5cf6' }}>
                    {stats.engagement.turnoutRate}%
                  </h3>
                  <p className="text-muted mb-0 small">Turnout Rate</p>
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
                <AreaChart data={stats.votesTrend}>
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
                    data={stats.yearBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ year, votes }) => `${year}: ${votes}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                  >
                    {stats.yearBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                <BarChart data={stats.departmentBreakdown}>
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
                    {stats.competitorComparison.map((competitor, index) => (
                      <tr key={index} className={competitor.name === 'You' ? 'table-primary' : ''} style={{ background: competitor.name === 'You' ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                        <td style={{ color: colors.text }}>
                          <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-info'}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td style={{ fontWeight: competitor.name === 'You' ? 'bold' : 'normal' }}>
                          {competitor.name}
                        </td>
                        <td>{competitor.votes}</td>
                        <td>{competitor.percentage}%</td>
                        <td>
                          <div className="progress" style={{ height: '20px' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ 
                                width: `${competitor.percentage}%`,
                                background: competitor.name === 'You' ? '#3b82f6' : '#6b7280'
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

      {/* Hourly Distribution */}
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
    </div>
  );
};

export default ElectionStats;
