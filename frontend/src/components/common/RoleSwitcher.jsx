import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserGraduate, FaUserTie, FaExchangeAlt, FaChevronDown } from 'react-icons/fa';

/**
 * RoleSwitcher Component
 * Allows users with multiple roles (student + candidate) to switch between dashboards
 * 
 * @param {Object} user - Current user object with role and additionalRoles
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @param {Object} colors - Theme colors object
 */
const RoleSwitcher = ({ user, isDarkMode, colors }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user has candidate role (either primary or additional)
  const hasMultipleRoles = user?.additionalRoles?.includes('candidate') || 
                           (user?.role === 'candidate' && user?.additionalRoles?.includes('student'));

  // Don't render if user doesn't have multiple roles
  if (!hasMultipleRoles) return null;

  // Determine current active role based on current path
  const isInCandidateDashboard = location.pathname.startsWith('/candidate');
  const currentRole = isInCandidateDashboard ? 'candidate' : 'student';

  const handleSwitch = (targetRole) => {
    setIsOpen(false);
    if (targetRole === 'candidate' && !isInCandidateDashboard) {
      navigate('/candidate');
    } else if (targetRole === 'student' && isInCandidateDashboard) {
      navigate('/student-dashboard');
    }
  };

  const dropdownStyle = {
    position: 'relative',
    display: 'inline-block',
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: window.innerWidth < 768 ? '6px' : '8px',
    padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
    borderRadius: window.innerWidth < 768 ? '6px' : '8px',
    border: `1.5px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
    background: isDarkMode 
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' 
      : '#ffffff',
    color: colors?.text || (isDarkMode ? '#fff' : '#1f2937'),
    cursor: 'pointer',
    fontSize: window.innerWidth < 768 ? '12px' : '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    minHeight: '36px',
    boxShadow: isDarkMode 
      ? 'none'
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const menuStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    marginTop: '8px',
    minWidth: window.innerWidth < 768 ? '220px' : '200px',
    maxWidth: window.innerWidth < 400 ? '280px' : 'none',
    borderRadius: window.innerWidth < 768 ? '5px' : '10px',
    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
    background: isDarkMode ? '#1f2937' : '#ffffff',
    boxShadow: isDarkMode 
      ? '0 10px 40px rgba(0,0,0,0.5)' 
      : '0 10px 40px rgba(0,0,0,0.2)',
    zIndex: 1000,
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease',
  };
  

  const menuItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: window.innerWidth < 768 ? '10px' : '12px',
    padding: window.innerWidth < 768 ? '10px 14px' : '12px 16px',
    cursor: isActive ? 'default' : 'pointer',
    background: isActive 
      ? (isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.12)')
      : 'transparent',
    color: isActive 
      ? (isDarkMode ? '#818cf8' : '#4f46e5') 
      : (colors?.text || (isDarkMode ? '#e5e7eb' : '#374151')),
    borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
    transition: 'all 0.2s ease',
    fontSize: window.innerWidth < 768 ? '13px' : '14px',
  });

  const iconContainerStyle = (roleType) => ({
    width: window.innerWidth < 768 ? '32px' : '36px',
    height: window.innerWidth < 768 ? '32px' : '36px',
    borderRadius: window.innerWidth < 768 ? '6px' : '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: roleType === 'student' 
      ? (isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
      : (isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)'),
    color: roleType === 'student' 
      ? (isDarkMode ? '#10b981' : '#059669')
      : (isDarkMode ? '#f59e0b' : '#d97706'),
    fontSize: window.innerWidth < 768 ? '14px' : '16px',
  });

  return (
    <div style={dropdownStyle}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .role-switcher-btn:hover {
            transform: translateY(-1px);
            box-shadow: ${isDarkMode 
              ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
              : '0 4px 16px rgba(99, 102, 241, 0.25)'};
            border-color: ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(99, 102, 241, 0.5)'};
          }
          .role-menu-item:hover {
            background: ${isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)'} !important;
          }
        `}
      </style>
      
      <button 
        className="role-switcher-btn"
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
        title="Switch between Student and Candidate view"
      >
        <FaExchangeAlt style={{ fontSize: window.innerWidth < 768 ? '12px' : '14px', color: '#6366f1' }} />
        <span style={{ display: window.innerWidth < 400 ? 'none' : 'inline' }}>
          {currentRole === 'student' ? 'Student' : 'Candidate'}
        </span>
        <FaChevronDown 
          style={{ 
            fontSize: window.innerWidth < 768 ? '10px' : '12px', 
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
          
          <div style={menuStyle}>
            <div style={{ 
              padding: window.innerWidth < 768 ? '10px 14px' : '12px 16px', 
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
              background: isDarkMode ? 'transparent' : 'rgba(99, 102, 241, 0.02)'
            }}>
              <div style={{ 
                fontSize: window.innerWidth < 768 ? '11px' : '12px', 
                color: isDarkMode ? '#9ca3af' : '#6b7280', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                fontWeight: '600'
              }}>
                Switch View
              </div>
              <div style={{ 
                fontSize: window.innerWidth < 768 ? '13px' : '14px', 
                fontWeight: '600', 
                color: colors?.text || (isDarkMode ? '#fff' : '#111827'), 
                marginTop: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.name || 'User'}
              </div>
            </div>
            
            <div
              className="role-menu-item"
              style={menuItemStyle(currentRole === 'student')}
              onClick={() => handleSwitch('student')}
            >
              <div style={iconContainerStyle('student')}>
                <FaUserGraduate />
              </div>
              <div>
                <div style={{ fontWeight: '500' }}>Student View</div>
                <div style={{ 
                  fontSize: window.innerWidth < 768 ? '11px' : '12px', 
                  color: isDarkMode ? '#9ca3af' : '#6b7280' 
                }}>
                  Vote & view elections
                </div>
              </div>
              {currentRole === 'student' && (
                <div style={{ marginLeft: 'auto', fontSize: '10px', background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                  Active
                </div>
              )}
            </div>
            
            <div
              className="role-menu-item"
              style={menuItemStyle(currentRole === 'candidate')}
              onClick={() => handleSwitch('candidate')}
            >
              <div style={iconContainerStyle('candidate')}>
                <FaUserTie />
              </div>
              <div>
                <div style={{ fontWeight: '500' }}>Candidate View</div>
                <div style={{ 
                  fontSize: window.innerWidth < 768 ? '11px' : '12px', 
                  color: isDarkMode ? '#9ca3af' : '#6b7280' 
                }}>
                  Manage your campaign
                </div>
              </div>
              {currentRole === 'candidate' && (
                <div style={{ marginLeft: 'auto', fontSize: '10px', background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                  Active
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;
