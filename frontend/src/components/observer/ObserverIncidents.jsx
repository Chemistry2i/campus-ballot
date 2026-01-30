import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ThemedTable from '../common/ThemedTable';

const ObserverIncidents = () => {
  const { isDarkMode, colors } = useTheme();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newIncident, setNewIncident] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    electionId: '',
    type: 'election_incident'
  });
  const [elections, setElections] = useState([]);

  useEffect(() => {
    fetchIncidents();
    fetchElections();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/incidents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Backend returns { success, data: { statistics, incidents } }
      setIncidents(response.data.data?.incidents || []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const electionsList = response.data.data?.elections || [];
      setElections(electionsList);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setElections([]);
    }
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/observer/incidents', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        electionId: '',
        type: 'election_incident'
      });
      setShowForm(false);
      fetchIncidents();
    } catch (err) {
      console.error('Error submitting incident:', err);
    }
  };

  const getSeverityBadge = (severity) => {
    const severityMap = {
      low: { color: '#10b981', bgColor: '#10b98130' },
      medium: { color: '#f59e0b', bgColor: '#f59e0b30' },
      high: { color: '#ef4444', bgColor: '#ef444430' }
    };
    return severityMap[severity] || severityMap.medium;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { color: '#3b82f6', bgColor: '#3b82f630' },
      in_progress: { color: '#f59e0b', bgColor: '#f59e0b30' },
      resolved: { color: '#10b981', bgColor: '#10b98130' },
      closed: { color: '#6b7280', bgColor: '#6b728030' }
    };
    return statusMap[status] || statusMap.open;
  };

  const filteredIncidents = incidents.filter(incident =>
    selectedStatus === 'all' ? true : incident.status === selectedStatus
  );

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
            <i className="fas fa-triangle-exclamation me-2"></i>
            Election Incidents
          </h3>
          <p className="text-muted mb-0">Report and track incidents during elections</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus me-2"></i>
          Report Incident
        </button>
      </div>

      {/* Incident Form */}
      {showForm && (
        <div
          className="card mb-4"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px'
          }}
        >
          <div className="card-body">
            <h5 className="fw-bold mb-3" style={{ color: colors.text }}>
              Report New Incident
            </h5>
            <form onSubmit={handleSubmitIncident}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" style={{ color: colors.text }}>
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      background: colors.surface,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: colors.text }}>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    style={{
                      background: colors.surface,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" style={{ color: colors.text }}>
                    Election
                  </label>
                  <select
                    className="form-select"
                    value={formData.electionId}
                    onChange={(e) => setFormData({ ...formData, electionId: e.target.value })}
                    style={{
                      background: colors.surface,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}
                    required
                  >
                    <option value="">Select Election</option>
                    {elections.map(election => (
                      <option key={election._id} value={election._id}>
                        {election.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" style={{ color: colors.text }}>
                    Severity
                  </label>
                  <select
                    className="form-select"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    style={{
                      background: colors.surface,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    Submit Incident
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <ThemedTable striped bordered hover responsive>
          <thead style={{
            background: isDarkMode ? '#334155' : '#f9fafb',
            color: colors.text
          }}>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No incidents found
                </td>
              </tr>
            ) : (
              filteredIncidents.map(incident => {
                const severity = getSeverityBadge(incident.severity);
                const status = getStatusBadge(incident.status);

                return (
                  <tr key={incident._id}>
                    <td style={{ color: colors.text, fontWeight: 600 }}>
                      {incident.title}
                    </td>
                    <td style={{ color: colors.text }}>
                      {incident.description.substring(0, 50)}...
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: severity.bgColor,
                          color: severity.color
                        }}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: status.bgColor,
                          color: status.color
                        }}
                      >
                        {incident.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: colors.text }}>
                      {new Date(incident.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </ThemedTable>
      )}
    </div>
  );
};

export default ObserverIncidents;
