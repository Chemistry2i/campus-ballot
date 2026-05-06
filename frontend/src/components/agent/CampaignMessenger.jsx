import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaPaperPlane,
  FaComments,
  FaHistory,
  FaLock,
  FaGlobeAmericas,
  FaHeart,
  FaShare,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

const CampaignMessenger = ({ candidateId, agentPermissions, socket }) => {
  const { isDarkMode, colors } = useTheme();
  const [messageText, setMessageText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [messageType, setMessageType] = useState('announcement');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  // Check if agent has postUpdates permission
  useEffect(() => {
    setHasPermission(agentPermissions?.includes('postUpdates') || false);
  }, [agentPermissions]);

  // Fetch campaign messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/agents/campaign/messages/${candidateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100, skip: 0 }
        }
      );
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Load messages on mount
  useEffect(() => {
    if (candidateId) {
      fetchMessages();
    }
  }, [candidateId]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!socket) return;

    socket.on('campaign_message_posted', (newMessage) => {
      if (newMessage.candidateId === candidateId) {
        setMessages(prev => [newMessage, ...prev]);
      }
    });

    return () => socket.off('campaign_message_posted');
  }, [socket, candidateId]);

  const handlePostMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (!hasPermission) {
      setError('You do not have permission to post messages');
      return;
    }

    try {
      setPosting(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        '/api/agents/campaign/messages',
        {
          candidateId,
          text: messageText,
          visibility,
          messageType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages(prev => [response.data.data, ...prev]);
      setMessageText('');
      setCharCount(0);
      setSuccessMsg('Message posted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);

      // Emit socket event for real-time update
      if (socket) {
        socket.emit('campaign_message_sent', {
          candidateId,
          message: response.data.data
        });
      }
    } catch (err) {
      console.error('Error posting message:', err);
      setError(err.response?.data?.error || 'Failed to post message');
    } finally {
      setPosting(false);
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setMessageText(text);
    setCharCount(text.length);
  };

  if (!hasPermission) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          borderRadius: '12px',
          background: isDarkMode ? colors.surface : '#fff3cd',
          border: `2px solid ${isDarkMode ? colors.border : '#ffc107'}`,
          color: isDarkMode ? colors.text : '#856404'
        }}
      >
        <FaExclamationTriangle size={40} className="mb-3" style={{ display: 'block', margin: '0 auto 1rem' }} />
        <h5 className="mb-2">Permission Required</h5>
        <p className="mb-0">
          You need <strong>Post Updates</strong> permission to send campaign messages.
          Contact your candidate to grant this permission.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Message Composer */}
      <div
        className="card"
        style={{
          background: isDarkMode ? colors.surface : '#fff',
          border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
          borderRadius: '12px'
        }}
      >
        <div className="card-body p-4">
          <h5 className="mb-4" style={{ color: colors.text, fontWeight: 600 }}>
            <FaComments className="me-2" />
            Compose Campaign Message
          </h5>

          {error && (
            <div
              className="alert alert-danger mb-3 d-flex align-items-center"
              role="alert"
              style={{
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '8px'
              }}
            >
              <FaTimes className="me-2" />
              {error}
            </div>
          )}

          {successMsg && (
            <div
              className="alert alert-success mb-3 d-flex align-items-center"
              role="alert"
              style={{
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '8px'
              }}
            >
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handlePostMessage}>
            <div className="mb-3">
              <label htmlFor="messageText" className="form-label" style={{ color: colors.text }}>
                Message
              </label>
              <textarea
                id="messageText"
                className="form-control"
                rows={4}
                maxLength={5000}
                value={messageText}
                onChange={handleTextChange}
                placeholder="Write your campaign message here..."
                style={{
                  background: isDarkMode ? colors.background : '#fff',
                  color: colors.text,
                  borderColor: isDarkMode ? colors.border : '#dee2e6',
                  fontSize: '0.95rem'
                }}
                disabled={posting}
              />
              <small style={{ color: colors.textSecondary }}>
                {charCount} / 5000 characters
              </small>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label htmlFor="messageType" className="form-label" style={{ color: colors.text }}>
                  Message Type
                </label>
                <select
                  id="messageType"
                  className="form-select"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  style={{
                    background: isDarkMode ? colors.background : '#fff',
                    color: colors.text,
                    borderColor: isDarkMode ? colors.border : '#dee2e6'
                  }}
                  disabled={posting}
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="campaign_update">📰 Campaign Update</option>
                  <option value="event_reminder">📅 Event Reminder</option>
                  <option value="supporter_thank_you">❤️ Thank You Message</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="visibility" className="form-label" style={{ color: colors.text }}>
                  Visibility
                </label>
                <select
                  id="visibility"
                  className="form-select"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  style={{
                    background: isDarkMode ? colors.background : '#fff',
                    color: colors.text,
                    borderColor: isDarkMode ? colors.border : '#dee2e6'
                  }}
                  disabled={posting}
                >
                  <option value="public">🌍 Public</option>
                  <option value="supporters_only">👥 Supporters Only</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={posting || !messageText.trim()}
              className="btn"
              style={{
                background: posting ? '#ccc' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontWeight: 600,
                cursor: posting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {posting ? (
                <>
                  <FaSpinner className="spinner-border spinner-border-sm" style={{ animation: 'spin 1s linear infinite' }} />
                  Posting...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Post Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Message History */}
      <div
        className="card"
        style={{
          background: isDarkMode ? colors.surface : '#fff',
          border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
          borderRadius: '12px'
        }}
      >
        <div className="card-body p-4">
          <h5 className="mb-4" style={{ color: colors.text, fontWeight: 600 }}>
            <FaHistory className="me-2" />
            Message History
          </h5>

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner
                size={40}
                style={{
                  color: colors.textSecondary,
                  animation: 'spin 1s linear infinite'
                }}
              />
              <p style={{ color: colors.textSecondary, marginTop: '1rem' }}>
                Loading messages...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: colors.textSecondary,
                borderRadius: '8px',
                background: isDarkMode ? colors.background : '#f8f9fa'
              }}
            >
              📭 No messages yet. Start engaging with your supporters!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
              {messages.map((message) => (
                <div
                  key={message._id}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: isDarkMode ? colors.background : '#f8f9fa',
                    border: `1px solid ${colors.border}`,
                    borderLeft: `4px solid ${
                      message.messageType === 'announcement'
                        ? '#3b82f6'
                        : message.messageType === 'campaign_update'
                        ? '#f59e0b'
                        : message.messageType === 'event_reminder'
                        ? '#10b981'
                        : '#8b5cf6'
                    }`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ color: colors.text, fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                        {message.messageType === 'announcement' && '📢'}
                        {message.messageType === 'campaign_update' && '📰'}
                        {message.messageType === 'event_reminder' && '📅'}
                        {message.messageType === 'supporter_thank_you' && '❤️'} {message.messageType?.replace(/_/g, ' ')}
                      </p>
                      <small style={{ color: colors.textSecondary }}>
                        {new Date(message.createdAt || message.postedAt).toLocaleString()}
                      </small>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background:
                          message.visibility === 'public'
                            ? '#10b98120'
                            : message.visibility === 'supporters_only'
                            ? '#3b82f620'
                            : '#6b728020',
                        color:
                          message.visibility === 'public'
                            ? '#10b981'
                            : message.visibility === 'supporters_only'
                            ? '#3b82f6'
                            : '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {message.visibility === 'public' && <FaGlobeAmericas size={10} />}
                      {message.visibility === 'supporters_only' && <FaGlobeAmericas size={10} />}
                      {message.visibility === 'private' && <FaLock size={10} />}
                      {message.visibility}
                    </span>
                  </div>

                  <p style={{ color: colors.text, margin: '0.75rem 0', lineHeight: '1.5' }}>
                    {message.text}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <FaHeart size={12} style={{ color: '#ef4444' }} />
                      {message.likes?.length || 0} likes
                    </span>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <FaShare size={12} style={{ color: '#3b82f6' }} />
                      {message.shares?.length || 0} shares
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignMessenger;
