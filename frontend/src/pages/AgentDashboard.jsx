import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { confirmLogout } from '../utils/sweetAlerts';
import RoleSwitcher from '../components/common/RoleSwitcher';
import {
  FaHome,
  FaTasks,
  FaRoute,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaUserTie
} from 'react-icons/fa';

// Import agent components
import AgentHeader from '../components/agent/AgentHeader';
import AgentDashboardMain from '../components/agent/AgentDashboard';
import TaskManagement from '../components/agent/TaskManagement';
import VoterOutreach from '../components/agent/VoterOutreach';

const AgentDashboard = ({ user, onLogout }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/agent', icon: FaHome, label: 'Dashboard', exact: true },
    { path: '/agent/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/agent/outreach', icon: FaRoute, label: 'Outreach' }
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout(isDarkMode);
    if (confirmed) {
      onLogout();
    }
  };

  return (
    <div className="agent-page-root" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: colors.background,
      width: '100%'
    }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? '70px' : 'clamp(220px, 20vw, 280px)',
          background: isDarkMode ? colors.surface : '#fff',
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 0.3s ease',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <div style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', flex: 1, overflowY: 'auto' }}>
          {/* Header with collapse button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(1rem, 2vw, 1.5rem)' }}>
            {!sidebarCollapsed && (
              <h4 className="fw-bold mb-0" style={{ 
                color: colors.text,
                fontSize: 'clamp(1.1rem, 2vw, 1.3rem)'
              }}>
                <FaUserTie style={{ marginRight: '0.5rem', color: '#8b5cf6' }} />
                Agent Portal
              </h4>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: colors.text,
                marginLeft: sidebarCollapsed ? 'auto' : '0',
                marginRight: sidebarCollapsed ? 'auto' : '0'
              }}
            >
              {sidebarCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
            </button>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div
              style={{
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: `linear-gradient(135deg, ${isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)'}, ${isDarkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)'})`,
                borderRadius: 'clamp(8px, 1.5vw, 12px)',
                border: `1px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`
              }}
            >
              <div
                style={{
                  width: 'clamp(50px, 8vw, 60px)',
                  height: 'clamp(50px, 8vw, 60px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                  margin: '0 auto clamp(0.5rem, 1vw, 0.75rem)'
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-center">
                <div className="fw-semibold" style={{ 
                  color: colors.text,
                  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                  marginBottom: '0.25rem'
                }}>
                  {user?.name || 'Campaign Agent'}
                </div>
                <small style={{ 
                  color: colors.textSecondary,
                  fontSize: 'clamp(0.75rem, 1.3vw, 0.8rem)'
                }}>
                  {user?.email}
                </small>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <nav style={{ marginBottom: 'auto' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: sidebarCollapsed ? '0' : 'clamp(0.75rem, 1.5vw, 1rem)',
                    padding: sidebarCollapsed ? '0.75rem' : 'clamp(0.75rem, 1.5vw, 1rem)',
                    marginBottom: '0.5rem',
                    borderRadius: 'clamp(6px, 1vw, 8px)',
                    textDecoration: 'none',
                    color: active ? '#8b5cf6' : colors.text,
                    background: active 
                      ? (isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)')
                      : 'transparent',
                    borderLeft: active ? '3px solid #8b5cf6' : '3px solid transparent',
                    fontWeight: active ? 600 : 400,
                    fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ 
          padding: 'clamp(0.75rem, 2vw, 1rem)',
          borderTop: `1px solid ${colors.border}`,
          background: isDarkMode ? 'rgba(0,0,0,0.2)' : '#f9fafb'
        }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '0.75rem' }}>
              <RoleSwitcher user={user} isDarkMode={isDarkMode} colors={colors} />
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            flexDirection: sidebarCollapsed ? 'column' : 'row'
          }}>
            <button
              onClick={toggleTheme}
              style={{
                flex: sidebarCollapsed ? 'none' : 1,
                width: sidebarCollapsed ? '100%' : 'auto',
                padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                border: 'none',
                borderRadius: 'clamp(6px, 1vw, 8px)',
                color: colors.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.15)' : '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
              }}
            >
              {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
              {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{isDarkMode ? 'Light' : 'Dark'}</span>}
            </button>

            <button
              onClick={handleLogout}
              style={{
                flex: sidebarCollapsed ? 'none' : 1,
                width: sidebarCollapsed ? '100%' : 'auto',
                padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'clamp(6px, 1vw, 8px)',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <FaSignOutAlt size={16} />
              {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        marginLeft: sidebarCollapsed ? '70px' : 'clamp(220px, 20vw, 280px)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        <AgentHeader user={user} onLogout={onLogout} />
        
        <main style={{ 
          flex: 1,
          overflow: 'auto'
        }}>
          <Routes>
            <Route path="/" element={<AgentDashboardMain />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/outreach" element={<VoterOutreach />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
