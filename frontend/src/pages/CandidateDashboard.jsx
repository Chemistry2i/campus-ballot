import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Swal from 'sweetalert2';
import {
  FaHome,
  FaUser,
  FaChartLine,
  FaUsers,
  FaImages,
  FaComments,
  FaBars,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaBookOpen,
  FaTasks
} from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';

// Import candidate components  
import Loader from '../components/common/Loader';
import ErrorBoundary from '../components/common/ErrorBoundary';
import RoleSwitcher from '../components/common/RoleSwitcher';

// Lazy load components for better performance
const CandidacyDashboard = React.lazy(() => import('../components/candidacy/CandidacyDashboard'));
const CampaignProfile = React.lazy(() => import('../components/candidacy/CampaignProfile'));
const ElectionStats = React.lazy(() => import('../components/candidacy/ElectionStats'));
const AgentManagement = React.lazy(() => import('../components/candidacy/AgentManagement'));
const CampaignMaterials = React.lazy(() => import('../components/candidacy/CampaignMaterials'));
const VoterEngagement = React.lazy(() => import('../components/candidacy/VoterEngagement'));
const TaskManagement = React.lazy(() => import('../components/candidacy/TaskManagement'));

const CandidateDashboard = ({ user, onLogout }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // const navigate = useNavigate(); // Removed unused variable

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to logout from your candidate dashboard?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      background: colors.surface,
      color: colors.text,
      customClass: {
        popup: 'swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    });

    if (result.isConfirmed) {
      onLogout();
    }
  };

  const menuItems = [
    { path: '/candidate', icon: FaHome, label: 'Dashboard', exact: true },
    { path: '/candidate/stats', icon: FaChartLine, label: 'Statistics' },
    { path: '/candidate/agents', icon: FaUsers, label: 'Agents' },
    { path: '/candidate/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/candidate/materials', icon: FaImages, label: 'Materials' },
    { path: '/candidate/engagement', icon: FaComments, label: 'Engagement' },
    { path: '/candidate/profile', icon: FaUser, label: 'Profile' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw',
      background: colors.background,
      overflow: 'hidden'
    }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: isMobile ? 'block' : 'none'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        style={{
          width: isMobile ? (sidebarOpen ? '320px' : '0') : (sidebarOpen ? '280px' : '0'),
          background: isDarkMode ? colors.surface : '#fff',
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          left: 0,
          top: 0
        }}
      >
        <div style={{ padding: '1.5rem' }}>
          <div className="d-flex align-items-center justify-content-end" style={{ marginBottom: '1rem' }}>
            <button
              className="btn btn-sm"
              onClick={() => setSidebarOpen(false)}
              style={{ 
                color: colors.text,
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${colors.border}`,
                borderRadius: '5px',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IoCloseOutline size={24} strokeWidth={1} />
            </button>
          </div>

          {/* Candidate Profile */}
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: '12px',
            border: `1px solid rgba(59, 130, 246, 0.2)`
          }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '2rem',
                margin: '0 auto 1rem',
                overflow: 'hidden',
                border: '3px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
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
                {user?.name?.charAt(0) || 'C'}
              </span>
            </div>
            <div className="text-center">
              <div className="fw-bold" style={{ 
                color: colors.text, 
                fontSize: '1.1rem', 
                marginBottom: '0.25rem',
                lineHeight: '1.2'
              }}>
                {user?.name || 'Candidate'}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#3b82f6',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>
                🏆 Candidate
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: colors.textSecondary,
                wordBreak: 'break-word',
                lineHeight: '1.2'
              }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Campaign Status */}
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
                🟢 Campaign Active
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: colors.textSecondary,
                lineHeight: '1.2'
              }}>
                Ready to connect with voters
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: colors.text,
                  background: window.location.pathname === item.path
                    ? colors.primary
                    : 'transparent',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => {
                  if (window.location.pathname !== item.path) {
                    e.currentTarget.style.background = colors.sidebarHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.location.pathname !== item.path) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <item.icon className="me-2" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div style={{ 
            padding: '1rem 1.5rem',
            marginTop: 'auto',
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
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          width: '100%',
          marginLeft: isMobile ? '0' : (sidebarOpen ? '280px' : '0'),
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          overflow: 'auto'
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            background: isDarkMode ? colors.surface : '#fff',
            borderBottom: `1px solid ${colors.border}`,
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
            <button
              className="btn btn-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ 
                color: colors.text,
                padding: '0.5rem'
              }}
            >
              <FaBars size={20} />
            </button>
            <h5 className="mb-0 d-none d-md-block" style={{ color: colors.text, fontSize: '1.25rem' }}>
              Campaign Management
            </h5>
            <h6 className="mb-0 d-md-none" style={{ color: colors.text }}>
              Campaign
            </h6>
          </div>
          
          <div className="d-flex align-items-center" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Welcome message - hide on very small screens */}
            <span className="d-none d-sm-inline" style={{ 
              color: colors.text, 
              fontSize: '0.9rem',
              whiteSpace: 'nowrap'
            }}>
              Welcome, {user?.name?.split(' ')[0] || 'Candidate'}!
            </span>

            {/* Role Switcher (only shows for student-candidates) */}
            <RoleSwitcher user={user} isDarkMode={isDarkMode} colors={colors} />
            
            {/* Dark mode toggle */}
            <button
              className="btn btn-sm"
              onClick={toggleTheme}
              style={{
                background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                color: isDarkMode ? '#f59e0b' : '#3b82f6',
                border: `1px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                minHeight: '36px'
              }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';
              }}
            >
              {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
              <span className="d-none d-sm-inline">
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>
            
            {/* User avatar with dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: user?.profilePicture ? 'transparent' : '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: 'pointer',
                  border: showUserMenu ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                title="Click for options"
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
                  {user?.name?.charAt(0) || 'C'}
                </span>
              </div>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Overlay to close menu */}
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 998
                    }}
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '180px',
                      background: isDarkMode ? colors.surface : '#fff',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '10px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      zIndex: 999,
                      overflow: 'hidden',
                      padding: '0.5rem'
                    }}
                  >
                    {/* View Profile Link */}
                    <Link
                      to="/candidate/profile"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        padding: '0.6rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        color: colors.text,
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = colors.sidebarHover}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <FaUser size={14} style={{ color: '#3b82f6' }} />
                      <span>View Profile</span>
                    </Link>

                    <div style={{ height: '1px', background: colors.border, margin: '0.25rem 0' }} />

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        color: '#dc3545',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <FaSignOutAlt size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Routes */}
        <div style={{ 
          padding: '1.5rem',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          <ErrorBoundary>
            <Suspense fallback={
              <div style={{ 
                minHeight: '60vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Loader message="Loading page..." size="medium" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<CandidacyDashboard />} />
                <Route path="/profile" element={<CampaignProfile />} />
                <Route path="/stats/:id" element={<ElectionStats />} />
                <Route path="/stats" element={<ElectionStats />} />
                <Route path="/agents" element={<AgentManagement />} />
                <Route path="/tasks" element={<TaskManagement />} />
                <Route path="/materials" element={<CampaignMaterials />} />
                <Route path="/engagement" element={<VoterEngagement />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
