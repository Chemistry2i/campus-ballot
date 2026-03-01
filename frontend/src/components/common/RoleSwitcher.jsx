import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserGraduate, FaUserTie, FaUsers, FaExchangeAlt, FaChevronDown } from 'react-icons/fa';

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

  // Check if user has multiple roles (student + candidate/agent)
  const hasMultipleRoles = user?.additionalRoles?.includes('candidate') || 
                           user?.additionalRoles?.includes('agent') ||
                           (user?.role === 'candidate' && user?.additionalRoles?.includes('student')) ||
                           (user?.role === 'agent' && user?.additionalRoles?.includes('student'));

  // Don't render if user doesn't have multiple roles
  if (!hasMultipleRoles) return null;

  // Determine current active role based on current path
  const isInCandidateDashboard = location.pathname.startsWith('/candidate');
  const isInAgentDashboard = location.pathname.startsWith('/agent');
  const currentRole = isInCandidateDashboard ? 'candidate' : isInAgentDashboard ? 'agent' : 'student';

  // Get available roles
  const availableRoles = ['student'];
  if (user?.additionalRoles?.includes('candidate') || user?.role === 'candidate') {
    availableRoles.push('candidate');
  }
  if (user?.additionalRoles?.includes('agent') || user?.role === 'agent') {
    availableRoles.push('agent');
  }

  const handleSwitch = (targetRole) => {
    setIsOpen(false);
    if (targetRole === 'candidate' && currentRole !== 'candidate') {
      navigate('/candidate');
    } else if (targetRole === 'agent' && currentRole !== 'agent') {
      navigate('/agent');
    } else if (targetRole === 'student' && currentRole !== 'student') {
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
    gap: window.innerWidth < 768 ? '6px' : '6px',
    padding: window.innerWidth < 768 ? '6px 12px' : '5px 10px',
    borderRadius: window.innerWidth < 768 ? '6px' : '6px',
    border: `1.5px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
    background: isDarkMode 
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' 
      : '#ffffff',
    color: colors?.text || (isDarkMode ? '#fff' : '#1f2937'),
    cursor: 'pointer',
    fontSize: window.innerWidth < 768 ? '12px' : '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    minHeight: window.innerWidth < 768 ? '36px' : '28px',
    boxShadow: isDarkMode 
      ? 'none'
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const menuStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    marginTop: '6px',
    minWidth: window.innerWidth < 768 ? '180px' : '140px',
    maxWidth: window.innerWidth < 400 ? '220px' : 'none',
    borderRadius: window.innerWidth < 768 ? '5px' : '6px',
    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
    background: isDarkMode ? '#1f2937' : '#ffffff',
    boxShadow: isDarkMode 
      ? '0 8px 24px rgba(0,0,0,0.4)' 
      : '0 8px 24px rgba(0,0,0,0.15)',
    zIndex: 1000,
    overflow: 'hidden',
    animation: 'fadeIn 0.15s ease',
  };
  

  const menuItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: window.innerWidth < 768 ? '10px' : '8px',
    padding: window.innerWidth < 768 ? '10px 14px' : '8px 12px',
    cursor: isActive ? 'default' : 'pointer',
    background: isActive 
      ? (isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.12)')
      : 'transparent',
    color: isActive 
      ? (isDarkMode ? '#818cf8' : '#4f46e5') 
      : (colors?.text || (isDarkMode ? '#e5e7eb' : '#374151')),
    borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
    transition: 'all 0.2s ease',
    fontSize: window.innerWidth < 768 ? '13px' : '12px',
  });

  const iconContainerStyle = (roleType) => ({
    width: window.innerWidth < 768 ? '32px' : '28px',
    height: window.innerWidth < 768 ? '32px' : '28px',
    borderRadius: window.innerWidth < 768 ? '6px' : '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: roleType === 'student' 
      ? (isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
      : (isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)'),
    color: roleType === 'student' 
      ? (isDarkMode ? '#10b981' : '#059669')
      : (isDarkMode ? '#f59e0b' : '#d97706'),
    fontSize: window.innerWidth < 768 ? '14px' : '13px',
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
        title="Switch role"
      >
        <FaExchangeAlt style={{ fontSize: window.innerWidth < 768 ? '12px' : '11px', color: '#6366f1' }} />
        <span style={{ display: window.innerWidth < 400 ? 'none' : 'inline' }}>
          {currentRole === 'student' ? 'Student' : currentRole === 'candidate' ? 'Candidate' : 'Agent'}
        </span>
        <FaChevronDown 
          style={{ 
            fontSize: window.innerWidth < 768 ? '10px' : '9px', 
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
            <div
              className="role-menu-item"
              style={menuItemStyle(currentRole === 'student')}
              onClick={() => handleSwitch('student')}
            >
              <div style={iconContainerStyle('student')}>
                <FaUserGraduate />
              </div>
              <div style={{ fontWeight: '500' }}>Student</div>
              {currentRole === 'student' && (
                <div style={{ marginLeft: 'auto', fontSize: '9px', background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '8px' }}>
                  Active
                </div>
              )}
            </div>
            
            {availableRoles.includes('candidate') && (
              <div
                className="role-menu-item"
                style={menuItemStyle(currentRole === 'candidate')}
                onClick={() => handleSwitch('candidate')}
              >
                <div style={iconContainerStyle('candidate')}>
                  <FaUserTie />
                </div>
                <div style={{ fontWeight: '500' }}>Candidate</div>
                {currentRole === 'candidate' && (
                  <div style={{ marginLeft: 'auto', fontSize: '9px', background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: '8px' }}>
                    Active
                  </div>
                )}
              </div>
            )}
            
            {availableRoles.includes('agent') && (
              <div
                className="role-menu-item"
                style={menuItemStyle(currentRole === 'agent')}
                onClick={() => handleSwitch('agent')}
              >
                <div style={{...iconContainerStyle('agent'), background: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)', color: isDarkMode ? '#a78bfa' : '#7c3aed'}}>
                  <FaUsers />
                </div>
                <div style={{ fontWeight: '500' }}>Agent</div>
                {currentRole === 'agent' && (
                  <div style={{ marginLeft: 'auto', fontSize: '9px', background: '#8b5cf6', color: '#fff', padding: '2px 6px', borderRadius: '8px' }}>
                    Active
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;
