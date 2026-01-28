import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
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
import ThemedTable from '../common/ThemedTable';

const CandidacyDashboard = () => {
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    elections: [],
    stats: {
      totalElections: 0,
      activeElections: 0,
      upcomingElections: 0,
      completedElections: 0,
      wonElections: 0,
      totalVotes: 0,
      pendingTasks: 0,
      activeAgents: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
    fetchAgentStats();
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

  const fetchAgentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidates/agents/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setDashboardData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            activeAgents: response.data.activeAgents || 0
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching agent stats:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidates/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
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
      title: 'Upcoming',
      value: dashboardData.stats.upcomingElections,
      icon: FaCalendar,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
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
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { text: 'Ongoing', color: '#10b981', icon: FaHourglassHalf },
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
    <div className="container-fluid p-0">
      {/* Professional Banner */}
      <div 
        className="mb-3 rounded-3 position-relative overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' 
            : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)',
          padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 2vw, 2rem)'
        }}
      >
        <div className="position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex align-items-center gap-3 mb-3 flex-column flex-sm-row">
            <div 
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 'clamp(50px, 10vw, 70px)',
                height: 'clamp(50px, 10vw, 70px)',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                order: 2
              }}
            >
              <i className="fa-solid fa-person-circle text-light" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)' }}></i>
            </div>
            <div style={{ order: 1, minWidth: 0 }}>
              <h2 className="mb-2 fw-bold" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: 1.2 }}>
                Welcome, {user?.name?.split(' ')[0] || 'Candidate'}! 🚀
              </h2>
              <p className="mb-0 opacity-90" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', lineHeight: 1.4 }}>
                Manage your campaign and track your performance
              </p>
            </div>
          </div>
          
          {/* Info Badges - Responsive Grid */}
          <div className="d-flex gap-2 gap-md-4 mt-3 flex-wrap" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)' }}>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-chart-line"></i>
              <span className="d-none d-sm-inline">Campaign Analytics</span>
              <span className="d-sm-none">Analytics</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-users"></i>
              <span className="d-none d-sm-inline">Agent Management</span>
              <span className="d-sm-none">Agents</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-bullhorn"></i>
              <span className="d-none d-sm-inline">Campaign Materials</span>
              <span className="d-sm-none">Materials</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Blurred Circles */}
        <div 
          className="position-absolute"
          style={{
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(40px)',
            zIndex: 0
          }}
        />
        <div 
          className="position-absolute"
          style={{
            bottom: '-20px',
            right: '100px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            filter: 'blur(30px)',
            zIndex: 0
          }}
        />
      </div>

      {/* Header */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1" style={{ color: colors.text, fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
          <FaTrophy className="me-2" style={{ color: '#f59e0b' }} />
          Candidacy Dashboard
        </h4>
        <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>Manage your campaigns and track your performance</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-2 mb-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="col-6 col-sm-4 col-md-4 col-lg-3 col-xl-2">
              <div
                className="card h-100"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  padding: 'clamp(0.5rem, 2vw, 0.75rem)'
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
                <div className="card-body p-0 d-flex flex-column align-items-center justify-content-center text-center">
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
                  <h5 className="fw-bold mb-1" style={{ color: stat.color, fontSize: 'clamp(1rem, 3vw, 1.4rem)' }}>
                    {stat.value}
                  </h5>
                  <p className="mb-0" style={{ color: colors.textSecondary, fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', lineHeight: 1.2 }}>{stat.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="row g-2 mb-3">
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
              <h5 className="mb-0 fw-bold" style={{ color: colors.text, fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-2 g-md-3">
                <div className="col-6 col-sm-6 col-md-3">
                  <Link 
                    to="/candidate/profile" 
                    className="btn btn-primary w-100 d-flex flex-column align-items-center p-2 text-decoration-none"
                    style={{ 
                      backgroundColor: '#0d6efd', 
                      borderColor: '#0d6efd', 
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                      minHeight: '80px'
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
                <div className="col-6 col-sm-6 col-md-3">
                  <Link 
                    to="/candidate/materials" 
                    className="btn btn-success w-100 d-flex flex-column align-items-center p-2 text-decoration-none"
                    style={{ 
                      backgroundColor: '#198754', 
                      borderColor: '#198754', 
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                      minHeight: '80px'
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
                <div className="col-6 col-sm-6 col-md-3">
                  <Link 
                    to="/candidate/agents" 
                    className="btn btn-info w-100 d-flex flex-column align-items-center p-2 text-decoration-none"
                    style={{ 
                      backgroundColor: '#0dcaf0', 
                      borderColor: '#0dcaf0', 
                      color: '#000',
                      fontWeight: '600',
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                      minHeight: '80px'
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
                <div className="col-6 col-sm-6 col-md-3">
                  <Link 
                    to="/candidate/stats" 
                    className="btn btn-warning w-100 d-flex flex-column align-items-center p-2 text-decoration-none"
                    style={{ 
                      backgroundColor: '#ffc107', 
                      borderColor: '#ffc107', 
                      color: '#000',
                      fontWeight: '600',
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                      minHeight: '80px'
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
              <ThemedTable striped bordered hover responsive>
                <thead>
                  <tr>
                    <th style={{ color: colors.text, padding: '1rem' }}>Election Title</th>
                    <th style={{ color: colors.text }}>Position</th>
                    <th style={{ color: colors.text }}>Status</th>
                    <th style={{ color: colors.text }}>Votes</th>
                    <th style={{ color: colors.text }}>Ranking</th>
                    <th style={{ color: colors.text }}>Actions</th>
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
                        <td style={{ color: colors.text, padding: '1rem' }}>
                          <div className="fw-semibold">{election.title}</div>
                          <small style={{ color: colors.textSecondary }}>
                            {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                          </small>
                        </td>
                        <td style={{ color: colors.text }}>
                          <span className="badge bg-secondary">{election.position}</span>
                        </td>
                        <td>{getStatusBadge(election.status)}</td>
                        <td style={{ color: colors.text }}>
                          <div className="fw-semibold">{election.currentVotes}</div>
                          <small style={{ color: colors.textSecondary }}>
                            {election.votePercentage}% of position votes
                          </small>
                        </td>
                        <td style={{ color: colors.text }}>
                          {election.ranking ? (
                            <span className="badge bg-primary">#{election.ranking}</span>
                          ) : (
                            <span style={{ color: colors.textSecondary }}>N/A</span>
                          )}
                        </td>
                        <td>
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
              </ThemedTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidacyDashboard;
