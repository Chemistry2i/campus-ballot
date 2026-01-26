import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaChartLine,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaChartBar,
  FaCalendar
} from 'react-icons/fa';

const AgentAnalytics = () => {
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/agent/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[AgentAnalytics] Stats response:', response.data);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const analyticsCards = [
    {
      icon: FaTasks,
      title: 'Total Tasks',
      value: (stats?.tasksActive || 0) + (stats?.tasksCompleted || 0),
      bgColor: '#3b82f620',
      color: '#3b82f6',
      trend: '+12% this month'
    },
    {
      icon: FaCheckCircle,
      title: 'Tasks Completed',
      value: stats?.tasksCompleted || 0,
      bgColor: '#10b98120',
      color: '#10b981',
      trend: 'On track'
    },
    {
      icon: FaClock,
      title: 'Active Tasks',
      value: stats?.tasksActive || 0,
      bgColor: '#f59e0b20',
      color: '#f59e0b',
      trend: 'In progress'
    },
    {
      icon: FaUsers,
      title: 'Candidates',
      value: stats?.totalCandidates || 0,
      bgColor: '#8b5cf620',
      color: '#8b5cf6',
      trend: 'Under your support'
    }
  ];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <FaChartLine className="me-2" />
          Performance Analytics
        </h3>
        <p className="text-muted mb-0">Track your agent performance and campaign metrics</p>
      </div>

      {/* Professional Banner */}
      <div
        className="mb-4 rounded-3 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          color: '#fff',
          padding: window.innerWidth < 768 ? '1.25rem 1rem' : '2rem',
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)'
        }}
      >
        <div className="row align-items-center">
          <div className="col-12 col-md-7 mb-3 mb-md-0">
            <h2
              className="fw-bold mb-2"
              style={{
                fontSize: window.innerWidth < 480 ? '1.5rem' : window.innerWidth < 768 ? '1.75rem' : '2rem',
                lineHeight: '1.3'
              }}
            >
              Campaign Performance
            </h2>
            <p
              className="mb-0"
              style={{
                opacity: 0.95,
                fontSize: window.innerWidth < 480 ? '0.9rem' : window.innerWidth < 768 ? '0.95rem' : '1rem',
                lineHeight: '1.5'
              }}
            >
              Monitor your agent's progress and contributions to the campaign.
            </p>
          </div>
          <div className="col-12 col-md-5 text-center text-md-end mt-2 mt-md-0">
            <div className="d-flex flex-column align-items-center align-items-md-end gap-2">
              <span
                style={{
                  fontSize: window.innerWidth < 480 ? '0.8rem' : window.innerWidth < 768 ? '0.85rem' : '0.9rem',
                  opacity: 0.9
                }}
              >
                📊 Performance Overview
              </span>
              <span
                style={{
                  fontSize: window.innerWidth < 480 ? '0.8rem' : window.innerWidth < 768 ? '0.85rem' : '0.9rem',
                  opacity: 0.9
                }}
              >
                📈 Real-time Updates
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="row g-2 g-md-3 mb-4">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div
                className="card h-100"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
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
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <div
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '12px',
                        backgroundColor: card.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={22} color={card.color} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-1" style={{ color: card.color, fontSize: '1.75rem' }}>
                    {card.value}
                  </h3>
                  <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                    {card.title}
                  </p>
                  <small style={{ color: card.color, fontWeight: 600 }}>
                    {card.trend}
                  </small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Analytics Section */}
      <div className="row g-3">
        {/* Task Breakdown */}
        <div className="col-12 col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div
              className="card-header"
              style={{
                background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                borderBottom: `1px solid ${colors.border}`
              }}
            >
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaChartBar className="me-2" />
                Task Breakdown
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ color: colors.text }}>Active Tasks</span>
                  <span className="fw-bold" style={{ color: '#3b82f6' }}>
                    {stats?.tasksActive || 0}
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width:
                        stats && stats.tasksActive + stats.tasksCompleted > 0
                          ? (stats.tasksActive / (stats.tasksActive + stats.tasksCompleted)) * 100 + '%'
                          : '0%',
                      background: '#3b82f6'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ color: colors.text }}>Completed Tasks</span>
                  <span className="fw-bold" style={{ color: '#10b981' }}>
                    {stats?.tasksCompleted || 0}
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width:
                        stats && stats.tasksActive + stats.tasksCompleted > 0
                          ? (stats.tasksCompleted / (stats.tasksActive + stats.tasksCompleted)) * 100 + '%'
                          : '0%',
                      background: '#10b981'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Information */}
        <div className="col-12 col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div
              className="card-header"
              style={{
                background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                borderBottom: `1px solid ${colors.border}`
              }}
            >
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                Agent Information
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Agent Role</small>
                <p className="mb-0" style={{ color: colors.text, fontWeight: 600, textTransform: 'capitalize' }}>
                  {stats?.role || 'Agent'}
                </p>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Status</small>
                <p className="mb-0">
                  <span
                    style={{
                      padding: '0.35rem 0.7rem',
                      borderRadius: '20px',
                      background: stats?.status === 'active' ? '#10b98130' : '#6b728030',
                      color: stats?.status === 'active' ? '#10b981' : '#6b7280',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  >
                    {stats?.status || 'Inactive'}
                  </span>
                </p>
              </div>
              <hr style={{ borderColor: colors.border }} />
              <div>
                <small className="text-muted d-block mb-1">
                  <FaCalendar className="me-2" />
                  Permissions
                </small>
                <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                  {stats?.permissions ? Object.values(stats.permissions).filter(v => v).length + ' permissions active' : 'No permissions set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="row g-3 mt-2">
        <div className="col-12">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: colors.text }}>
                Performance Summary
              </h6>
              <p style={{ color: colors.text, marginBottom: '1rem' }}>
                You are making excellent progress! Keep up the great work supporting your candidates in the campaign.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <span
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: '#10b98130',
                    color: '#10b981',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  ✓ {stats?.tasksCompleted || 0} Tasks Completed
                </span>
                <span
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: '#3b82f630',
                    color: '#3b82f6',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  → {stats?.tasksActive || 0} Active Tasks
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentAnalytics;
