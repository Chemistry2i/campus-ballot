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
  FaTimes,
  FaSignOutAlt,
  FaMoon,
  FaSun
} from 'react-icons/fa';

// Import candidate components  
import Loader from '../components/common/Loader';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy load components for better performance
const CandidacyDashboard = React.lazy(() => import('../components/candidacy/CandidacyDashboard'));
const CampaignProfile = React.lazy(() => import('../components/candidacy/CampaignProfile'));
const ElectionStats = React.lazy(() => import('../components/candidacy/ElectionStats'));
const AgentManagement = React.lazy(() => import('../components/candidacy/AgentManagement'));
const CampaignMaterials = React.lazy(() => import('../components/candidacy/CampaignMaterials'));
const VoterEngagement = React.lazy(() => import('../components/candidacy/VoterEngagement'));

const CandidateDashboard = ({ user, onLogout }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-bold mb-0" style={{ color: colors.text, fontSize: '0.9rem' }}>
              Candidate Portal
            </h6>
            <button
              className="btn btn-sm"
              onClick={() => setSidebarOpen(false)}
              style={{ color: colors.text }}
            >
              <FaTimes />
            </button>
          </div>

          {/* User Info */}
          <div className="mb-3 p-2">
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: user?.profilePicture ? 'transparent' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                margin: '0 auto 0.5rem',
                overflow: 'hidden',
                border: `2px solid ${colors.border}`
              }}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/uploads/${user.profilePicture}`} 
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
              <div className="fw-semibold small" style={{ color: colors.text }}>
                {user?.name || 'Candidate'}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>{user?.email}</div>
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
                  fontSize: isMobile ? '1rem' : '0.875rem'
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
          <div className="mt-auto p-3" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: user?.profilePicture ? 'transparent' : '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  border: `1px solid ${colors.border}`
                }}
              >
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/uploads/${user.profilePicture}`} 
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
              <div>
                <div className="fw-semibold" style={{ color: colors.text, fontSize: '0.8rem' }}>{user?.name}</div>
                <div style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>{user?.role}</div>
              </div>
            </div>
            <div className="mb-3" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>
              Status: Online • Campaign Active
            </div>
            <button
              className="btn btn-sm w-100"
              onClick={handleLogout}
              style={{
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#c82333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dc3545';
              }}
            >
              <FaSignOutAlt className="me-2" />
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
            width: '100%'
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ color: colors.text }}
            >
              <FaBars size={20} />
            </button>
            <h5 className="mb-0 d-none d-md-block" style={{ color: colors.text }}>
              Campaign Management
            </h5>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            {/* Welcome message */}
            <span style={{ color: colors.text, fontSize: '0.9rem' }}>
              Welcome, {user?.name?.split(' ')[0] || 'Candidate'}!
            </span>
            
            {/* Dark mode toggle */}
            <button
              className="btn btn-sm"
              onClick={toggleTheme}
              style={{
                background: colors.surfaceHover,
                color: colors.text,
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>
            
            {/* User avatar */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user?.profilePicture ? 'transparent' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                overflow: 'hidden'
              }}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/uploads/${user.profilePicture}`} 
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
          </div>
        </div>

        {/* Routes */}
        <div style={{ 
          padding: isMobile ? '1rem' : '1.5rem',
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
