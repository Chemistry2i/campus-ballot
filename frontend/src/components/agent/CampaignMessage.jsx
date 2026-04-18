import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { FaPaperPlane, FaBullhorn, FaSyncAlt, FaQuestionCircle, FaCalendarAlt, FaGlobe, FaUsers, FaLock, FaCheckCircle, FaTimes } from 'react-icons/fa';
import './CampaignMessage.css';

/**
 * CampaignMessage Component
 * Allows agents to post campaign messages/updates
 */
export default function CampaignMessage({ candidateId, agentPermissions }) {
    const { isDarkMode, colors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        text: '',
        messageType: 'announcement',
        visibility: 'public',
        scheduledFor: null,
        status: 'published'
    });

    // Check if agent has permission - allow by default for campaign agents
    const canPostMessages = !agentPermissions || 
                            agentPermissions.length === 0 ||
                            agentPermissions?.includes('postUpdates') ||
                            agentPermissions?.includes('manage_candidate_messages') ||
                            agentPermissions?.includes('*');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.text.trim()) {
            toast.error('Message cannot be empty');
            return;
        }

        setLoading(true);

        try {
            const _response = await axios.post(
                '/api/agents/campaign/messages',
                {
                    candidateId,
                    ...formData
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            toast.success(
                formData.status === 'scheduled'
                    ? 'Message scheduled successfully!'
                    : 'Message posted successfully!'
            );

            // Reset form
            setFormData({
                text: '',
                messageType: 'announcement',
                visibility: 'public',
                scheduledFor: null,
                status: 'published'
            });

            setIsOpen(false);

            // Trigger refresh in parent component
            if (window.refreshCampaignMessages) {
                window.refreshCampaignMessages();
            }

        } catch (error) {
            const message = error.response?.data?.error || 'Failed to post message';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!canPostMessages) {
        return (
            <div className="permission-denied">
                <p>⛔ You don't have permission to post campaign messages</p>
            </div>
        );
    }

    return (
        <div className="campaign-message-container">
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: colors.primary,
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px ${colors.primary}40`,
                    margin: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 4px 12px ${colors.primary}60`;
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = `0 2px 8px ${colors.primary}40`;
                }}
            >
                <FaPaperPlane /> Post Campaign Message
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setIsOpen(false)} 
                    />
                    <div style={{
                        position: 'relative',
                        background: colors.surface,
                        borderRadius: '12px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                        padding: '2rem',
                        border: `1px solid ${colors.border}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: colors.text, margin: 0 }}>Post Campaign Message</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: colors.text,
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    transition: 'all 0.2s ease',
                                    hover: { background: `${colors.border}40` }
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `${colors.border}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                                title="Close modal"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Message Content *</label>
                                <textarea
                                    name="text"
                                    value={formData.text}
                                    onChange={handleChange}
                                    placeholder="Write your campaign message..."
                                    rows={5}
                                    maxLength={1000}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        border: `1px solid ${colors.border}`,
                                        background: isDarkMode ? colors.background : '#f9f9f9',
                                        color: colors.text,
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <small style={{ color: colors.textSecondary, display: 'block', marginTop: '0.25rem' }}>{formData.text.length}/1000 characters</small>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Message Type</label>
                                    <select
                                        name="messageType"
                                        value={formData.messageType}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            border: `1px solid ${colors.border}`,
                                            background: isDarkMode ? colors.background : '#f9f9f9',
                                            color: colors.text,
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="announcement">Announcement</option>
                                        <option value="update">Update</option>
                                        <option value="question_response">Q&A</option>
                                        <option value="event_info">Event Info</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Visibility</label>
                                    <select
                                        name="visibility"
                                        value={formData.visibility}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            border: `1px solid ${colors.border}`,
                                            background: isDarkMode ? colors.background : '#f9f9f9',
                                            color: colors.text,
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="public">Public</option>
                                        <option value="followers_only">Followers Only</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            border: `1px solid ${colors.border}`,
                                            background: isDarkMode ? colors.background : '#f9f9f9',
                                            color: colors.text,
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="published">Publish Now</option>
                                        <option value="scheduled">Schedule</option>
                                        <option value="draft">Save as Draft</option>
                                    </select>
                                </div>

                                {formData.status === 'scheduled' && (
                                    <div>
                                        <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Schedule For</label>
                                        <input
                                            type="datetime-local"
                                            name="scheduledFor"
                                            value={formData.scheduledFor}
                                            onChange={handleChange}
                                            required={formData.status === 'scheduled'}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                border: `1px solid ${colors.border}`,
                                                background: isDarkMode ? colors.background : '#f9f9f9',
                                                color: colors.text,
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={loading}
                                    style={{
                                        background: colors.border,
                                        color: colors.text,
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        opacity: loading ? 0.6 : 1,
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        background: colors.primary,
                                        color: '#fff',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        opacity: loading ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaCheckCircle /> {loading ? 'Posting...' : 'Post Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
