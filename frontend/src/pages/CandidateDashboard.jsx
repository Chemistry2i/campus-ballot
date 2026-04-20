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
  FaTasks,
  FaTimes
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

  useEffect(() => {
    if (sidebarOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

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
      flexDirection: 'column',
      minHeight: '100vh', 
      width: '100vw',
      background: colors.background,
      overflow: 'hidden'
    }}>
      {/* Header - spans full width at top */}
      <div
        style={{
          background: isDarkMode ? colors.surface : '#fff',
          borderBottom: `1px solid ${colors.border}`,
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1100,
          gap: '1rem',
          flexWrap: 'wrap',
          flexShrink: 0
        }}
      >
        <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
          <button
            className="btn btn-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ 
              color: colors.text,
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
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
              background: isDarkMode ? `rgba(${parseInt(colors.primary.slice(1,3),16)}, ${parseInt(colors.primary.slice(3,5),16)}, ${parseInt(colors.primary.slice(5,7),16)}, 0.1)` : `rgba(${parseInt(colors.primary.slice(1,3),16)}, ${parseInt(colors.primary.slice(3,5),16)}, ${parseInt(colors.primary.slice(5,7),16)}, 0.1)`,
              color: colors.primary,
              border: `1px solid ${colors.border}`,
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
              e.currentTarget.style.background = `${colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? `${colors.primary}15` : `${colors.primary}10`;
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
                background: user?.profilePicture ? 'transparent' : colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1rem',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer',
                border: showUserMenu ? `2px solid ${colors.primary}` : '2px solid transparent',
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
                    <FaUser size={14} style={{ color: colors.primary }} />
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
                      color: '#ef4444',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
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

      {/* Content Area - Sidebar + Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', marginLeft: sidebarOpen ? '240px' : '0', marginTop: '60px', transition: 'margin-left 0.3s ease, margin-top 0.3s ease' }}>
        {/* Mobile Sidebar */}
        <div
          style={{
            position: 'fixed',
            left: '0px',
            top: '0px',
            width: '80vw',
            maxWidth: '320px',
            // height: 'calc(100vh - 60px)',
            height: '100vh',
            zIndex: 2000,
            transition: 'transform 0.3s',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: sidebarOpen ? '2px 0 16px rgba(0,0,0,0.08)' : 'none',
            background: isDarkMode ? colors.surface : '#fff',
            borderRight: `1px solid ${colors.border}`
          }}
          className="d-lg-none"
        >
        <div className="p-3" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-uppercase small fw-bold mb-0" style={{ color: colors.textSecondary }}>Navigation</h6>
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={() => setSidebarOpen(false)} 
              aria-label="Close sidebar menu"
              style={{
                borderColor: colors.border,
                color: colors.text,
                background: 'transparent'
              }}
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Enhanced Profile Section */}
          <div style={{
            marginBottom: '0.75rem',
            padding: '0.75rem',
            background: isDarkMode ? `${colors.primary}20` : `${colors.primary}10`,
            borderRadius: '8px',
            border: `1px solid ${colors.primary}40`
          }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: user?.profilePicture ? 'transparent' : colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.3rem',
                margin: '0 auto 0.5rem',
                overflow: 'hidden',
                border: `2px solid ${colors.primary}60`,
                boxShadow: `0 2px 8px ${colors.primary}30`
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
                fontSize: '0.85rem', 
                marginBottom: '0.2rem',
                lineHeight: '1.1'
              }}>
                {user?.name || 'Candidate'}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: colors.primary,
                fontWeight: '500',
                marginBottom: '0.2rem'
              }}>
                🏆 Candidate
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
            background: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            border: `1px solid rgba(34, 197, 94, 0.3)`
          }}>
            <div className="text-center">
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#22c55e',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                🟢 Campaign Active
              </div>
              <div style={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                Ready to connect with voters
              </div>
            </div>
          </div>
        
          <nav className="nav flex-column" style={{ flex: 1 }}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link btn btn-link text-start border-0 rounded d-flex align-items-center justify-content-between`}
                  onClick={() => setSidebarOpen(false)}
                  style={{ 
                    textDecoration: 'none',
                    background: window.location.pathname === item.path ? colors.primary : 'transparent',
                    color: window.location.pathname === item.path ? '#fff' : colors.text,
                    transition: 'all 0.2s ease',
                    padding: '0.45rem 0.6rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    marginBottom: '0.2rem'
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
              padding: '0.5rem 0',
              borderTop: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.textSecondary,
              fontSize: '0.75rem',
              textAlign: 'center',
              marginTop: 'auto',
              flexShrink: 0
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
                color: '#ef4444',
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
          style={{ 
            position: 'fixed',
            background: 'rgba(0,0,0,0.2)', 
            zIndex: 1999,
            top: '0px',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'none'
          }}
          className="d-lg-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}  
      <div
        className="d-none d-lg-flex"
        style={{
          position: 'fixed',
          left: 0,
          top: '60px',
          width: sidebarOpen ? '240px' : '0',
          height: 'calc(100vh - 60px)',
          background: isDarkMode ? colors.surface : '#fff',
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: 1000
        }}
      >
        <div style={{ 
          padding: '0.8rem',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Candidate Profile */}
          <div style={{
            marginBottom: '0.9rem',
            padding: '0.85rem',
            background: isDarkMode ? `${colors.primary}20` : `${colors.primary}10`,
            borderRadius: '11px',
            border: `1px solid ${colors.primary}40`
          }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: user?.profilePicture ? 'transparent' : colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.8rem',
                margin: '0 auto 0.8rem', 
                overflow: 'hidden',
                border: `2.5px solid ${colors.primary}60`,
                boxShadow: `0 3px 10px ${colors.primary}30`
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
                fontSize: '1rem', 
                marginBottom: '0.2rem',
                lineHeight: '1.2'
              }}>
                {user?.name || 'Candidate'}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: colors.primary,
                fontWeight: '500',
                marginBottom: '0.2rem'
              }}>
                🏆 Candidate
              </div>
              <div style={{ 
                fontSize: '0.72rem', 
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
            background: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            border: `1px solid rgba(34, 197, 94, 0.3)`
          }}>
            <div className="text-center">
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#22c55e',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                🟢 Campaign Active
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: colors.textSecondary
              }}>
                Ready to connect with voters
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav style={{ flex: 1 }}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  marginBottom: '0.75rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: 'none',
                  background: window.location.pathname === item.path ? colors.primary : 'transparent',
                  color: window.location.pathname === item.path ? '#fff' : colors.text,
                  transition: 'all 0.2s',
                  fontSize: '0.85rem'
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
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <item.icon size={16} />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div style={{ 
            padding: '1rem 1.5rem',
            borderTop: `1px solid ${colors.border}`,
            background: colors.surface,
            color: colors.textSecondary,
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
                color: '#ef4444',
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
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Routes */}
        <div style={{ 
          padding: isMobile ? '0.75rem' : '1.5rem',
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto',
          boxSizing: 'border-box',
          flex: 1
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
      {/* Close Content Area */}
      </div>
    </div>
  );
};

export default CandidateDashboard;
