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
        <div style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
          <div className="d-flex align-items-center justify-content-end" style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}>
            <button
              className="btn btn-sm"
              onClick={() => setSidebarOpen(false)}
              style={{ 
                color: colors.text,
                background: 'transparent',
                border: 'none',
                borderRadius: '50%',
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '28px' : '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes size={isMobile ? 14 : 16} />
            </button>
          </div>

          {/* Candidate Profile */}
          <div style={{
            marginBottom: isMobile ? '0.75rem' : '1rem',
            padding: isMobile ? '0.75rem' : '1rem',
            background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: isMobile ? '8px' : '12px',
            border: `1px solid rgba(59, 130, 246, 0.2)`
          }}>
            <div
              style={{
                width: isMobile ? '60px' : '80px',
                height: isMobile ? '60px' : '80px',
                borderRadius: '50%',
                background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: isMobile ? '1.5rem' : '2rem',
                margin: `0 auto ${isMobile ? '0.75rem' : '1rem'}`,
                overflow: 'hidden',
                border: `${isMobile ? '2px' : '3px'} solid rgba(59, 130, 246, 0.3)`,
                boxShadow: isMobile ? '0 2px 8px rgba(59, 130, 246, 0.15)' : '0 4px 12px rgba(59, 130, 246, 0.2)'
              }}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `/uploads/${user.profilePicture}`} 
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
                fontSize: isMobile ? '0.95rem' : '1.1rem', 
                marginBottom: '0.25rem',
                lineHeight: '1.2'
              }}>
                {user?.name || 'Candidate'}
              </div>
              <div style={{ 
                fontSize: isMobile ? '0.75rem' : '0.85rem', 
                color: '#3b82f6',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>
                🏆 Candidate
              </div>
              <div style={{ 
                fontSize: isMobile ? '0.7rem' : '0.75rem', 
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
            marginBottom: isMobile ? '0.5rem' : '0.75rem',
            padding: isMobile ? '0.5rem' : '0.75rem',
            background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            borderRadius: isMobile ? '6px' : '8px',
            border: `1px solid rgba(16, 185, 129, 0.2)`
          }}>
            <div className="text-center">
              <div style={{ 
                fontSize: isMobile ? '0.7rem' : '0.75rem', 
                color: '#10b981',
                fontWeight: '600',
                marginBottom: isMobile ? '0.125rem' : '0.25rem'
              }}>
                🟢 Campaign Active
              </div>
              <div style={{ 
                fontSize: isMobile ? '0.65rem' : '0.7rem', 
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
                  padding: isMobile ? '0.6rem 0.75rem' : '0.75rem 1rem',
                  marginBottom: isMobile ? '0.25rem' : '0.5rem',
                  borderRadius: isMobile ? '6px' : '8px',
                  textDecoration: 'none',
                  color: colors.text,
                  background: window.location.pathname === item.path
                    ? colors.primary
                    : 'transparent',
                  transition: 'all 0.2s',
                  fontSize: isMobile ? '0.875rem' : '0.875rem'
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
            marginTop: isMobile ? '0.75rem' : '1rem', 
            paddingTop: isMobile ? '0.75rem' : '1rem', 
            borderTop: `1px solid ${colors.border}` 
          }}>
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '0.25rem' : '0.5rem', 
              marginBottom: isMobile ? '0.5rem' : '0.75rem' 
            }}>
              <button
                className="btn btn-sm flex-fill"
                onClick={toggleTheme}
                style={{
                  background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: isDarkMode ? '#f59e0b' : '#3b82f6',
                  border: `1px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: isMobile ? '4px' : '6px',
                  padding: isMobile ? '0.4rem 0.25rem' : '0.5rem',
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  fontWeight: '500'
                }}
              >
                {isDarkMode ? <FaSun size={isMobile ? 12 : 14} className="me-1" /> : <FaMoon size={isMobile ? 12 : 14} className="me-1" />}
                {isMobile ? (isDarkMode ? 'Light' : 'Dark') : (isDarkMode ? 'Light' : 'Dark')}
              </button>
              <button
                className="btn btn-sm flex-fill"
                onClick={handleLogout}
                style={{
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  borderRadius: isMobile ? '4px' : '6px',
                  padding: isMobile ? '0.4rem 0.25rem' : '0.5rem',
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)';
                  e.currentTarget.style.color = '#dc3545';
                }}
              >
                <FaSignOutAlt size={isMobile ? 10 : 12} className="me-1" />
                Logout
              </button>
            </div>
            <div className="text-center" style={{ 
              color: colors.textMuted, 
              fontSize: isMobile ? '0.65rem' : '0.7rem',
              lineHeight: '1.2'
            }}>
              Campus Ballot{isMobile ? '' : ' • Candidate Portal'}
            </div>
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
                transition: 'all 0.2s ease'
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
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `https://api.campusballot.tech/uploads/${user.profilePicture}`} 
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
