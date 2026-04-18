import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { FaCalendarCheck, FaMusic, FaUniversity, FaNewspaper, FaMicrophone, FaHandshake, FaYoutube, FaFacebook, FaTwitch, FaTimes, FaCheckCircle } from 'react-icons/fa';
import './ScheduleCampaignEvent.css';

/**
 * ScheduleCampaignEvent Component
 * Allows agents to schedule campaign events (rallies, town halls, etc)
 */
export default function ScheduleCampaignEvent({ candidateId, agentPermissions }) {
    const { isDarkMode, colors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        eventType: 'rally',
        startDateTime: '',
        endDateTime: '',
        location: {
            venue: '',
            city: '',
            latitude: '',
            longitude: '',
            addressString: ''
        },
        isStreamed: false,
        streamProvider: 'youtube',
        streamUrl: '',
        budget: {
            estimated: '',
            currency: 'UGX'
        }
    });

    // Check if agent has permission - allow by default for campaign agents
    const canScheduleEvents = !agentPermissions || 
                              agentPermissions.length === 0 ||
                              agentPermissions?.includes('manageTasks') ||
                              agentPermissions?.includes('schedule_events') ||
                              agentPermissions?.includes('*');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (name.includes('.')) {
            // Handle nested object fields
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Event name is required');
            return;
        }

        if (!formData.startDateTime) {
            toast.error('Event date and time are required');
            return;
        }

        const startDate = new Date(formData.startDateTime);
        if (startDate < new Date()) {
            toast.error('Event must be scheduled for the future');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                candidateId,
                name: formData.name,
                description: formData.description,
                eventType: formData.eventType,
                startDateTime: formData.startDateTime,
                endDateTime: formData.endDateTime || undefined,
                location: {
                    venue: formData.location.venue,
                    city: formData.location.city,
                    latitude: formData.location.latitude ? parseFloat(formData.location.latitude) : undefined,
                    longitude: formData.location.longitude ? parseFloat(formData.location.longitude) : undefined,
                    addressString: formData.location.addressString
                },
                isStreamed: formData.isStreamed,
                streaming: formData.isStreamed ? {
                    provider: formData.streamProvider,
                    streamUrl: formData.streamUrl
                } : undefined,
                budget: formData.budget.estimated ? {
                    estimated: parseFloat(formData.budget.estimated),
                    currency: formData.budget.currency
                } : undefined
            };

            const _response = await axios.post(
                '/api/agents/campaign/events',
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            toast.success('Event scheduled successfully!');

            // Reset form
            setFormData({
                name: '',
                description: '',
                eventType: 'rally',
                startDateTime: '',
                endDateTime: '',
                location: {
                    venue: '',
                    city: '',
                    latitude: '',
                    longitude: '',
                    addressString: ''
                },
                isStreamed: false,
                streamProvider: 'youtube',
                streamUrl: '',
                budget: {
                    estimated: '',
                    currency: 'UGX'
                }
            });

            setIsOpen(false);

            // Trigger refresh in parent component
            if (window.refreshCampaignEvents) {
                window.refreshCampaignEvents();
            }

        } catch (error) {
            const message = error.response?.data?.error || 'Failed to schedule event';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!canScheduleEvents) {
        return (
            <div className="permission-denied">
                <p>⛔ You don't have permission to schedule campaign events</p>
            </div>
        );
    }

    return (
        <div style={{ margin: '20px 0', padding: 0 }}>
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
                <FaCalendarCheck /> Schedule Campaign Event
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
                        maxWidth: '700px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                        padding: '2rem',
                        border: `1px solid ${colors.border}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: colors.text, margin: 0 }}>Schedule Campaign Event</h2>
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
                                <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Event Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Campaign Rally at Makerere"
                                    required
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

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Event details and agenda..."
                                    rows={3}
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
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Event Type</label>
                                    <select
                                        name="eventType"
                                        value={formData.eventType}
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
                                        <option value="rally">Rally</option>
                                        <option value="town_hall">Town Hall</option>
                                        <option value="press_conference">Press Conference</option>
                                        <option value="debate">Debate</option>
                                        <option value="meet_and_greet">Meet & Greet</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="startDateTime"
                                        value={formData.startDateTime}
                                        onChange={handleChange}
                                        required
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
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>End Time</label>
                                    <input
                                        type="datetime-local"
                                        name="endDateTime"
                                        value={formData.endDateTime}
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
                                    />
                                </div>

                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Venue</label>
                                    <input
                                        type="text"
                                        name="location.venue"
                                        value={formData.location.venue}
                                        onChange={handleChange}
                                        placeholder="e.g., Makerere Main Hall"
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
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>City</label>
                                    <input
                                        type="text"
                                        name="location.city"
                                        value={formData.location.city}
                                        onChange={handleChange}
                                        placeholder="Kampala"
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

                                <div>
                                    <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Address</label>
                                    <input
                                        type="text"
                                        name="location.addressString"
                                        value={formData.location.addressString}
                                        onChange={handleChange}
                                        placeholder="Full address"
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
                            </div>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: isDarkMode ? `${colors.border}20` : `${colors.primary}10`, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                <h3 style={{ color: colors.text, fontSize: '1rem', marginBottom: '1rem' }}>Location Coordinates (Optional)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Latitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            name="location.latitude"
                                            value={formData.location.latitude}
                                            onChange={handleChange}
                                            placeholder="0.347596"
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

                                    <div>
                                        <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Longitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            name="location.longitude"
                                            value={formData.location.longitude}
                                            onChange={handleChange}
                                            placeholder="32.577850"
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
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: isDarkMode ? `${colors.border}20` : `${colors.primary}10`, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                <h3 style={{ color: colors.text, fontSize: '1rem', marginBottom: '1rem' }}>Streaming (Optional)</h3>
                                <label style={{ color: colors.text, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="isStreamed"
                                        checked={formData.isStreamed}
                                        onChange={handleChange}
                                    />
                                    Stream this event
                                </label>

                                {formData.isStreamed && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Platform</label>
                                            <select
                                                name="streamProvider"
                                                value={formData.streamProvider}
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
                                                <option value="youtube">YouTube</option>
                                                <option value="facebook">Facebook Live</option>
                                                <option value="twitch">Twitch</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Stream URL</label>
                                            <input
                                                type="url"
                                                name="streamUrl"
                                                value={formData.streamUrl}
                                                onChange={handleChange}
                                                placeholder="https://youtube.com/..."
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
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: isDarkMode ? `${colors.border}20` : `${colors.primary}10`, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                <h3 style={{ color: colors.text, fontSize: '1rem', marginBottom: '1rem' }}>Budget (Optional)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Estimated Budget</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="budget.estimated"
                                            value={formData.budget.estimated}
                                            onChange={handleChange}
                                            placeholder="50000"
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

                                    <div>
                                        <label style={{ color: colors.text, fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Currency</label>
                                        <select
                                            name="budget.currency"
                                            value={formData.budget.currency}
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
                                            <option value="UGX">UGX (Uganda Shilling)</option>
                                            <option value="USD">USD (US Dollar)</option>
                                            <option value="EUR">EUR (Euro)</option>
                                            <option value="KES">KES (Kenya Shilling)</option>
                                        </select>
                                    </div>
                                </div>
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
                                    <FaCheckCircle /> {loading ? 'Scheduling...' : 'Schedule Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
