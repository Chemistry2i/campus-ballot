import React, { useState } from 'react';
import { FaBell, FaClock, FaTrash, FaPlus } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const ReminderSystem = ({ elections, onSetReminder }) => {
  const { isDarkMode, colors } = useTheme();
  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [reminderTime, setReminderTime] = useState('1-hour');

  const openReminderModal = (election) => {
    setSelectedElection(election);
    setShowModal(true);
  };

  const addReminder = () => {
    if (!selectedElection) return;

    const newReminder = {
      id: Date.now(),
      electionId: selectedElection._id,
      electionTitle: selectedElection.title,
      reminderTime,
      createdAt: new Date()
    };

    setReminders([...reminders, newReminder]);
    
    // Schedule browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const timeMap = {
        '1-hour': 3600000,
        '24-hours': 86400000,
        '1-week': 604800000
      };
      
      setTimeout(() => {
        new Notification('Election Reminder', {
          body: `Don't forget to vote in: ${selectedElection.title}`,
          icon: '/logo.png'
        });
      }, timeMap[reminderTime]);
    }

    onSetReminder?.(newReminder);
    setShowModal(false);
    setReminderTime('1-hour');
  };

  const removeReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  // Request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <>
      <div
        className="card shadow-sm mb-4"
        style={{
          background: isDarkMode ? colors.surface : '#fff',
          border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
          borderRadius: '12px'
        }}
      >
        <div className="card-header border-0 py-3" style={{
          background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
          borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`
        }}>
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: isDarkMode ? colors.text : '#212529' }}>
              <FaBell className="text-primary" /> Election Reminders
            </h6>
            {'Notification' in window && Notification.permission !== 'granted' && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={requestNotificationPermission}
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>
        <div className="card-body p-3">
          {reminders.length === 0 ? (
            <div className="text-center py-4" style={{ color: isDarkMode ? colors.textMuted : '#6c757d' }}>
              <FaClock size={48} className="mb-3 opacity-50" />
              <p className="mb-0">No reminders set</p>
              <p className="small">Add reminders for upcoming elections</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  style={{
                    background: isDarkMode ? colors.surface : '#fff',
                    borderColor: isDarkMode ? colors.border : '#e9ecef',
                    color: isDarkMode ? colors.text : '#212529'
                  }}
                >
                  <div>
                    <div className="fw-semibold">{reminder.electionTitle}</div>
                    <small className="text-muted">
                      Remind {reminder.reminderTime.replace('-', ' ')} before
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeReminder(reminder.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Reminder Button for each election */}
      <style>{`
        .election-card-reminder {
          position: absolute;
          top: 12px;
          right: 12px;
        }
      `}</style>

      {/* Reminder Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#dee2e6'}`
            }}>
              <div className="modal-header" style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }}>
                <h5 className="modal-title" style={{ color: isDarkMode ? colors.text : '#212529' }}>
                  Set Reminder
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                  style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
                />
              </div>
              <div className="modal-body" style={{ color: isDarkMode ? colors.text : '#212529' }}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Election:</label>
                  <p className="mb-0">{selectedElection?.title}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Remind me:</label>
                  <select
                    className="form-select"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    style={{
                      background: isDarkMode ? colors.inputBg : '#fff',
                      borderColor: isDarkMode ? colors.border : '#dee2e6',
                      color: isDarkMode ? colors.text : '#212529'
                    }}
                  >
                    <option value="1-hour">1 hour before</option>
                    <option value="24-hours">24 hours before</option>
                    <option value="1-week">1 week before</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={addReminder}
                >
                  <FaPlus className="me-2" /> Set Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReminderSystem;
