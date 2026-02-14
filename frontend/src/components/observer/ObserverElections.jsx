import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ThemedTable from '../common/ThemedTable';
import { FaCalendar, FaCheckCircle, FaHourglass, FaClock } from 'react-icons/fa';

const ObserverElections = () => {
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const electionsList = response.data.data?.elections || [];
      setElections(electionsList);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setElections([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { icon: <FaClock />, label: 'Ongoing', color: '#f59e0b', bgColor: '#f59e0b30' },
      upcoming: { icon: <FaHourglass />, label: 'Upcoming', color: '#3b82f6', bgColor: '#3b82f630' },
      completed: { icon: <FaCheckCircle />, label: 'Completed', color: '#10b981', bgColor: '#10b98130' }
    };
    const config = statusConfig[status] || statusConfig.upcoming;
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '6px',
          backgroundColor: config.bgColor,
          color: config.color,
          fontSize: '0.84rem !important',
          fontWeight: '500'
        }}
      >
        {config.icon}
        {config.label}
      </div>
    );
  };

  const filteredElections = filterStatus === 'all'
    ? elections
    : elections.filter(e => e.status === filterStatus);

  const columns = [
    {
      key: 'title',
      label: 'Election Title',
      render: (value) => (
        <div style={{ fontWeight: '500', color: colors.text }}>{value}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value) => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (value) => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    {
      key: 'positions',
      label: 'Positions',
      render: (value) => (
        <span style={{ color: colors.textSecondary }}>
          {Array.isArray(value) ? value.length : 0} position(s)
        </span>
      )
    }
  ];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <FaCalendar className="me-2" />
          All Elections
        </h3>
        <p className="text-muted mb-0">View all elections you are assigned to monitor</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div
            className="card"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Elections</p>
                  <h4 className="mb-0">{elections.length}</h4>
                </div>
                <FaCalendar size={32} style={{ opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div
            className="card"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Ongoing</p>
                  <h4 className="mb-0" style={{ color: '#f59e0b' }}>
                    {elections.filter(e => e.status === 'ongoing').length}
                  </h4>
                </div>
                <FaClock size={32} style={{ color: '#f59e0b', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div
            className="card"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Completed</p>
                  <h4 className="mb-0" style={{ color: '#10b981' }}>
                    {elections.filter(e => e.status === 'completed').length}
                  </h4>
                </div>
                <FaCheckCircle size={32} style={{ color: '#10b981', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          {['all', 'ongoing', 'upcoming', 'completed'].map(status => (
            <button
              key={status}
              className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus(status)}
              style={
                filterStatus === status
                  ? { background: colors.primary, border: `1px solid ${colors.primary}` }
                  : {
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text
                    }
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Elections Table */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" style={{ color: colors.primary }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredElections.length > 0 ? (
        <div 
          className="card"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`
          }}
        >
          <ThemedTable striped hover responsive>
              <thead style={{ 
                background: isDarkMode ? colors.surfaceHover : '#f9fafb',
                borderBottom: `2px solid ${colors.border}`
              }}>
                <tr>
                  <th style={{ color: colors.text, padding: '12px' }}>Election Title</th>
                  <th style={{ color: colors.text, padding: '12px' }}>Status</th>
                  <th style={{ color: colors.text, padding: '12px' }}>Start Date</th>
                  <th style={{ color: colors.text, padding: '12px' }}>End Date</th>
                  <th style={{ color: colors.text, padding: '12px' }}>Positions</th>
                  <th style={{ color: colors.text, padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredElections.map((election) => (
                  <tr key={election._id} style={{ borderColor: colors.border }}>
                    <td style={{ color: colors.text, fontWeight: '500', padding: '12px' }}>
                      {election.title}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getStatusBadge(election.status)}
                    </td>
                    <td style={{ color: colors.text, padding: '12px' }}>
                      {new Date(election.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={{ color: colors.text, padding: '12px' }}>
                      {new Date(election.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={{ color: colors.textSecondary, padding: '12px' }}>
                      {Array.isArray(election.positions) ? election.positions.length : 0} position(s)
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        className="btn btn-sm btn-secondary"
                        disabled
                        style={{
                          background: '#6c757d',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          opacity: 0.6,
                          cursor: 'not-allowed'
                        }}
                      >
                        <i className="fas fa-eye me-1"></i>
                        Monitor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ThemedTable>
        </div>
      ) : (
        <div
          className="alert alert-info"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.text
          }}
        >
          <i className="fas fa-info-circle me-2"></i>
          No elections found for the selected filter.
        </div>
      )}
    </div>
  );
};

export default ObserverElections;
