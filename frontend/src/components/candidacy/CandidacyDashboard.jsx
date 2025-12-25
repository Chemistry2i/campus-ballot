import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaTrophy, 
  FaChartLine, 
  FaUsers, 
  FaCalendar, 
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaUserFriends,
  FaBullhorn,
  FaTasks
} from 'react-icons/fa';
import Loader from '../common/Loader';

const CandidacyDashboard = () => {
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    elections: [],
    stats: {
      totalElections: 0,
      activeElections: 0,
      wonElections: 0,
      totalVotes: 0,
      pendingTasks: 0,
      activeAgents: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidate/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to dummy data
      setDashboardData({
        elections: [
          {
            _id: '1',
            title: 'Student Council President 2025',
            status: 'active',
            startDate: '2025-01-15',
            endDate: '2025-01-20',
            currentVotes: 245,
            totalVoters: 500,
            position: 'President',
            ranking: 2
          },
          {
            _id: '2',
            title: 'Faculty Representative',
            status: 'upcoming',
            startDate: '2025-02-01',
            endDate: '2025-02-05',
            currentVotes: 0,
            totalVoters: 300,
            position: 'Representative',
            ranking: null
          }
        ],
        stats: {
          totalElections: 5,
          activeElections: 1,
          wonElections: 2,
          totalVotes: 892,
          pendingTasks: 4,
          activeAgents: 3
        }
      });
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Elections',
      value: dashboardData.stats.totalElections,
      icon: FaTrophy,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Active Campaigns',
      value: dashboardData.stats.activeElections,
      icon: FaBullhorn,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Elections Won',
      value: dashboardData.stats.wonElections,
      icon: FaCheckCircle,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Total Votes',
      value: dashboardData.stats.totalVotes,
      icon: FaUsers,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Active Agents',
      value: dashboardData.stats.activeAgents,
      icon: FaUserFriends,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
    },
    {
      title: 'Pending Tasks',
      value: dashboardData.stats.pendingTasks,
      icon: FaTasks,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Active', color: '#10b981', icon: FaHourglassHalf },
      upcoming: { text: 'Upcoming', color: '#3b82f6', icon: FaCalendar },
      completed: { text: 'Completed', color: '#6b7280', icon: FaCheckCircle },
      won: { text: 'Won', color: '#f59e0b', icon: FaTrophy },
      lost: { text: 'Lost', color: '#ef4444', icon: FaTimesCircle }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    const Icon = config.icon;

    return (
      <span
        className="badge d-inline-flex align-items-center gap-1"
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}
      >
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader message="Loading dashboard..." size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-2">
      {/* Welcome Banner */}
      <div 
        className="mb-2"
        style={{
          background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)`,
          borderRadius: '12px',
          color: '#fff',
          padding: '1.5rem 1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div>
            <h2 className="mb-2">Welcome back, {user?.name || 'Candidate'}! 👋</h2>
            <p className="mb-0 opacity-90">Ready to manage your campaign? Let's make it count!</p>
          </div>
          {user?.profilePicture && (
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid rgba(255,255,255,0.3)'
              }}
            >
              <img 
                src={user.profilePicture.startsWith('http') ? user.profilePicture : `https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/uploads/${user.profilePicture}`} 
                alt={user?.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="mb-2">
        <h4 className="fw-bold mb-1" style={{ color: colors.text, fontSize: '1.25rem' }}>
          <FaTrophy className="me-2" style={{ color: '#f59e0b' }} />
          Candidacy Dashboard
        </h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Manage your campaigns and track your performance</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-2 mb-2">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="col-6 col-md-4 col-lg-3 col-xl-2">
              <div
                className="card h-100"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="card-body p-1 d-flex flex-column align-items-center justify-content-center text-center">
                  <div
                    className="d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      backgroundColor: stat.bgColor
                    }}
                  >
                    <Icon size={18} color={stat.color} />
                  </div>
                  <h4 className="fw-bold mb-1" style={{ color: stat.color, fontSize: '1.4rem' }}>
                    {stat.value}
                  </h4>
                  <p className="mb-0 small" style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>{stat.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="row g-2 mb-2">
        <div className="col-12">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6 col-md-3">
                  <Link 
                    to="/candidate/profile" 
                    className="btn btn-primary w-100 d-flex flex-column align-items-center p-2 text-decoration-none"
                    style={{ 
                      backgroundColor: '#0d6efd', 
                      borderColor: '#0d6efd', 
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div 
                      className="d-flex align-items-center justify-content-center mb-1"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <FaUserFriends size={16} />
                    </div>
                    <span>Edit Profile</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link 
                    to="/candidate/materials" 
                    className="btn btn-success w-100 d-flex flex-column align-items-center p-2 text-decoration-none"
                    style={{ 
                      backgroundColor: '#198754', 
                      borderColor: '#198754', 
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div 
                      className="d-flex align-items-center justify-content-center mb-1"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <FaBullhorn size={16} />
                    </div>
                    <span>Campaign Materials</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link 
                    to="/candidate/agents" 
                    className="btn btn-info w-100 d-flex flex-column align-items-center p-2 text-decoration-none"
                    style={{ 
                      backgroundColor: '#0dcaf0', 
                      borderColor: '#0dcaf0', 
                      color: '#000',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div 
                      className="d-flex align-items-center justify-content-center mb-1"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.1)'
                      }}
                    >
                      <FaUsers size={16} />
                    </div>
                    <span>Manage Agents</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link 
                    to="/candidate/stats" 
                    className="btn btn-warning w-100 d-flex flex-column align-items-center p-2 text-decoration-none"
                    style={{ 
                      backgroundColor: '#ffc107', 
                      borderColor: '#ffc107', 
                      color: '#000',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div 
                      className="d-flex align-items-center justify-content-center mb-1"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.1)'
                      }}
                    >
                      <FaChartLine size={16} />
                    </div>
                    <span>View Statistics</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elections List */}
      <div className="row">
        <div className="col-12">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>My Elections</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className={`table table-striped table-hover mb-0 ${isDarkMode ? 'table-dark' : ''}`}>
                  <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                    <tr>
                      <th style={{ color: colors.text, padding: '1rem', borderColor: colors.border }}>Election Title</th>
                      <th style={{ color: colors.text, borderColor: colors.border }}>Position</th>
                      <th style={{ color: colors.text, borderColor: colors.border }}>Status</th>
                      <th style={{ color: colors.text, borderColor: colors.border }}>Votes</th>
                      <th style={{ color: colors.text, borderColor: colors.border }}>Ranking</th>
                      <th style={{ color: colors.text, borderColor: colors.border }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.elections.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4" style={{ color: colors.textMuted }}>
                          No elections found. Apply for candidacy to get started!
                        </td>
                      </tr>
                    ) : (
                      dashboardData.elections.map((election) => (
                        <tr key={election._id}>
                          <td style={{ color: colors.text, padding: '1rem', borderColor: colors.border }}>
                            <div className="fw-semibold">{election.title}</div>
                            <small style={{ color: colors.textSecondary }}>
                              {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                            </small>
                          </td>
                          <td style={{ color: colors.text, borderColor: colors.border }}>
                            <span className="badge bg-secondary">{election.position}</span>
                          </td>
                          <td style={{ borderColor: colors.border }}>{getStatusBadge(election.status)}</td>
                          <td style={{ color: colors.text, borderColor: colors.border }}>
                            <div className="fw-semibold">{election.currentVotes}</div>
                            <small style={{ color: colors.textSecondary }}>of {election.totalVoters}</small>
                          </td>
                          <td style={{ color: colors.text, borderColor: colors.border }}>
                            {election.ranking ? (
                              <span className="badge bg-primary">#{election.ranking}</span>
                            ) : (
                              <span style={{ color: colors.textSecondary }}>N/A</span>
                            )}
                          </td>
                          <td style={{ borderColor: colors.border }}>
                            <Link
                              to={`/candidacy/election/${election._id}`}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#0d6efd',
                                color: '#fff',
                                border: 'none',
                                fontWeight: '500'
                              }}
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidacyDashboard;
