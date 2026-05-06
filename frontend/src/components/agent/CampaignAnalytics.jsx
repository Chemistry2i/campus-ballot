import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './CampaignAnalytics.css';

/**
 * CampaignAnalytics Component
 * Displays agent campaign statistics and analytics
 */
export default function CampaignAnalytics({ agentPermissions }) {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState('all'); // all, 7days, 30days, 90days
    const [error, setError] = useState(null);

    // Check if agent has permission
    const canViewAnalytics = agentPermissions?.includes('viewStatistics') ||
                             agentPermissions?.includes('view_analytics');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                '/api/agents/campaign/analytics',
                {
                    params: { timeRange },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setAnalytics(response.data.analytics);
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to load analytics';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!canViewAnalytics) {
        return (
            <div className="permission-denied">
                <p>⛔ You don't have permission to view campaign analytics</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-error">
                <p>❌ {error}</p>
                <button onClick={fetchAnalytics}>Retry</button>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="analytics-empty">
                <p>No analytics data available</p>
            </div>
        );
    }

    // Sample data structures (adjust based on actual API response)
    const overview = [
        { label: 'Messages Posted', value: analytics.messagesPosted || 0, icon: '📝' },
        { label: 'Events Scheduled', value: analytics.eventsScheduled || 0, icon: '📅' },
        { label: 'Total Engagement', value: analytics.totalEngagement || 0, icon: '❤️' },
        { label: 'Reach', value: analytics.reach || 0, icon: '👥' }
    ];

    // Engagement trend data (if provided by API)
    const engagementTrend = analytics.engagementTrend || [
        { date: 'Mon', engagement: 400 },
        { date: 'Tue', engagement: 300 },
        { date: 'Wed', engagement: 500 },
        { date: 'Thu', engagement: 450 },
        { date: 'Fri', engagement: 600 }
    ];

    // Message type distribution
    const messageDistribution = analytics.messageDistribution || [
        { name: 'Announcements', value: 35 },
        { name: 'Updates', value: 25 },
        { name: 'Q&A', value: 20 },
        { name: 'Event Info', value: 20 }
    ];

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

    return (
        <div className="campaign-analytics-container">
            <div className="analytics-header">
                <h2>📊 Campaign Analytics</h2>

                <div className="time-range-selector">
                    <button
                        className={timeRange === 'all' ? 'active' : ''}
                        onClick={() => setTimeRange('all')}
                    >
                        All Time
                    </button>
                    <button
                        className={timeRange === '7days' ? 'active' : ''}
                        onClick={() => setTimeRange('7days')}
                    >
                        7 Days
                    </button>
                    <button
                        className={timeRange === '30days' ? 'active' : ''}
                        onClick={() => setTimeRange('30days')}
                    >
                        30 Days
                    </button>
                    <button
                        className={timeRange === '90days' ? 'active' : ''}
                        onClick={() => setTimeRange('90days')}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="analytics-overview">
                {overview.map((card, index) => (
                    <div key={index} className="overview-card">
                        <div className="card-icon">{card.icon}</div>
                        <div className="card-content">
                            <h4>{card.label}</h4>
                            <p className="card-value">{card.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="analytics-charts">
                {/* Engagement Trend */}
                <div className="chart-container">
                    <h3>📈 Engagement Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={engagementTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="engagement"
                                stroke="#8884d8"
                                dot={{ fill: '#8884d8', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Message Type Distribution */}
                <div className="chart-container">
                    <h3>📊 Message Types</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={messageDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {messageDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="analytics-details">
                <div className="detail-section">
                    <h3>📋 Message Performance</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Message</th>
                                <th>Likes</th>
                                <th>Shares</th>
                                <th>Replies</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.topMessages?.map((msg, idx) => (
                                <tr key={idx}>
                                    <td>{msg.text?.substring(0, 40)}...</td>
                                    <td>{msg.likes || 0}</td>
                                    <td>{msg.shares || 0}</td>
                                    <td>{msg.replies || 0}</td>
                                    <td>{new Date(msg.postedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="detail-section">
                    <h3>📅 Upcoming Events</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Registrations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.upcomingEvents?.map((event, idx) => (
                                <tr key={idx}>
                                    <td>{event.name}</td>
                                    <td>{new Date(event.startDateTime).toLocaleDateString()}</td>
                                    <td>{event.location?.city || 'TBA'}</td>
                                    <td>{event.attendance?.registrations?.length || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Options */}
            <div className="analytics-actions">
                <button onClick={() => window.print()} className="btn-export">
                    📋 Export as PDF
                </button>
                <button onClick={fetchAnalytics} className="btn-refresh">
                    🔄 Refresh Data
                </button>
            </div>
        </div>
    );
}
