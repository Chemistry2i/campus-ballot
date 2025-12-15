import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  FaHome,
  FaTasks,
  FaRoute,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaMoon,
  FaSun
} from 'react-icons/fa';

// Import agent components
import AgentDashboardMain from '../components/agent/AgentDashboard';
import TaskManagement from '../components/agent/TaskManagement';
import VoterOutreach from '../components/agent/VoterOutreach';

const AgentDashboard = ({ user, onLogout }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { path: '/agent', icon: FaHome, label: 'Dashboard', exact: true },
    { path: '/agent/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/agent/outreach', icon: FaRoute, label: 'Outreach' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.background }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '250px' : '0',
          background: isDarkMode ? colors.surface : '#fff',
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 0.3s',
          overflow: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000
        }}
      >
        <div style={{ padding: '1.5rem' }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="fw-bold mb-0" style={{ color: colors.text }}>
              Agent Portal
            </h4>
            <button
              className="btn btn-sm"
              onClick={() => setSidebarOpen(false)}
              style={{ color: colors.text }}
            >
              <FaTimes />
            </button>
          </div>

          {/* User Info */}
          <div
            className="mb-4 p-3"
            style={{
              background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
              borderRadius: '8px'
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                margin: '0 auto 0.5rem'
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-center">
              <div className="fw-semibold" style={{ color: colors.text }}>
                {user?.name || 'Campaign Agent'}
              </div>
              <small className="text-muted">{user?.email}</small>
            </div>
          </div>

          {/* Menu Items */}
          <nav>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: colors.text,
                  background: window.location.pathname === item.path
                    ? colors.primary
                    : 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (window.location.pathname !== item.path) {
                    e.currentTarget.style.background = colors.sidebarHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.location.pathname !== item.path) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <item.icon className="me-2" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <button
              className="btn btn-sm w-100 mb-2"
              onClick={toggleTheme}
              style={{
                background: colors.surfaceHover,
                color: colors.text,
                border: 'none'
              }}
            >
              {isDarkMode ? <FaSun className="me-2" /> : <FaMoon className="me-2" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              className="btn btn-sm btn-danger w-100"
              onClick={onLogout}
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? '250px' : '0',
          transition: 'margin-left 0.3s'
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            background: isDarkMode ? colors.surface : '#fff',
            borderBottom: `1px solid ${colors.border}`,
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            className="btn btn-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: colors.text }}
          >
            <FaBars size={20} />
          </button>
          <h5 className="mb-0" style={{ color: colors.text }}>
            Campaign Agent
          </h5>
        </div>

        {/* Routes */}
        <div style={{ padding: '1.5rem' }}>
          <Routes>
            <Route path="/" element={<AgentDashboardMain />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/outreach" element={<VoterOutreach />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
