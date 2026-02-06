import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import ObserverSidebar from './ObserverSidebar';

const ObserverDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { isDarkMode, colors, toggleTheme } = useTheme();

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            <i className="fas fa-redo me-2"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, elections } = dashboardData;

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: colors.background }}>
      {/* Sidebar */}
      <ObserverSidebar
        user={user}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <main
        style={{
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? 64 : 280),
          transition: 'margin-left 0.3s',
          width: isMobile ? '100vw' : (sidebarCollapsed ? 'calc(100vw - 64px)' : 'calc(100vw - 280px)'),
          minHeight: '100vh',
          background: colors.background
        }}
      >
        {/* Top Bar */}
        <div 
          className="shadow-sm"
          style={{
            background: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
            padding: '1rem 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              {isMobile && (
                <button
                  className="btn btn-sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    color: colors.text
                  }}
                >
                  <i className="fas fa-bars"></i>
                </button>
              )}
              <div>
                <h5 className="mb-0" style={{ color: colors.text }}>
                  <i className="fas fa-chart-bar text-success me-2"></i>
                  Observer Dashboard
                </h5>
                <small style={{ color: colors.textMuted }}>Monitor election activities and statistics</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={toggleTheme}
                className="btn btn-sm"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
              </button>
              <span className="badge" style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff'
              }}>
                <i className="fas fa-shield-alt me-1"></i>
                {overview.accessLevel === 'full' ? 'Full Access' : 'Election-Specific'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-fluid p-4">
          {/* Welcome Banner */}
          <div 
            className="mb-4 rounded-3 position-relative overflow-hidden shadow"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              padding: '2.5rem 2rem',
            }}
          >
            <div className="position-relative" style={{ zIndex: 1 }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <i className="fa-solid fa-eye" style={{ fontSize: '1.8rem', color: '#fff' }}></i>
                </div>
                <div>
                  <h2 className="mb-1 fw-bold" style={{ color: '#fff' }}>Welcome, {user?.name || 'Observer'}!</h2>
                  <p className="mb-0 opacity-90" style={{ color: '#fff' }}>Monitor elections with transparency and oversight</p>
                </div>
              </div>
              <div className="d-flex gap-4 mt-3 flex-wrap">
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-shield-halved" style={{ color: '#fff' }}></i>
                  <span className="small" style={{ color: '#fff' }}>{overview.accessLevel === 'full' ? 'Full System Access' : 'Assigned Elections'}</span>
                </div>
                {user?.observerInfo?.organization && (
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-building" style={{ color: '#fff' }}></i>
                    <span className="small" style={{ color: '#fff' }}>{user.observerInfo.organization}</span>
                  </div>
                )}
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-clock" style={{ color: '#fff' }}></i>
                  <span className="small" style={{ color: '#fff' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div 
              className="position-absolute"
              style={{
                bottom: '-20px',
                right: '-20px',
                fontSize: '8rem',
                opacity: 0.1,
                color: '#fff'
              }}
            >
              <i className="fa-solid fa-eye"></i>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface }}>
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: '60px', 
                          height: '60px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        }}
                      >
                        <i className="fas fa-poll-h text-white" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{overview.totalElections}</h2>
                      <p className="mb-0" style={{ color: colors.textMuted, fontSize: '0.875rem' }}>Total Elections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface }}>
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: '60px', 
                          height: '60px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        }}
                      >
                        <i className="fas fa-check-circle text-white" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{overview.activeElections}</h2>
                      <p className="mb-0" style={{ color: colors.textMuted, fontSize: '0.875rem' }}>Active Elections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface }}>
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: '60px', 
                          height: '60px',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        }}
                      >
                        <i className="fas fa-clock text-white" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{overview.upcomingElections}</h2>
                      <p className="mb-0" style={{ color: colors.textMuted, fontSize: '0.875rem' }}>Upcoming</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface }}>
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: '60px', 
                          height: '60px',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                        }}
                      >
                        <i className="fas fa-check-double text-white" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>{overview.completedElections}</h2>
                      <p className="mb-0" style={{ color: colors.textMuted, fontSize: '0.875rem' }}>Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Elections List */}
          <div className="card border-0 shadow-sm" style={{ background: colors.surface }}>
            <div className="card-header border-0 py-3" style={{ background: 'transparent', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0" style={{ color: colors.text }}>
                <i className="fas fa-list-ul me-2" style={{ color: '#10b981' }}></i>
                Assigned Elections
              </h5>
            </div>
            <div className="card-body p-0">
              {elections.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox mb-3" style={{ fontSize: '3rem', color: colors.textMuted }}></i>
                  <p style={{ color: colors.textMuted }}>No elections assigned yet</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                      <tr>
                        <th style={{ color: colors.text, borderColor: colors.border }}>
                          <i className="fas fa-trophy me-2"></i>Election
                        </th>
                        <th style={{ color: colors.text, borderColor: colors.border }}>
                          <i className="fas fa-info-circle me-2"></i>Status
                        </th>
                        <th style={{ color: colors.text, borderColor: colors.border }}>
                          <i className="fas fa-calendar-alt me-2"></i>Start Date
                        </th>
                        <th style={{ color: colors.text, borderColor: colors.border }}>
                          <i className="fas fa-calendar-check me-2"></i>End Date
                        </th>
                        <th style={{ color: colors.text, borderColor: colors.border }}>
                          <i className="fas fa-users me-2"></i>Positions
                        </th>
                        <th className="text-end" style={{ color: colors.text, borderColor: colors.border }}>
                          <i className="fas fa-cog me-2"></i>Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {elections.map((election) => {
                        const statusColors = {
                          active: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#fff' },
                          upcoming: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#fff' },
                          completed: { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', text: '#fff' },
                          default: { bg: '#6b7280', text: '#fff' }
                        };
                        const statusStyle = statusColors[election.status] || statusColors.default;
                        
                        return (
                        <tr key={election.id} style={{ borderColor: colors.border }}>
                          <td className="fw-medium" style={{ color: colors.text }}>{election.title}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: statusStyle.bg,
                                color: statusStyle.text
                              }}
                            >
                              {election.status}
                            </span>
                          </td>
                          <td style={{ color: colors.textSecondary }}>{new Date(election.startDate).toLocaleDateString()}</td>
                          <td style={{ color: colors.textSecondary }}>{new Date(election.endDate).toLocaleDateString()}</td>
                          <td>
                            <span 
                              className="badge" 
                              style={{ 
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                color: '#fff'
                              }}
                            >
                              {election.positionsCount}
                            </span>
                          </td>
                          <td className="text-end">
                            <Link
                              to={`/observer/elections/${election.id}`}
                              className="btn btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                border: 'none'
                              }}
                            >
                              <i className="fas fa-eye me-1"></i>
                              Monitor
                            </Link>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ObserverDashboard;

