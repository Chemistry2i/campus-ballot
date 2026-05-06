import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaUserTie,
  FaCalendar,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaTasks,
  FaImages,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaChartBar,
  FaTrophy,
  FaUsers
} from 'react-icons/fa';
import AgentPermissions from './AgentPermissions';
import CampaignAnalytics from './CampaignAnalytics';

const AgentCandidates = () => {
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch agent dashboard info
      const response = await axios.get('/api/agent/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[AgentCandidates] Dashboard response:', response.data);

      if (response.data?.agent) {
        // Also fetch real task data to get accurate counts
        const tasksResponse = await axios.get(`/api/tasks/agent?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('[AgentCandidates] Tasks response:', tasksResponse.data);
        
        const tasks = tasksResponse.data || [];
        const activeTasks = tasks.filter(t => t.status !== 'completed').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;

        // Update candidate data with real task counts
        const candidateData = {
          ...response.data.agent,
          tasksActive: activeTasks,
          tasksCompleted: completedTasks
        };

        setCandidate(candidateData);
        
        if (candidateData.candidateId) {
          fetchCandidateMaterials(candidateData.candidateId);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      setLoading(false);
    }
  };

  const fetchCandidateMaterials = async (candidateId) => {
    setLoadingMaterials(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/candidates/${candidateId}/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDownloadMaterial = async (material) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/candidates/${candidate.candidateId}/materials/${material._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.originalName || material.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading material:', error);
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
        <p className="text-muted mb-0">Manage and monitor your assigned candidate's information and campaign materials</p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" style={{ borderColor: colors.border }}>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            style={{
              color: activeTab === 'info' ? colors.primary : colors.text,
              borderColor: activeTab === 'info' ? colors.primary : 'transparent',
              background: activeTab === 'info' ? (isDarkMode ? colors.surface : '#fff') : 'transparent'
            }}
          >
            <FaUserTie className="me-2" />
            Candidate Info
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
            style={{
              color: activeTab === 'materials' ? colors.primary : colors.text,
              borderColor: activeTab === 'materials' ? colors.primary : 'transparent',
              background: activeTab === 'materials' ? (isDarkMode ? colors.surface : '#fff') : 'transparent'
            }}
          >
            <FaImages className="me-2" />
            Campaign Materials
            {materials.length > 0 && (
              <span className="badge bg-primary ms-2">{materials.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
            style={{
              color: activeTab === 'stats' ? colors.primary : colors.text,
              borderColor: activeTab === 'stats' ? colors.primary : 'transparent',
              background: activeTab === 'stats' ? (isDarkMode ? colors.surface : '#fff') : 'transparent'
            }}
          >
            <FaChartBar className="me-2" />
            Statistics
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'info' && (
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
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="row">
          <div className="col-12">
            {loadingMaterials ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status" style={{ color: colors.primary }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : materials.length === 0 ? (
              <div
                className="card"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '12px'
                }}
              >
                <div className="card-body text-center py-5">
                  <FaImages size={60} style={{ color: colors.textSecondary, opacity: 0.3 }} />
                  <p className="mt-3 text-muted">No campaign materials uploaded yet</p>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {materials.map((material, index) => (
                  <div key={index} className="col-12 col-md-6 col-lg-4">
                    <div
                      className="card h-100"
                      style={{
                        background: isDarkMode ? colors.surface : '#fff',
                        border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = isDarkMode
                          ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                          : '0 10px 30px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Material Image/Preview */}
                      <div
                        style={{
                          height: '200px',
                          background: isDarkMode ? colors.background : '#f8f9fa',
                          borderRadius: '12px 12px 0 0',
                          overflow: 'hidden',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {material.file?.endsWith('.pdf') ? (
                          <FaFileAlt size={60} style={{ color: '#ef4444' }} />
                        ) : (
                          <img
                            src={getImageUrl(material.file)}
                            alt={material.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"><i class="fas fa-image" style="font-size: 60px; color: #6b7280;"></i></div>';
                            }}
                          />
                        )}

                        {/* Category Badge */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            background: 'rgba(59, 130, 246, 0.9)',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        >
                          {material.category}
                        </span>
                      </div>

                      <div className="card-body p-3">
                        <h6
                          className="mb-2"
                          style={{
                            color: colors.text,
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {material.title}
                        </h6>
                        {material.description && (
                          <p
                            className="mb-3"
                            style={{
                              fontSize: '0.85rem',
                              color: colors.textSecondary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {material.description}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm flex-grow-1"
                            style={{
                              background: colors.primary,
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem'
                            }}
                            onClick={() => window.open(getImageUrl(material.file), '_blank')}
                          >
                            <FaEye className="me-1" />
                            View
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: isDarkMode ? colors.surface : '#f8f9fa',
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                              borderRadius: '8px',
                              padding: '0.5rem'
                            }}
                            onClick={() => handleDownloadMaterial(material)}
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="row g-4">
          <div className="col-12">
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
                  <FaChartBar className="me-2" />
                  Campaign Performance
                </h5>

                <div className="row g-4">
                  {/* Tasks Overview */}
                  <div className="col-12 col-md-4">
                    <div
                      style={{
                        padding: '1.5rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      <FaTasks size={40} style={{ opacity: 0.9, marginBottom: '1rem' }} />
                      <h2 className="mb-1">{candidate.tasksActive || 0}</h2>
                      <p className="mb-0" style={{ opacity: 0.9 }}>Active Tasks</p>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div
                      style={{
                        padding: '1.5rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      <FaTrophy size={40} style={{ opacity: 0.9, marginBottom: '1rem' }} />
                      <h2 className="mb-1">{candidate.tasksCompleted || 0}</h2>
                      <p className="mb-0" style={{ opacity: 0.9 }}>Completed Tasks</p>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div
                      style={{
                        padding: '1.5rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      <FaUsers size={40} style={{ opacity: 0.9, marginBottom: '1rem' }} />
                      <h2 className="mb-1">{materials.length}</h2>
                      <p className="mb-0" style={{ opacity: 0.9 }}>Campaign Materials</p>
                    </div>
                  </div>
                </div>

                {/* Task Completion Rate */}
                <div className="mt-4">
                  <h6 className="mb-3" style={{ color: colors.text }}>Task Completion Rate</h6>
                  <div className="progress" style={{ height: '30px', borderRadius: '10px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${
                          candidate.tasksActive + candidate.tasksCompleted > 0
                            ? ((candidate.tasksCompleted || 0) /
                                ((candidate.tasksActive || 0) + (candidate.tasksCompleted || 0))) *
                              100
                            : 0
                        }%`,
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {candidate.tasksActive + candidate.tasksCompleted > 0
                        ? Math.round(
                            ((candidate.tasksCompleted || 0) /
                              ((candidate.tasksActive || 0) + (candidate.tasksCompleted || 0))) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="row g-3 mt-3">
                  <div className="col-12 col-md-6">
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: isDarkMode ? colors.background : '#f8f9fa',
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <small className="text-muted d-block mb-1">Role Status</small>
                      <span
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '20px',
                          background: candidate.role === 'coordinator' ? '#8b5cf630' : '#3b82f630',
                          color: candidate.role === 'coordinator' ? '#8b5cf6' : '#3b82f6',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {candidate.role}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: isDarkMode ? colors.background : '#f8f9fa',
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <small className="text-muted d-block mb-1">Campaign Status</small>
                      <span
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '20px',
                          background: candidate.status === 'active' ? '#10b98130' : '#6b728030',
                          color: candidate.status === 'active' ? '#10b981' : '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {candidate.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-12 mb-4">
                    <CampaignAnalytics
                      agentPermissions={Array.isArray(candidate.permissions) ? candidate.permissions : Object.entries(candidate.permissions || {}).filter(([k, v]) => v).map(([k]) => k)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCandidates;
