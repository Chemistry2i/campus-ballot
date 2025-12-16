import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const TestingRoutes = ({ user, onLogout }) => {
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);

  const testRoutes = {
    candidate: [
      { path: '/candidate', label: 'Main Dashboard', description: 'Candidate overview with statistics and quick actions' },
      { path: '/candidate/profile', label: 'Campaign Profile', description: 'Edit candidate profile, promises, and qualifications' },
      { path: '/candidate/materials', label: 'Campaign Materials', description: 'Upload and manage campaign content' },
      { path: '/candidate/agents', label: 'Agent Management', description: 'Manage campaign team members' },
      { path: '/candidate/stats', label: 'Election Statistics', description: 'View comprehensive election statistics' }
    ],
    agent: [
      { path: '/agent', label: 'Agent Dashboard', description: 'Agent overview and task management' },
      { path: '/agent/tasks', label: 'Task Management', description: 'View and manage assigned campaign tasks' },
      { path: '/agent/reports', label: 'Campaign Reports', description: 'Generate and view campaign reports' }
    ]
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      background: colors.background,
      color: colors.text 
    }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-2" style={{ color: colors.text }}>
            🚀 Dashboard Testing Routes
          </h1>
          <p className="text-muted mb-0">Test and explore candidate and agent dashboard functionality</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <button
            onClick={toggleTheme}
            className="btn btn-outline-secondary"
            style={{
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: 'transparent'
            }}
          >
            {isDarkMode ? '☀️' : '🌙'} {isDarkMode ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={onLogout}
            className="btn btn-danger"
            style={{
              backgroundColor: '#dc3545',
              borderColor: '#dc3545',
              color: '#fff'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Current User Info */}
      <div 
        className="mb-4 p-3 rounded"
        style={{ 
          background: colors.surface, 
          border: `1px solid ${colors.border}`
        }}
      >
        <h5 className="fw-bold mb-3" style={{ color: colors.text }}>
          👤 Current User Session
        </h5>
        <div className="row">
          <div className="col-md-4">
            <strong>Name:</strong> {user?.name || 'N/A'}
          </div>
          <div className="col-md-4">
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div className="col-md-4">
            <strong>Role:</strong> 
            <span className="badge bg-primary ms-2">{user?.role || 'N/A'}</span>
            {user?.additionalRoles?.length > 0 && (
              <div className="mt-1">
                {user.additionalRoles.map(role => (
                  <span key={role} className="badge bg-secondary me-1">{role}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Testing Instructions */}
      <div 
        className="mb-4 p-3 rounded"
        style={{ 
          background: colors.surface, 
          border: `1px solid ${colors.border}`
        }}
      >
        <h5 className="fw-bold mb-3" style={{ color: colors.text }}>
          📋 Testing Instructions
        </h5>
        <ol className="mb-0">
          <li className="mb-2">
            <strong>Role-based Access:</strong> Make sure you're logged in with the appropriate role (candidate/agent)
          </li>
          <li className="mb-2">
            <strong>Navigation:</strong> Click on any route below to test that specific dashboard feature
          </li>
          <li className="mb-2">
            <strong>Responsive Design:</strong> Test on different screen sizes (mobile/tablet/desktop)
          </li>
          <li className="mb-2">
            <strong>Dark Mode:</strong> Toggle between light and dark themes to test visibility
          </li>
          <li className="mb-0">
            <strong>Functionality:</strong> Test CRUD operations, form submissions, and interactive elements
          </li>
        </ol>
      </div>

      {/* Candidate Routes */}
      <div 
        className="mb-4 p-4 rounded"
        style={{ 
          background: colors.surface, 
          border: `1px solid ${colors.border}`
        }}
      >
        <h4 className="fw-bold mb-3" style={{ color: colors.text }}>
          🎯 Candidate Dashboard Routes
        </h4>
        <div className="row g-3">
          {testRoutes.candidate.map((route, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div 
                className="card h-100"
                style={{ 
                  background: colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <div className="card-body">
                  <h6 className="card-title fw-bold" style={{ color: colors.text }}>
                    {route.label}
                  </h6>
                  <p className="card-text small text-muted mb-3">
                    {route.description}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleNavigate(route.path)}
                      className="btn btn-primary btn-sm flex-grow-1"
                      style={{
                        backgroundColor: '#0d6efd',
                        borderColor: '#0d6efd',
                        color: '#fff'
                      }}
                    >
                      Test Route
                    </button>
                    <button
                      onClick={() => copyToClipboard(route.path, route.path)}
                      className="btn btn-outline-secondary btn-sm"
                      style={{
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    >
                      {copied === route.path ? '✓' : '📋'}
                    </button>
                  </div>
                  <code 
                    className="d-block mt-2 p-2 rounded small"
                    style={{ 
                      background: colors.background,
                      color: colors.text,
                      fontSize: '0.75rem'
                    }}
                  >
                    {route.path}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Routes */}
      <div 
        className="mb-4 p-4 rounded"
        style={{ 
          background: colors.surface, 
          border: `1px solid ${colors.border}`
        }}
      >
        <h4 className="fw-bold mb-3" style={{ color: colors.text }}>
          🎖️ Agent Dashboard Routes
        </h4>
        <div className="row g-3">
          {testRoutes.agent.map((route, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div 
                className="card h-100"
                style={{ 
                  background: colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                <div className="card-body">
                  <h6 className="card-title fw-bold" style={{ color: colors.text }}>
                    {route.label}
                  </h6>
                  <p className="card-text small text-muted mb-3">
                    {route.description}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleNavigate(route.path)}
                      className="btn btn-success btn-sm flex-grow-1"
                      style={{
                        backgroundColor: '#198754',
                        borderColor: '#198754',
                        color: '#fff'
                      }}
                    >
                      Test Route
                    </button>
                    <button
                      onClick={() => copyToClipboard(route.path, route.path)}
                      className="btn btn-outline-secondary btn-sm"
                      style={{
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    >
                      {copied === route.path ? '✓' : '📋'}
                    </button>
                  </div>
                  <code 
                    className="d-block mt-2 p-2 rounded small"
                    style={{ 
                      background: colors.background,
                      color: colors.text,
                      fontSize: '0.75rem'
                    }}
                  >
                    {route.path}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backend API Endpoints */}
      <div 
        className="mb-4 p-4 rounded"
        style={{ 
          background: colors.surface, 
          border: `1px solid ${colors.border}`
        }}
      >
        <h4 className="fw-bold mb-3" style={{ color: colors.text }}>
          🔗 Backend API Endpoints
        </h4>
        <div className="row g-3">
          {[
            { method: 'POST', endpoint: '/api/auth/login', description: 'User authentication' },
            { method: 'GET', endpoint: '/api/candidates', description: 'Get candidate data' },
            { method: 'GET', endpoint: '/api/elections', description: 'Get elections' },
            { method: 'POST', endpoint: '/api/votes', description: 'Submit vote' },
            { method: 'GET', endpoint: '/api/admin/dashboard-stats', description: 'Dashboard statistics' }
          ].map((api, index) => (
            <div key={index} className="col-md-6">
              <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: colors.background }}>
                <div>
                  <span className={`badge me-2 ${api.method === 'GET' ? 'bg-success' : 'bg-primary'}`}>
                    {api.method}
                  </span>
                  <code style={{ color: colors.text, fontSize: '0.85rem' }}>
                    {api.endpoint}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(api.endpoint, api.endpoint)}
                  className="btn btn-sm btn-outline-secondary"
                  style={{
                    borderColor: colors.border,
                    color: colors.text,
                    fontSize: '0.75rem'
                  }}
                >
                  {copied === api.endpoint ? '✓' : '📋'}
                </button>
              </div>
              <small className="text-muted d-block mt-1 ms-2">{api.description}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div 
        className="text-center p-4 rounded"
        style={{ 
          background: colors.surface, 
          border: `1px solid ${colors.border}`
        }}
      >
        <h5 className="fw-bold mb-3" style={{ color: colors.text }}>
          🚀 Quick Access
        </h5>
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <button
            onClick={() => handleNavigate('/candidate')}
            className="btn btn-primary"
            style={{
              backgroundColor: '#0d6efd',
              borderColor: '#0d6efd',
              color: '#fff'
            }}
          >
            📊 Candidate Dashboard
          </button>
          <button
            onClick={() => handleNavigate('/agent')}
            className="btn btn-success"
            style={{
              backgroundColor: '#198754',
              borderColor: '#198754',
              color: '#fff'
            }}
          >
            🎖️ Agent Dashboard
          </button>
          <button
            onClick={() => handleNavigate('/admin')}
            className="btn btn-warning"
            style={{
              backgroundColor: '#ffc107',
              borderColor: '#ffc107',
              color: '#000'
            }}
          >
            👑 Admin Panel
          </button>
          <button
            onClick={() => window.open('/api-docs', '_blank')}
            className="btn btn-info"
            style={{
              backgroundColor: '#0dcaf0',
              borderColor: '#0dcaf0',
              color: '#000'
            }}
          >
            📚 API Docs
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestingRoutes;