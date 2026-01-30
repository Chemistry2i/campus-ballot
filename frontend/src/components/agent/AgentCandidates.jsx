import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaUserTie,
  FaCalendar,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaTasks
} from 'react-icons/fa';

const AgentCandidates = () => {
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/agent/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[AgentCandidates] Dashboard response:', response.data);

      if (response.data?.agent) {
        setCandidate(response.data.agent);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-info" role="alert">
          <FaUserTie className="me-2" />
          No candidates assigned yet. Once a candidate adds you as an agent, you'll see their information here.
        </div>
      </div>
    );
  }

  // Helper function to get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const apiBase = import.meta.env.VITE_API_URL || '';
    if (apiBase) {
      return `${apiBase.replace(/\/$/, '')}${imageUrl}`;
    }
    return imageUrl;
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <FaUserTie className="me-2" />
          My Candidate
        </h3>
        <p className="text-muted mb-0">Manage and monitor your assigned candidate's information</p>
      </div>

      {/* Candidate Card */}
      <div className="row">
        <div className="col-12 col-lg-8">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div
              className="card-header p-4"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '12px 12px 0 0',
                color: '#fff'
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    overflow: 'hidden'
                  }}
                >
                  {candidate.candidatePhoto ? (
                    <img
                      src={getImageUrl(candidate.candidatePhoto)}
                      alt={candidate.candidateName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<i class="fas fa-user" style="font-size: 40px;"></i>';
                      }}
                    />
                  ) : (
                    <FaUserTie size={40} />
                  )}
                </div>
                <div>
                  <h4 className="mb-1 fw-bold">{candidate.candidateName}</h4>
                  <p className="mb-0" style={{ opacity: 0.9 }}>
                    {candidate.position || 'Campaign Candidate'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="row g-4">
                {/* Contact Information */}
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold mb-3" style={{ color: colors.text }}>
                    Contact Information
                  </h6>
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">
                      <FaEnvelope className="me-2" />
                      Email
                    </small>
                    <p className="mb-0" style={{ color: colors.text }}>
                      {candidate.candidateEmail || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <small className="text-muted d-block mb-1">
                      <FaPhone className="me-2" />
                      Phone
                    </small>
                    <p className="mb-0" style={{ color: colors.text }}>
                      {candidate.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Role Information */}
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold mb-3" style={{ color: colors.text }}>
                    Your Role
                  </h6>
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Agent Role</small>
                    <p className="mb-0" style={{ color: colors.text }}>
                      <span
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '20px',
                          background: candidate.role === 'coordinator' ? '#8b5cf630' : '#3b82f630',
                          color: candidate.role === 'coordinator' ? '#8b5cf6' : '#3b82f6',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {candidate.role}
                      </span>
                    </p>
                  </div>
                  <div>
                    <small className="text-muted d-block mb-1">Status</small>
                    <p className="mb-0" style={{ color: colors.text }}>
                      <span
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '20px',
                          background: candidate.status === 'active' ? '#10b98130' : '#6b728030',
                          color: candidate.status === 'active' ? '#10b981' : '#6b7280',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {candidate.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <hr style={{ borderColor: colors.border, margin: '2rem 0' }} />

              {/* Election Information & Campaign Symbol */}
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold mb-3" style={{ color: colors.text }}>
                    Election
                  </h6>
                  <p className="mb-0" style={{ color: colors.text }}>
                    {candidate.electionTitle || 'N/A'}
                  </p>
                </div>
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold mb-3" style={{ color: colors.text }}>
                    <FaCalendar className="me-2" />
                    Joined Date
                  </h6>
                  <p className="mb-0" style={{ color: colors.text }}>
                    {candidate.joinedDate
                      ? new Date(candidate.joinedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Campaign Symbol if available */}
              {candidate.candidateSymbol && (
                <>
                  <hr style={{ borderColor: colors.border, margin: '2rem 0' }} />
                  <div className="row g-4">
                    <div className="col-12">
                      <h6 className="fw-bold mb-3" style={{ color: colors.text }}>
                        Campaign Symbol
                      </h6>
                      <div
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          background: isDarkMode ? colors.background : '#f8f9fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '150px'
                        }}
                      >
                        <img
                          src={getImageUrl(candidate.candidateSymbol)}
                          alt="Campaign Symbol"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '150px',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="col-12 col-lg-4">
          <div
            className="card mb-3"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: colors.text }}>
                <FaTasks className="me-2" />
                Task Statistics
              </h6>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Active Tasks</span>
                  <span
                    className="fw-bold"
                    style={{
                      fontSize: '1.5rem',
                      color: '#3b82f6'
                    }}
                  >
                    {candidate.tasksActive || 0}
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: '100%',
                      background: '#3b82f6'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Completed Tasks</span>
                  <span
                    className="fw-bold"
                    style={{
                      fontSize: '1.5rem',
                      color: '#10b981'
                    }}
                  >
                    {candidate.tasksCompleted || 0}
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: '100%',
                      background: '#10b981'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: colors.text }}>
                Permissions
              </h6>
              <div className="list-unstyled">
                {candidate.permissions ? (
                  Object.entries(candidate.permissions).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <small style={{ color: colors.text }}>
                        <input type="checkbox" checked={value} disabled className="me-2" />
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </small>
                    </div>
                  ))
                ) : (
                  <small className="text-muted">No permissions set</small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCandidates;
