import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { confirmLogout } from '../utils/sweetAlerts';
import RoleSwitcher from '../components/common/RoleSwitcher';
import {
  FaHome,
  FaTasks,
  FaRoute,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaUserTie,
  FaBars,
  FaTimes,
  FaBookOpen,
  FaFileAlt,
  FaHandshake,
  FaComment,
  FaEnvelope,
  FaVideo,
  FaChartBar,
  FaBell,
  FaQuestionCircle,
  FaChartLine
} from 'react-icons/fa';

// Import agent components
import AgentHeader from '../components/agent/AgentHeader';
import AgentDashboardMain from '../components/agent/AgentDashboard';
import TaskManagement from '../components/agent/TaskManagement';
import VoterOutreach from '../components/agent/VoterOutreach';
import AgentCandidates from '../components/agent/AgentCandidates';
import AgentAnalytics from '../components/agent/AgentAnalytics';

// Import candidate components for reuse in agent dashboard
import CampaignMaterials from '../components/candidacy/CampaignMaterials';
import VoterEngagement from '../components/candidacy/VoterEngagement';

const AgentDashboard = ({ user, onLogout }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/agent', icon: FaHome, label: 'Dashboard', exact: true },
    { path: '/agent/candidates', icon: FaUserTie, label: 'My Candidates' },
    { path: '/agent/analytics', icon: FaChartLine, label: 'AgentAnalytics' },
    { path: '/agent/materials', icon: FaFileAlt, label: 'Campaign Materials' },
    { path: '/agent/engagement', icon: FaHandshake, label: 'Voter Engagement' },
    { path: '/agent/outreach', icon: FaRoute, label: 'Voter Outreach' },
    { path: '/agent/tasks', icon: FaTasks, label: 'Tasks' },
    // { path: '/agent/communication', icon: FaComment, label: 'Communication' },
    // { path: '/agent/email', icon: FaEnvelope, label: 'Email Campaigns' },
    // { path: '/agent/sessions', icon: FaVideo, label: 'Live Sessions' },
    { path: '/agent/polls', icon: FaChartBar, label: 'Polls & Surveys' },
    // { path: '/agent/notifications', icon: FaBell, label: 'Notifications' },
    { path: '/agent/help', icon: FaQuestionCircle, label: 'Help & Support' }
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout(isDarkMode);
    if (confirmed) {
      onLogout();
    }
  };

  return (
    <div className="agent-page-root" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: colors.background,
      width: '100%',
      position: 'relative'
    }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: isMobile ? '100%' : (sidebarCollapsed ? '70px' : '280px'),
          maxWidth: isMobile ? '280px' : 'none',
          minWidth: isMobile ? '280px' : (sidebarCollapsed ? '70px' : '280px'),
          background: isDarkMode ? colors.surface : '#fff',
          borderRight: `1px solid ${colors.border}`,
          transition: isMobile ? 'left 0.3s ease' : 'width 0.3s ease',
          position: 'fixed',
          left: isMobile ? (sidebarOpen ? '0' : '-280px') : '0',
          top: '0',
          height: '100vh',
          maxHeight: '100vh',
          zIndex: isMobile ? 1000 : 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          padding:'0px 10px'
        }}
      >
        <div style={{ 
          padding: isMobile ? '1rem' : '0.5rem', 
          flex: 1, 
          overflowY: 'auto', 
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Header with collapse button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '1rem' : '0.5rem' }}>
              {!sidebarCollapsed && (
                <h4 className="fw-bold mb-0" style={{ 
                  color: colors.text,
                  fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                  marginTop: 'clamp(0.5rem, 2vw, 1rem)'
                }}>
                {/* 
                  <FaUserTie style={{ marginRight: '0.5rem', color: '#8b5cf6' }} />
                  Agent Portal
                */}
                  
                </h4>
              )}
              {isMobile ? (
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: colors.text,
                    marginLeft: 'auto'
                  }}
                  title="Close menu"
                >
                  <FaTimes size={14} />
                </button>
              ) : (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  style={{
                    background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: colors.text,
                    marginLeft: sidebarCollapsed ? 'auto' : '0',
                    marginRight: sidebarCollapsed ? 'auto' : '0'
                  }}
                  title="Toggle sidebar"
                >
                  {sidebarCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
                </button>
              )}
            </div>

            {/* User Info - Profile Picture */}
            {!sidebarCollapsed && (
              <div
                style={{
                  marginBottom: 'clamp(0.5rem, 1vw, 0.75rem)',
                  padding: 'clamp(0.75rem, 2vw, 1rem)',
                  background: `linear-gradient(135deg, ${isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)'}, ${isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)'})`,
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  border: `1px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    margin: '0 auto clamp(0.5rem, 1vw, 0.75rem)',
                    overflow: 'hidden',
                    border: `3px solid rgba(139, 92, 246, 0.4)`,
                    boxShadow: '0 6px 16px rgba(139, 92, 246, 0.25)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.25)';
                  }}
                >
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user?.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <span style={{ display: user?.profilePicture ? 'none' : 'flex' }}>
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="text-center">
                  <div className="fw-semibold" style={{ 
                    color: colors.text,
                    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                    marginBottom: '0.25rem'
                  }}>
                    {user?.name || 'Campaign Agent'}
                  </div>
                  <small style={{ 
                    color: colors.textSecondary,
                    fontSize: 'clamp(0.75rem, 1.3vw, 0.8rem)',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    {user?.email}
                  </small>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    color: '#8b5cf6',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}>
                    👥 Campaign Agent
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Agent Status Card */}
          {!sidebarCollapsed && (
            <div style={{
              marginBottom: 'clamp(0.5rem, 1vw, 0.75rem)',
              padding: 'clamp(0.5rem, 1vw, 0.75rem)',
              background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: 'clamp(6px, 1vw, 8px)',
              border: `1px solid rgba(16, 185, 129, 0.2)`
            }}>
              <div className="text-center">
                <div style={{ 
                  fontSize: 'clamp(0.7rem, 1.2vw, 0.75rem)', 
                  color: '#10b981',
                  fontWeight: '600',
                  marginBottom: 'clamp(0.125rem, 0.5vw, 0.25rem)'
                }}>
                  🟢 Agent Active
                </div>
                <div style={{ 
                  fontSize: 'clamp(0.65rem, 1.1vw, 0.7rem)', 
                  color: colors.textSecondary,
                  lineHeight: '1.2'
                }}>
                  Managing campaigns & outreach
                </div>
              </div>
            </div>
          )}

          {/* Menu Items - Centered */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            padding: '0.5rem 0'
          }}>
            <nav>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: sidebarCollapsed ? '0' : 'clamp(0.5rem, 1vw, 0.75rem)',
                      padding: sidebarCollapsed ? '0.5rem' : 'clamp(0.5rem, 1vw, 0.75rem)',
                      marginBottom: isMobile ? '0.35rem' : '0.25rem',
                      borderRadius: 'clamp(6px, 1vw, 8px)',
                      textDecoration: 'none',
                      color: active ? '#8b5cf6' : colors.text,
                      background: active 
                        ? (isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)')
                        : 'transparent',
                      borderLeft: active ? '3px solid #8b5cf6' : '3px solid transparent',
                      fontWeight: active ? 600 : 400,
                      fontSize: 'clamp(0.75rem, 1vw, 0.85rem)',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon size={18} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div style={{ 
          padding: '0.75rem 1rem',
          borderTop: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.textMuted,
          fontSize: '0.75rem',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <FaBookOpen style={{ marginRight: '0.25rem' }} />
            v1.0.0 © 2026 VoteSys
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#dc2626',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '0.25rem',
            }}
          >
            <FaSignOutAlt style={{ marginRight: '0.25rem' }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
        overflow: 'hidden',
        width: isMobile ? '100%' : 'auto',
        margin: 0,
        padding: 0,
        marginLeft: isMobile ? '0' : (sidebarCollapsed ? '70px' : '280px'),
        transition: 'margin-left 0.3s ease'
      }}>
        <AgentHeader 
          user={user} 
          onLogout={onLogout} 
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          colors={colors}
        />
        
        <main style={{ 
          flex: 1,
          overflow: 'auto'
        }}>
          <Routes>
            <Route path="/" element={<AgentDashboardMain />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/candidates" element={<AgentCandidates />} />
            <Route path="/outreach" element={<VoterOutreach />} />
            <Route path="/analytics" element={<AgentAnalytics />} />
            <Route path="/materials" element={<CampaignMaterials />} />
            <Route path="/engagement" element={<VoterEngagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
