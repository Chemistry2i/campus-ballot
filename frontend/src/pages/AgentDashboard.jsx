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
import AgentPermissions from '../components/agent/AgentPermissions';
import CampaignAnalytics from '../components/agent/CampaignAnalytics';
import Messages from '../components/agent/CampaignMessage'; 
import Events from '../components/agent/ScheduleCampaignEvent';

// Import candidate components for reuse in agent dashboard
import CampaignMaterials from '../components/candidacy/CampaignMaterials';
import VoterEngagement from '../components/candidacy/VoterEngagement';

const AgentDashboard = ({ user, onLogout }) => {
  const { isDarkMode, colors } = useTheme();
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
    { path: '/agent/analytics', icon: FaChartLine, label: 'Analytics' },
    { path: '/agent/materials', icon: FaFileAlt, label: 'Campaign Materials' },
    { path: '/agent/engagement', icon: FaHandshake, label: 'Voter Engagement' },
    { path: '/agent/outreach', icon: FaRoute, label: 'Voter Outreach' },
    { path: '/agent/tasks', icon: FaTasks, label: 'Assigned Tasks' },
    // { path: '/agent/communication', icon: FaComment, label: 'Communication' },
    { path: '/agent/messages', icon: FaEnvelope, label: 'Messages' },
    // { path: '/agent/sessions', icon: FaVideo, label: 'Live Sessions' },
    { path: '/agent/events', icon: FaChartBar, label: 'Events' },
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
      position: 'relative',
      flexDirection: 'column'
    }}>
      {/* Mobile Sidebar */}
      <div
        className={`shadow-sm border-end position-fixed top-0 start-0 h-100 d-lg-none${sidebarOpen ? '' : ' d-none'}`}
        style={{
          width: '80vw',
          maxWidth: '320px',
          zIndex: 2000,
          transition: 'transform 0.3s',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: sidebarOpen ? '2px 0 16px rgba(0,0,0,0.08)' : 'none',
          background: isDarkMode ? colors.surface : '#fff',
          borderColor: isDarkMode ? colors.border : '#dee2e6',
        }}
      >
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-uppercase small fw-bold mb-0" style={{ color: isDarkMode ? colors.textSecondary : '#6c757d' }}>Navigation</h6>
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={() => setSidebarOpen(false)} 
              aria-label="Close sidebar menu"
              style={{
                borderColor: isDarkMode ? colors.border : '#dee2e6',
                color: isDarkMode ? colors.text : 'inherit'
              }}
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Enhanced Profile Section */}
          <div style={{
            marginBottom: '0.75rem',
            padding: '0.75rem',
            background: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
            borderRadius: '8px',
            border: `1px solid rgba(139, 92, 246, 0.2)`
          }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.3rem',
                margin: '0 auto 0.5rem',
                overflow: 'hidden',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)'
              }}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture || '/default-avatar.png'} 
                  alt={user?.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span style={{ display: user?.profilePicture ? 'none' : 'flex' }}>
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="text-center">
              <div className="fw-bold" style={{ 
                color: colors.text, 
                fontSize: '0.85rem', 
                marginBottom: '0.2rem',
                lineHeight: '1.1'
              }}>
                {user?.name || 'Campaign Agent'}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: '#8b5cf6',
                fontWeight: '500',
                marginBottom: '0.2rem'
              }}>
                👥 Campaign Agent
              </div>
              <div style={{ 
                fontSize: '0.65rem', 
                color: colors.textSecondary,
                wordBreak: 'break-word',
                lineHeight: '1.1'
              }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div style={{
            marginBottom: '0.75rem',
            padding: '0.75rem',
            background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            borderRadius: '8px',
            border: `1px solid rgba(16, 185, 129, 0.2)`
          }}>
            <div className="text-center">
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#10b981',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                🟢 Agent Active
              </div>
              <div style={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                Managing campaigns & outreach
              </div>
            </div>
          </div>
        
          <nav className="nav flex-column">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link btn btn-link text-start border-0 rounded d-flex align-items-center justify-content-between`}
                  onClick={() => setSidebarOpen(false)}
                  style={{ 
                    textDecoration: 'none',
                    background: active ? colors.primary : 'transparent',
                    color: active ? '#fff' : isDarkMode ? colors.text : '#212529',
                    transition: 'all 0.2s ease',
                    padding: '0.45rem 0.6rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    marginBottom: '0.2rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = isDarkMode ? colors.sidebarHover : '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <IconComponent size={16} />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
          
          {/* Mobile Sidebar Footer */}
          <div
            style={{
              padding: '0.5rem 1.5rem',
              borderTop: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.textMuted,
              fontSize: '0.75rem',
              textAlign: 'center',
              marginTop: 'auto'
            }}
          >
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
      </div>
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-lg-none"
          style={{ background: 'rgba(0,0,0,0.2)', zIndex: 1999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div
        className="d-none d-lg-flex"
        style={{
          width: sidebarCollapsed ? '70px' : '240px',
          background: isDarkMode ? colors.surface : '#fff',
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 0.3s ease',
          position: 'fixed',
          top: '70px', // Offset for fixed header
          left: 0,
          height: 'calc(100vh - 70px)', // Full height minus header
          maxHeight: 'calc(100vh - 70px)',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <div style={{ 
          padding: '0.8rem', 
          flex: 1, 
          overflowY: 'hidden', 
          margin: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Desktop Profile Section (toggle moved to header) */}
          {!isMobile && (
            <div style={{ height: '0.5rem', marginBottom: '0.5rem' }} />
          )}

          {/* User Info - Profile Picture - Desktop Only */}
          {!isMobile && !sidebarCollapsed && (
            <div
              style={{
                marginBottom: '0.8rem',
                padding: '0.8rem',
                background: `linear-gradient(135deg, ${isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)'}, ${isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)'})`,
                borderRadius: '11px',
                border: `1px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`
              }}
            >
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1.8rem',
                    margin: '0 auto 0.8rem',
                    overflow: 'hidden',
                    border: `2.5px solid rgba(139, 92, 246, 0.3)`,
                    boxShadow: '0 3px 10px rgba(139, 92, 246, 0.2)'
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
                  <div className="fw-bold" style={{ 
                    color: colors.text,
                    fontSize: '1rem',
                    marginBottom: '0.2rem'
                  }}>
                    {user?.name || 'Campaign Agent'}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#8b5cf6',
                    fontWeight: '500',
                    marginBottom: '0.2rem'
                  }}>
                    👥 Campaign Agent
                  </div>
                  <div style={{ 
                    fontSize: '0.72rem', 
                    color: colors.textSecondary
                  }}>
                    {user?.email}
                  </div>
                </div>
              </div>
            )}

          {/* Agent Status Card - Desktop Only */}
          {!sidebarCollapsed && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.75rem',
              background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '8px',
              border: `1px solid rgba(16, 185, 129, 0.2)`
            }}>
              <div className="text-center">
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#10b981',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  🟢 Agent Active
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: colors.textSecondary,
                  lineHeight: '1.2'
                }}>
                  Managing campaigns & outreach
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
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
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    gap: sidebarCollapsed ? '0' : '0.5rem',
                    width: '100%',
                    padding: sidebarCollapsed ? '0.5rem' : '0.6rem 0.8rem',
                    marginBottom: '0.4rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    border: 'none',
                    background: active ? colors.primary : 'transparent',
                    color: active ? '#fff' : colors.text,
                    transition: 'all 0.2s',
                    fontSize: '0.85rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = colors.sidebarHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={16} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ 
          padding: '0.75rem 1rem',
          borderTop: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.textMuted,
          fontSize: '0.75rem',
          textAlign: 'center',
          flexShrink: 0
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
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
          overflow: 'hidden',
          width: isMobile ? '100%' : 'auto',
          margin: 0,
          padding: 0,
          marginLeft: window.innerWidth > 992 ? (sidebarCollapsed ? '70px' : '240px') : '0',
          transition: 'margin-left 0.3s ease',
          paddingTop: '70px' // Adjust for fixed header height
        }}
      >
        <AgentHeader
          user={user}
          onLogout={onLogout}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          colors={colors}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        <main
          style={{
            flex: 1,
            overflow: 'auto'
          }}
        >
          <Routes>
            <Route path="/" element={<AgentDashboardMain />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/candidates" element={<AgentCandidates />} />
            <Route path="/outreach" element={<VoterOutreach />} />
            <Route path="/analytics" element={<AgentAnalytics />} />
            <Route path="/materials" element={<CampaignMaterials />} />
            <Route path="/engagement" element={<VoterEngagement />} />
            <Route path="/events" element={<Events />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
