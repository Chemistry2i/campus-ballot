import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { showWelcomeToast, showNetworkError } from '../../utils/sweetAlerts';
import ObserverCharts from './ObserverCharts';
import ThemedTable from '../common/ThemedTable';

// Helper function to calculate election status based on dates
const calculateElectionStatus = (election) => {
  if (!election.startDate || !election.endDate) return election.status || 'upcoming';
  
  const now = new Date();
  const start = new Date(election.startDate);
  const end = new Date(election.endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
};

const ObserverDashboardContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [showElections, setShowElections] = useState(true);
  const { isDarkMode, colors } = useTheme();

  const fetchDashboardData = useCallback(async () => {
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
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard';
      setError(errorMessage);
      console.error('Error fetching dashboard:', err);
      if (!err.response) {
        showNetworkError(isDarkMode);
      }
    } finally {
      setLoading(false);
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchDashboardData();
    // Show welcome toast on first load
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      setTimeout(() => showWelcomeToast(user.name, isDarkMode), 500);
    }
  }, [fetchDashboardData, isDarkMode]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: colors.textMuted }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
          <p className="text-danger mb-3">{error}</p>
          <button className="btn btn-success" onClick={fetchDashboardData}>
            <i className="fas fa-redo me-2"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, elections } = dashboardData;

  return (
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
              <h2 className="mb-1 fw-bold" style={{ color: '#fff' }}>Welcome back!</h2>
              <p className="mb-0 opacity-90" style={{ color: '#fff' }}>Monitor elections with transparency and oversight</p>
            </div>
          </div>
          <div className="d-flex gap-4 mt-3 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-shield-halved" style={{ color: '#fff !important' }}></i>
              <span className="small" style={{ color: '#fff !important', fontWeight: '500', opacity: 1 }}>{overview.accessLevel === 'full' ? 'Full System Access' : 'Assigned Elections'}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-clock" style={{ color: '#fff !important' }}></i>
              <span className="small" style={{ color: '#fff !important', fontWeight: '500', opacity: 1 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

      {/* Stats Cards Section with Collapse */}
      <div className="mb-4">
        <div 
          className="d-flex align-items-center justify-content-between mb-3 p-3 rounded-3"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => setShowStats(!showStats)}
          onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
          onMouseLeave={(e) => e.currentTarget.style.background = colors.surface}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 'clamp(2rem, 4vw, 2.5rem)',
                height: 'clamp(2rem, 4vw, 2.5rem)',
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0.25rem 0.75rem rgba(16, 185, 129, 0.25)'
              }}
            >
              <i className="fas fa-chart-bar" style={{ color: '#fff', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}></i>
            </div>
            <h5 className="mb-0" style={{ 
              color: colors.text, 
              fontWeight: 600,
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)'
            }}>
              Overview Statistics
            </h5>
          </div>
          <button
            className="btn btn-sm"
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.text,
              borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
              padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.75rem, 1.5vw, 0.84rem !important)',
              transition: 'all 0.2s',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
            }}
          >
            <i className={`fas fa-chevron-${showStats ? 'up' : 'down'}`}></i>
          </button>
        </div>

        {showStats && (
          <div 
            className="row g-3"
            style={{
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface, transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: 'clamp(3rem, 6vw, 3.75rem)', 
                          height: 'clamp(3rem, 6vw, 3.75rem)',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        }}
                      >
                        <i className="fas fa-poll-h text-white" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-0 fw-bold" style={{ 
                        color: colors.text,
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)'
                      }}>{overview.totalElections}</h2>
                      <p className="mb-0" style={{ 
                        color: colors.textMuted, 
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)' 
                      }}>Total Elections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface, transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: 'clamp(3rem, 6vw, 3.75rem)', 
                          height: 'clamp(3rem, 6vw, 3.75rem)',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        }}
                      >
                        <i className="fas fa-check-circle text-white" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-0 fw-bold" style={{ 
                        color: colors.text,
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)'
                      }}>{overview.activeElections}</h2>
                      <p className="mb-0" style={{ 
                        color: colors.textMuted, 
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)' 
                      }}>Active Elections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface, transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: 'clamp(3rem, 6vw, 3.75rem)', 
                          height: 'clamp(3rem, 6vw, 3.75rem)',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        }}
                      >
                        <i className="fas fa-clock text-white" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-0 fw-bold" style={{ 
                        color: colors.text,
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)'
                      }}>{overview.upcomingElections}</h2>
                      <p className="mb-0" style={{ 
                        color: colors.textMuted, 
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)' 
                      }}>Upcoming</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface, transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: 'clamp(3rem, 6vw, 3.75rem)', 
                          height: 'clamp(3rem, 6vw, 3.75rem)',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                        }}
                      >
                        <i className="fas fa-check-double text-white" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-0 fw-bold" style={{ 
                        color: colors.text,
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)'
                      }}>{overview.completedElections}</h2>
                      <p className="mb-0" style={{ 
                        color: colors.textMuted, 
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)' 
                      }}>Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section with Collapse */}
      <div className="mb-4">
        <div 
          className="d-flex align-items-center justify-content-between mb-3 p-3 rounded-3"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => setShowCharts(!showCharts)}
          onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
          onMouseLeave={(e) => e.currentTarget.style.background = colors.surface}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 'clamp(2rem, 4vw, 2.5rem)',
                height: 'clamp(2rem, 4vw, 2.5rem)',
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: '0 0.25rem 0.75rem rgba(139, 92, 246, 0.25)'
              }}
            >
              <i className="fas fa-chart-pie" style={{ color: '#fff', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}></i>
            </div>
            <h5 className="mb-0" style={{ 
              color: colors.text, 
              fontWeight: 600,
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)'
            }}>
              Analytics & Insights
            </h5>
          </div>
          <button
            className="btn btn-sm"
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.text,
              borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
              padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.75rem, 1.5vw, 0.84rem !important)',
              transition: 'all 0.2s',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
            }}
          >
            <i className={`fas fa-chevron-${showCharts ? 'up' : 'down'}`}></i>
          </button>
        </div>
        
        {showCharts && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <ObserverCharts dashboardData={dashboardData} />
          </div>
        )}
      </div>

      {/* Elections List with Collapse */}
      <div className="mb-4">
        <div 
          className="d-flex align-items-center justify-content-between mb-3 p-3 rounded-3"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => setShowElections(!showElections)}
          onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
          onMouseLeave={(e) => e.currentTarget.style.background = colors.surface}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 'clamp(2rem, 4vw, 2.5rem)',
                height: 'clamp(2rem, 4vw, 2.5rem)',
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 0.25rem 0.75rem rgba(59, 130, 246, 0.25)'
              }}
            >
              <i className="fas fa-list-ul" style={{ color: '#fff', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}></i>
            </div>
            <h5 className="mb-0" style={{ 
              color: colors.text, 
              fontWeight: 600,
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)'
            }}>
              Assigned Elections ({elections.length})
            </h5>
          </div>
          <button
            className="btn btn-sm"
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.text,
              borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
              padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.75rem, 1.5vw, 0.84rem !important)',
              transition: 'all 0.2s',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
            }}
          >
            <i className={`fas fa-chevron-${showElections ? 'up' : 'down'}`}></i>
          </button>
        </div>

        {showElections && (
          <div 
            className="card border-0 shadow-sm" 
            style={{ 
              background: colors.surface,
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <div className="card-body p-0">
              {elections.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox mb-3" style={{ fontSize: 'clamp(2.5rem, 5vw, 3rem)', color: colors.textMuted }}></i>
                  <p style={{ 
                    color: colors.textMuted,
                    fontSize: 'clamp(0.9rem, 1.8vw, 1rem)'
                  }}>No elections assigned yet</p>
                </div>
              ) : (
                <ThemedTable striped hover responsive>
                    <thead style={{ 
                      background: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
                      borderBottom: `2px solid ${colors.border}`
                    }}>
                      <tr>
                        <th style={{ 
                          color: colors.text, 
                          borderColor: colors.border, 
                          fontWeight: 600, 
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
                        }}>
                          <i className="fas fa-trophy me-2" style={{ color: '#10b981' }}></i>Election
                        </th>
                        <th style={{ 
                          color: colors.text, 
                          borderColor: colors.border, 
                          fontWeight: 600, 
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
                        }}>
                          <i className="fas fa-info-circle me-2" style={{ color: '#10b981' }}></i>Status
                        </th>
                        <th style={{ 
                          color: colors.text, 
                          borderColor: colors.border, 
                          fontWeight: 600, 
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
                        }}>
                          <i className="fas fa-calendar-alt me-2" style={{ color: '#10b981' }}></i>Start Date
                        </th>
                        <th style={{ 
                          color: colors.text, 
                          borderColor: colors.border, 
                          fontWeight: 600, 
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
                        }}>
                          <i className="fas fa-calendar-check me-2" style={{ color: '#10b981' }}></i>End Date
                        </th>
                        <th style={{ 
                          color: colors.text, 
                          borderColor: colors.border, 
                          fontWeight: 600, 
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
                        }}>
                          <i className="fas fa-users me-2" style={{ color: '#10b981' }}></i>Positions
                        </th>
                        <th className="text-end" style={{ 
                          color: colors.text, 
                          borderColor: colors.border, 
                          fontWeight: 600, 
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          fontSize: 'clamp(0.8rem, 1.5vw, 0.84rem !important)'
                        }}>
                          <i className="fas fa-cog me-2" style={{ color: '#10b981' }}></i>Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {elections.map((election) => {
                        const statusColors = {
                          active: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#fff' },
                          ongoing: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#fff' },
                          upcoming: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#fff' },
                          completed: { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', text: '#fff' },
                          default: { bg: '#6b7280', text: '#fff' }
                        };
                        const calculatedStatus = calculateElectionStatus(election);
                        const statusStyle = statusColors[calculatedStatus] || statusColors.default;
                        
                        return (
                        <tr 
                          key={election.id} 
                          style={{ 
                            borderColor: colors.border,
                            transition: 'background 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td className="fw-medium" style={{ 
                            color: colors.text, 
                            padding: 'clamp(0.75rem, 2vw, 1rem)',
                            fontSize: 'clamp(0.85rem, 1.6vw, 0.9rem)'
                          }}>{election.title}</td>
                          <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
                            <span
                              className="badge"
                              style={{
                                background: statusStyle.bg,
                                color: statusStyle.text,
                                padding: 'clamp(0.35rem, 1vw, 0.4rem) clamp(0.6rem, 1.5vw, 0.75rem)',
                                fontSize: 'clamp(0.75rem, 1.4vw, 0.8rem)',
                                fontWeight: 600
                              }}
                            >
                              {calculatedStatus}
                            </span>
                          </td>
                          <td style={{ 
                            color: colors.textMuted, 
                            padding: 'clamp(0.75rem, 2vw, 1rem)',
                            fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)'
                          }}>
                            <i className="fas fa-calendar me-2" style={{ fontSize: 'clamp(0.75rem, 1.4vw, 0.8rem)', opacity: 0.7 }}></i>
                            {new Date(election.startDate).toLocaleDateString()}
                          </td>
                          <td style={{ 
                            color: colors.textMuted, 
                            padding: 'clamp(0.75rem, 2vw, 1rem)',
                            fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)'
                          }}>
                            <i className="fas fa-calendar-check me-2" style={{ fontSize: 'clamp(0.75rem, 1.4vw, 0.8rem)', opacity: 0.7 }}></i>
                            {new Date(election.endDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
                            <span 
                              className="badge" 
                              style={{ 
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                color: '#fff',
                                padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.75rem)',
                                fontSize: 'clamp(0.75rem, 1.4vw, 0.85rem)',
                                fontWeight: 600
                              }}
                            >
                              <i className="fas fa-users me-1" style={{ fontSize: 'clamp(0.7rem, 1.3vw, 0.75rem)' }}></i>
                              {election.positionsCount}
                            </span>
                          </td>
                          <td className="text-end" style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
                            <Link
                              to={`/observer/elections/${election.id}`}
                              className="btn btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                border: 'none',
                                textDecoration: 'none',
                                padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(1rem, 2vw, 1.25rem)',
                                fontWeight: 600,
                                borderRadius: 'clamp(0.35rem, 1vw, 0.375rem)',
                                boxShadow: '0 0.125rem 0.5rem rgba(16, 185, 129, 0.25)',
                                transition: 'all 0.2s',
                                fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-0.125rem)';
                                e.currentTarget.style.boxShadow = '0 0.25rem 0.75rem rgba(16, 185, 129, 0.35)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 0.125rem 0.5rem rgba(16, 185, 129, 0.25)';
                              }}
                            >
                              <i className="fas fa-eye me-2" style={{ color: '#fff' }}></i>
                              <span style={{ color: '#fff' }}>Monitor</span>
                            </Link>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </ThemedTable>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ObserverDashboardContent;
