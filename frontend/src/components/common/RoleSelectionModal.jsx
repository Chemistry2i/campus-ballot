import React from 'react';
import { FaUserGraduate, FaUserTie, FaUsers, FaTimes } from 'react-icons/fa';

/**
 * RoleSelectionModal Component
 * Shows after login when user has multiple roles (student + candidate)
 * Allows them to choose which dashboard to enter
 * 
 * @param {Object} user - User object with name and roles
 * @param {Function} onSelectRole - Callback when role is selected
 * @param {Function} onClose - Callback to close modal (optional)
 */
const RoleSelectionModal = ({ user, onSelectRole, onClose }) => {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.3s ease',
  };

  const modalStyle = {
    background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
    borderRadius: '10px',
    padding: window.innerWidth < 768 ? '24px 20px' : '40px',
    maxWidth: '480px',
    width: window.innerWidth < 768 ? '95%' : '90%',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideUp 0.4s ease',
    position: 'relative',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '32px',
  };

  const titleStyle = {
    fontSize: window.innerWidth < 768 ? '20px' : '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
  };

  const subtitleStyle = {
    fontSize: window.innerWidth < 768 ? '14px' : '15px',
    color: '#6b7280',
    lineHeight: '1.5',
  };

  const cardsContainerStyle = {
    display: 'flex',
    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
    gap: window.innerWidth < 768 ? '12px' : '16px',
    marginBottom: window.innerWidth < 768 ? '20px' : '24px',
  };

  const cardStyle = (type) => ({
    flex: 1,
    padding: window.innerWidth < 768 ? '20px 16px' : '24px 20px',
    borderRadius: '10px',
    border: '2px solid transparent',
    background: type === 'student' 
      ? 'linear-gradient(145deg, #ecfdf5, #d1fae5)' 
      : 'linear-gradient(145deg, #fffbeb, #fef3c7)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    minHeight: window.innerWidth < 768 ? '120px' : 'auto',
  });

  const iconContainerStyle = (type) => ({
    width: window.innerWidth < 768 ? '56px' : '64px',
    height: window.innerWidth < 768 ? '56px' : '64px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: window.innerWidth < 768 ? '0 auto 12px' : '0 auto 16px',
    background: type === 'student' ? '#10b981' : '#f59e0b',
    color: '#ffffff',
    fontSize: window.innerWidth < 768 ? '24px' : '28px',
    boxShadow: type === 'student' 
      ? '0 8px 24px rgba(16, 185, 129, 0.4)' 
      : '0 8px 24px rgba(245, 158, 11, 0.4)',
  });

  const cardTitleStyle = {
    fontSize: window.innerWidth < 768 ? '16px' : '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: window.innerWidth < 768 ? '6px' : '8px',
  };

  const cardDescStyle = {
    fontSize: window.innerWidth < 768 ? '12px' : '13px',
    color: '#6b7280',
    lineHeight: '1.4',
  };

  const noteStyle = {
    textAlign: 'center',
    fontSize: window.innerWidth < 768 ? '12px' : '13px',
    color: '#9ca3af',
    padding: window.innerWidth < 768 ? '12px' : '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #e5e7eb',
  };

  return (
    <div style={overlayStyle}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .role-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
            border-color: #6366f1 !important;
          }
          .role-card:active {
            transform: translateY(-2px);
          }
        `}
      </style>
      
      <div style={modalStyle}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: window.innerWidth < 768 ? '12px' : '16px',
              right: window.innerWidth < 768 ? '12px' : '16px',
              background: 'none',
              border: 'none',
              fontSize: window.innerWidth < 768 ? '18px' : '20px',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: window.innerWidth < 768 ? '6px' : '8px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
          >
            <FaTimes />
          </button>
        )}
        
        <div style={headerStyle}>
          <div style={{ fontSize: window.innerWidth < 768 ? '36px' : '48px', marginBottom: window.innerWidth < 768 ? '12px' : '16px' }}>🎉</div>
          <h2 style={titleStyle}>Welcome back, {user?.name?.split(' ')[0] || 'Champion'}!</h2>
          <p style={subtitleStyle}>
            {user?.additionalRoles?.includes('candidate') && user?.additionalRoles?.includes('agent') 
              ? "You have multiple roles. Choose how you'd like to continue:" 
              : user?.additionalRoles?.includes('candidate') 
              ? "You're registered as a candidate. Choose how you'd like to continue:" 
              : "You're registered as an agent. Choose how you'd like to continue:"}
          </p>
        </div>

        <div style={cardsContainerStyle}>
          <div 
            className="role-card"
            style={cardStyle('student')}
            onClick={() => onSelectRole('student')}
          >
            <div style={iconContainerStyle('student')}>
              <FaUserGraduate />
            </div>
            <div style={cardTitleStyle}>Student Dashboard</div>
            <div style={cardDescStyle}>
              View elections, cast your vote, and track results
            </div>
          </div>

          {user?.additionalRoles?.includes('agent') && (
            <div 
              className="role-card"
              style={{...cardStyle('agent'), background: 'linear-gradient(145deg, #f5f3ff, #ede9fe)'}}
              onClick={() => onSelectRole('agent')}
            >
              <div style={{...iconContainerStyle('agent'), background: '#8b5cf6', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'}}>
                <FaUsers />
              </div>
              <div style={cardTitleStyle}>Agent Dashboard</div>
              <div style={cardDescStyle}>
                Support candidate campaigns and voter outreach
              </div>
            </div>
          )}

          {user?.additionalRoles?.includes('candidate') && (
            <div 
              className="role-card"
              style={cardStyle('candidate')}
              onClick={() => onSelectRole('candidate')}
            >
              <div style={iconContainerStyle('candidate')}>
                <FaUserTie />
              </div>
              <div style={cardTitleStyle}>Candidate Dashboard</div>
              <div style={cardDescStyle}>
                Manage your campaign, agents, and view statistics
              </div>
            </div>
          )}
        </div>

        <div style={noteStyle}>
          💡 <strong>Tip:</strong> You can switch between dashboards anytime using the role switcher in the navigation bar.
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
