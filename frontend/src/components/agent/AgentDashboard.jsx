import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUserTie, 
  FaTasks, 
  FaCheckCircle, 
  FaClock,
  FaBullhorn,
  FaChartLine,
  FaUsers,
  FaCalendar,
  FaExclamationTriangle,
  FaFileAlt,
  FaHandshake,
  FaComment,
  FaEnvelope,
  FaVideo,
  FaChartBar,
  FaTrophy,
  FaCog,
  FaQuestionCircle,
  FaBell
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AgentDashboard = () => {
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    candidates: [],
    tasks: [],
    stats: {
      totalCandidates: 0,
      activeTasks: 0,
      completedTasks: 0,
      pendingApprovals: 0,
      upcomingDeadlines: 0,
      voterOutreach: 0,
      engagementRate: 0,
      campaignEfficiency: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch agent's own dashboard info
      const dashboardResponse = await axios.get('/api/agent/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('[AgentDashboard] Dashboard response:', dashboardResponse.data);
      
      // Fetch agent's own stats
      const statsResponse = await axios.get('/api/agent/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[AgentDashboard] Stats response:', statsResponse.data);

      const agent = dashboardResponse.data?.agent;
      
      // Transform agent to candidates format (single candidate - the candidate they work for)
      const candidates = agent ? [{
        _id: agent.userId,
        name: agent.candidateName,
        email: agent.candidateEmail,
        role: agent.role,
        status: agent.status,
        tasks: agent.tasksActive,
        tasksCompleted: agent.tasksCompleted,
        joinedDate: agent.joinedDate
      }] : [];

      setDashboardData({
        candidates,
        tasks: [],
        stats: {
          totalCandidates: statsResponse.data?.totalCandidates || 0,
          activeTasks: statsResponse.data?.tasksActive || 0,
          completedTasks: statsResponse.data?.tasksCompleted || 0,
          role: statsResponse.data?.role || 'agent',
          status: statsResponse.data?.status || 'inactive',
          voterOutreach: Math.floor(Math.random() * 500) + 100,
          engagementRate: Math.floor(Math.random() * 30) + 45,
          campaignEfficiency: Math.floor(Math.random() * 20) + 75
        }
      });
      
      // Generate mock analytics data
      const mockAnalytics = [
        { week: 'Week 1', tasks: 12, completed: 8, outreach: 120 },
        { week: 'Week 2', tasks: 15, completed: 13, outreach: 180 },
        { week: 'Week 3', tasks: 10, completed: 10, outreach: 150 },
        { week: 'Week 4', tasks: 18, completed: 16, outreach: 220 }
      ];
      setAnalyticsData(mockAnalytics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        candidates: [
          {
            _id: '1',
            name: 'John Kamau',
            position: 'President',
            election: 'Student Council 2025',
            status: 'active',
            avatar: null,
            currentVotes: 234,
            tasks: 3
          },
          {
            _id: '2',
            name: 'Mary Wanjiku',
            position: 'Secretary',
            election: 'Faculty Representative',
            status: 'upcoming',
            avatar: null,
            currentVotes: 0,
            tasks: 5
          }
        ],
        tasks: [
          {
            _id: '1',
            title: 'Distribute campaign flyers',
            candidateName: 'John Kamau',
            priority: 'high',
            dueDate: '2025-01-18',
            status: 'pending',
            description: 'Distribute 500 flyers in main campus'
          },
          {
            _id: '2',
            title: 'Update social media posts',
            candidateName: 'John Kamau',
            priority: 'medium',
            dueDate: '2025-01-16',
            status: 'in-progress',
            description: 'Post daily campaign updates'
          },
          {
            _id: '3',
            title: 'Organize debate preparation',
            candidateName: 'Mary Wanjiku',
            priority: 'high',
            dueDate: '2025-01-17',
            status: 'pending',
            description: 'Schedule and organize debate prep session'
          }
        ],
        stats: {
          totalCandidates: 2,
          activeTasks: 5,
          completedTasks: 12,
          pendingApprovals: 2,
          upcomingDeadlines: 3,
          voterOutreach: 350,
          engagementRate: 62,
          campaignEfficiency: 85
        }
      });
      
      // Generate mock analytics data
      const mockAnalytics = [
        { week: 'Week 1', tasks: 12, completed: 8, outreach: 120 },
        { week: 'Week 2', tasks: 15, completed: 13, outreach: 180 },
        { week: 'Week 3', tasks: 10, completed: 10, outreach: 150 },
        { week: 'Week 4', tasks: 18, completed: 16, outreach: 220 }
      ];
      setAnalyticsData(mockAnalytics);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Candidates',
      value: dashboardData.stats.totalCandidates,
      icon: FaUserTie,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Active Tasks',
      value: dashboardData.stats.activeTasks,
      icon: FaTasks,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Completed Tasks',
      value: dashboardData.stats.completedTasks,
      icon: FaCheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Voter Outreach',
      value: dashboardData.stats.voterOutreach,
      icon: FaUsers,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Engagement Rate',
      value: dashboardData.stats.engagementRate + '%',
      icon: FaChartLine,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    },
    {
      title: 'Campaign Efficiency',
      value: dashboardData.stats.campaignEfficiency + '%',
      icon: FaTrophy,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  const getPriorityBadge = (priority) => {
    const colors = {
      high: { bg: '#ef4444', text: 'High' },
      medium: { bg: '#f59e0b', text: 'Medium' },
      low: { bg: '#10b981', text: 'Low' }
    };
    const config = colors[priority] || colors.medium;
    
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${config.bg}20`,
          color: config.bg,
          padding: '0.35rem 0.7rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}
      >
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#6b7280', text: 'Pending' },
      'in-progress': { bg: '#3b82f6', text: 'In Progress' },
      completed: { bg: '#10b981', text: 'Completed' },
      overdue: { bg: '#ef4444', text: 'Overdue' }
    };
    const config = colors[status] || colors.pending;
    
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${config.bg}20`,
          color: config.bg,
          padding: '0.35rem 0.7rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}
      >
        {config.text}
      </span>
    );
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

  return (
    <div className="container-fluid p-4">
      {/* Professional Banner */}
      <div 
        className="mb-4 rounded-3 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: '#fff',
          padding: window.innerWidth < 768 ? '1.25rem 1rem' : '2rem',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)'
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
              <FaUserTie className="me-2" />
              Campaign Agent Dashboard
            </h2>
            <p 
              className="mb-0" 
              style={{ 
                opacity: 0.95,
                fontSize: window.innerWidth < 480 ? '0.9rem' : window.innerWidth < 768 ? '0.95rem' : '1rem',
                lineHeight: '1.5'
              }}
            >
              Support your candidates, manage campaign activities, and track progress across all elections.
            </p>
          </div>
          <div className="col-12 col-md-5 text-center text-md-end mt-2 mt-md-0">
            <div className="d-flex flex-column align-items-center align-items-md-end gap-2">
              <span style={{ 
                fontSize: window.innerWidth < 480 ? '0.8rem' : window.innerWidth < 768 ? '0.85rem' : '0.9rem',
                opacity: 0.9 
              }}>
                📋 Manage All Campaigns
              </span>
              <span style={{ 
                fontSize: window.innerWidth < 480 ? '0.8rem' : window.innerWidth < 768 ? '0.85rem' : '0.9rem',
                opacity: 0.9 
              }}>
                👥 {dashboardData.stats.totalCandidates} Candidate{dashboardData.stats.totalCandidates !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{ color: colors.text }}>
          Campaign Overview
        </h4>
        <p className="text-muted mb-0 small">Track your candidates' performance and campaign metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-2 g-md-3 mb-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="col-12 col-sm-6 col-lg-4 col-xl">
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
                <div className="card-body p-2 p-md-3">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: window.innerWidth < 480 ? '40px' : '45px',
                        height: window.innerWidth < 480 ? '40px' : '45px',
                        borderRadius: '12px',
                        backgroundColor: stat.bgColor
                      }}
                    >
                      <Icon size={window.innerWidth < 480 ? 18 : 22} color={stat.color} />
                    </div>
                  </div>
                  <h3 
                    className="fw-bold mb-1" 
                    style={{ 
                      color: stat.color, 
                      fontSize: window.innerWidth < 480 ? '1.3rem' : window.innerWidth < 768 ? '1.5rem' : '1.8rem'
                    }}
                  >
                    {stat.value}
                  </h3>
                  <p 
                    className="text-muted mb-0" 
                    style={{
                      fontSize: window.innerWidth < 480 ? '0.7rem' : window.innerWidth < 768 ? '0.75rem' : '0.875rem'
                    }}
                  >
                    {stat.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
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
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <Link to="/agent/tasks" className="btn btn-primary w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaTasks size={24} className="mb-2" />
                    <span>View Tasks</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/agent/candidates" className="btn btn-success w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaUserTie size={24} className="mb-2" />
                    <span>My Candidates</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/agent/outreach" className="btn btn-info w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaBullhorn size={24} className="mb-2" />
                    <span>Voter Outreach</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/agent/analytics" className="btn btn-warning w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaChartLine size={24} className="mb-2" />
                    <span>Performance</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="row g-3 mb-4 mt-2">
        {/* Tasks Performance Chart */}
        <div className="col-12 col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaChartBar className="me-2" />
                Task Performance
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="week" stroke={colors.text} />
                  <YAxis stroke={colors.text} />
                  <Tooltip 
                    contentStyle={{
                      background: isDarkMode ? colors.surface : '#fff',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      color: colors.text
                    }}
                  />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="tasks" fill="#3b82f6" name="Total Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Voter Outreach Trend */}
        <div className="col-12 col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaChartLine className="me-2" />
                Voter Outreach Trend
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="week" stroke={colors.text} />
                  <YAxis stroke={colors.text} />
                  <Tooltip 
                    contentStyle={{
                      background: isDarkMode ? colors.surface : '#fff',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      color: colors.text
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outreach" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Menu Suggestions */}
      <div className="row g-3 mb-4 mt-2">
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
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaCog className="me-2" />
                Agent Tools & Resources
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#3b82f6';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaFileAlt size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">Campaign Materials</h6>
                      <small>Manage resources</small>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#10b981';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaHandshake size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">Voter Engagement</h6>
                      <small>Events & meetings</small>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f59e0b';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaComment size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">Communication</h6>
                      <small>Messages & updates</small>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ec4899';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaEnvelope size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">Email Campaigns</h6>
                      <small>Bulk messaging</small>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#8b5cf6';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaVideo size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">Live Sessions</h6>
                      <small>Video & webinars</small>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#06b6d4';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaChartBar size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">Polls & Surveys</h6>
                      <small>Gather feedback</small>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#14b8a6';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaBell size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">Notifications</h6>
                      <small>Announcements</small>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#6366f1';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaQuestionCircle size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">Help & Support</h6>
                      <small>FAQs & guides</small>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to="#"
                    className="d-flex align-items-center gap-3 p-3 rounded-2"
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      textDecoration: 'none',
                      color: colors.text,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f59e0b';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <FaChartBar size={24} />
                    <div>
                      <h6 className="mb-0 fw-bold">AgentAnalytics</h6>
                      <small>Advanced insights</small>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* My Candidates */}
        <div className="col-12 col-lg-6">
          <div
            className="card h-100"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaUsers className="me-2" />
                My Candidates
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.candidates.length === 0 ? (
                <div className="text-center py-5">
                  <FaUserTie size={48} className="text-muted mb-3" />
                  <p className="text-muted">No candidates assigned yet</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.candidates.map((candidate) => (
                    <div
                      key={candidate._id}
                      className="list-group-item border-0 px-0"
                      style={{ background: 'transparent' }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}
                          >
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold" style={{ color: colors.text }}>{candidate.name}</h6>
                            <p className="mb-0 small text-muted">{candidate.studentId || candidate.email}</p>
                            <div className="mt-1">
                              <span className="badge bg-info me-2">{candidate.tasks} active tasks</span>
                              <span className="badge bg-secondary">{candidate.tasksCompleted} completed</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span 
                            className="badge"
                            style={{
                              backgroundColor: candidate.status === 'active' ? '#10b981' : '#6b7280',
                              color: '#fff',
                              padding: '0.5rem 0.75rem'
                            }}
                          >
                            {candidate.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="col-12 col-lg-6">
          <div
            className="card h-100"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaTasks className="me-2" />
                Recent Tasks
              </h5>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {dashboardData.tasks.length === 0 ? (
                <div className="text-center py-5">
                  <FaTasks size={48} className="text-muted mb-3" />
                  <p className="text-muted">No tasks assigned</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.tasks.map((task) => (
                    <div
                      key={task._id}
                      className="list-group-item border-0 px-0 py-3"
                      style={{ 
                        background: 'transparent',
                        borderBottom: `1px solid ${colors.border} !important`
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-1 fw-semibold" style={{ color: colors.text }}>{task.title}</h6>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <p className="text-muted small mb-2">{task.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted small me-3">
                            <FaCalendar className="me-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-muted small">
                            <FaUserTie className="me-1" />
                            {task.candidateName}
                          </span>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
