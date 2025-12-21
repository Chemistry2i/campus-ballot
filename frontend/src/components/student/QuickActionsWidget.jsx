import React, { useState } from 'react';
import { FaBolt, FaVoteYea, FaHistory, FaBell, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const QuickActionsWidget = ({ activeElections, onNavigate, onVote }) => {
  const { isDarkMode, colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (activeElections.length === 0) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="btn btn-primary rounded-circle shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          border: 'none',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(45deg)' : 'scale(1)';
        }}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBolt size={24} />}
      </button>

      {/* Quick Actions Menu */}
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '24px',
              background: isDarkMode ? colors.surface : '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              padding: '16px',
              zIndex: 999,
              minWidth: '280px',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <h6 className="fw-bold mb-3" style={{ color: isDarkMode ? colors.text : '#212529' }}>
              Quick Actions
            </h6>
            
            {activeElections.slice(0, 3).map((election) => (
              <button
                key={election._id}
                className="btn btn-outline-primary w-100 mb-2 text-start d-flex align-items-center gap-2"
                onClick={() => {
                  onVote(election);
                  setIsOpen(false);
                }}
                style={{
                  borderColor: isDarkMode ? colors.border : '#dee2e6',
                  color: isDarkMode ? colors.text : '#212529'
                }}
              >
                <FaVoteYea />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div className="small fw-semibold text-truncate">{election.title}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Vote Now</div>
                </div>
              </button>
            ))}

            <hr style={{ borderColor: isDarkMode ? colors.border : '#e9ecef' }} />

            <div className="d-grid gap-2">
              <button
                className="btn btn-sm btn-outline-secondary text-start"
                onClick={() => {
                  onNavigate('elections');
                  setIsOpen(false);
                }}
                style={{
                  borderColor: isDarkMode ? colors.border : '#dee2e6',
                  color: isDarkMode ? colors.text : '#212529'
                }}
              >
                <FaBell className="me-2" /> All Elections
              </button>
              <button
                className="btn btn-sm btn-outline-secondary text-start"
                onClick={() => {
                  onNavigate('history');
                  setIsOpen(false);
                }}
                style={{
                  borderColor: isDarkMode ? colors.border : '#dee2e6',
                  color: isDarkMode ? colors.text : '#212529'
                }}
              >
                <FaHistory className="me-2" /> My History
              </button>
            </div>
          </div>
          
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 998
            }}
            onClick={() => setIsOpen(false)}
          />
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default QuickActionsWidget;
