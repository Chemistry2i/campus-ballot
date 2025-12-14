import React from 'react';
import { FaKeyboard, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const { isDarkMode, colors } = useTheme();

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open quick search' },
    { keys: ['Ctrl', 'D'], description: 'Go to Dashboard' },
    { keys: ['Ctrl', 'E'], description: 'View Elections' },
    { keys: ['Ctrl', 'V'], description: 'View My Votes' },
    { keys: ['Ctrl', 'N'], description: 'View Notifications' },
    { keys: ['Ctrl', 'P'], description: 'View Profile' },
    { keys: ['Ctrl', 'H'], description: 'View History' },
    { keys: ['Ctrl', 'R'], description: 'Refresh data' },
    { keys: ['Esc'], description: 'Close modals' },
    { keys: ['?'], description: 'Show keyboard shortcuts' }
  ];

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{
          background: isDarkMode ? colors.surface : '#fff',
          border: `1px solid ${isDarkMode ? colors.border : '#dee2e6'}`
        }}>
          <div className="modal-header" style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }}>
            <h5 className="modal-title d-flex align-items-center gap-2" style={{ color: isDarkMode ? colors.text : '#212529' }}>
              <FaKeyboard className="text-primary" />
              Keyboard Shortcuts
            </h5>
            <button 
              className="btn-close" 
              onClick={onClose}
              style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
            />
          </div>
          <div className="modal-body" style={{ color: isDarkMode ? colors.text : '#212529' }}>
            <div className="list-group list-group-flush">
              {shortcuts.map((shortcut, index) => (
                <div 
                  key={index} 
                  className="list-group-item d-flex justify-content-between align-items-center"
                  style={{
                    background: isDarkMode ? colors.surface : '#fff',
                    borderColor: isDarkMode ? colors.border : '#e9ecef',
                    color: isDarkMode ? colors.text : '#212529'
                  }}
                >
                  <span>{shortcut.description}</span>
                  <div className="d-flex gap-1">
                    {shortcut.keys.map((key, idx) => (
                      <kbd 
                        key={idx}
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                          color: isDarkMode ? colors.text : '#212529',
                          border: `1px solid ${isDarkMode ? colors.border : '#dee2e6'}`,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '12px'
                        }}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer" style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }}>
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
