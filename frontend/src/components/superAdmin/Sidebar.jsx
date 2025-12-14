import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';


const navItems = [
  { label: 'System Health', icon: 'fa-solid fa-heartbeat', to: '/super-admin/system-health' },
  { label: 'Dashboard', icon: 'fa-solid fa-gauge', to: '/super-admin/dashboard' },
  { label: 'Manage Admins', icon: 'fa-solid fa-user-shield', to: '/super-admin/manage-admins' },
  { label: 'Admin Activity', icon: 'fa-solid fa-video', to: '/super-admin/admin-activity' },
  { label: 'Security Audit', icon: 'fa-solid fa-lock', to: '/super-admin/security-audit' },
  { label: 'Backup & Recovery', icon: 'fa-solid fa-shield', to: '/super-admin/backup-recovery' },
  { label: 'System Config', icon: 'fa-solid fa-sliders', to: '/super-admin/system-config' },
  { label: 'Global Settings', icon: 'fa-solid fa-cogs', to: '/super-admin/global-settings' },
  { label: 'Audit Logs', icon: 'fa-solid fa-clipboard-list', to: '/super-admin/audit-logs' },
  { label: 'Election Oversight', icon: 'fa-solid fa-check-to-slot', to: '/super-admin/election-oversight' },
  { label: 'Data Maintenance', icon: 'fa-solid fa-database', to: '/super-admin/data-maintenance' },
  { label: 'Reporting', icon: 'fa-solid fa-chart-line', to: '/super-admin/reporting' },
  { label: 'Help', icon: 'fa-solid fa-circle-question', to: '/super-admin/help' },
];

export default function SuperAdminSidebar({ user, collapsed, setCollapsed, isMobile }) {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [logCount, setLogCount] = useState(0);
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    const fetchLogCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/logs/count', { headers: { Authorization: `Bearer ${token}` } });
        setLogCount(res.data.count || 0);
      } catch (err) {
        console.error('Error fetching log count', err);
      }
    };
    fetchLogCount();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA';

  // Accessibility: keyboard navigation
  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter' || e.key === ' ') {
      document.querySelectorAll('.sidebar-nav-link')[idx].click();
    }
  };

  return (
    <>
      {/* Overlay for mobile drawer */}
      {isMobile && !collapsed && (
        <div
          className="superadmin-sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.08)',
            zIndex: 99,
          }}
          onClick={() => setCollapsed(true)}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={`superadmin-sidebar shadow-sm${collapsed ? ' collapsed' : ''}`}
        style={{
          minWidth: collapsed ? 64 : 280,
          width: collapsed ? 64 : 280,
          height: '100vh',
          position: 'fixed',
          left: isMobile && collapsed ? -280 : 0,
          top: 0,
          zIndex: 100,
          transition: 'left 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s, width 0.3s',
          boxShadow: isDarkMode ? '0 0 12px rgba(0,0,0,0.3)' : '0 0 12px rgba(37,99,235,0.07)',
          background: isDarkMode ? 'linear-gradient(180deg, #1e293b 0%, #334155 100%)' : '#fff',
          color: colors.text,
          borderRight: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden'
        }}
        aria-label="Super Admin Sidebar"
      >
        <div className="sidebar-header text-center" style={{ padding: collapsed ? '0.5rem 0' : '1rem 0', position: 'relative' }}>
          {/* Avatar/Profile Dropdown */}
          <div
            className="avatar bg-primary text-white mx-auto mb-2"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: collapsed ? 0 : 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              position: 'relative'
            }}
            tabIndex={0}
            aria-label="Profile menu"
            onClick={() => setShowDropdown(!showDropdown)}
            onBlur={() => setShowDropdown(false)}
          >
            {initials}
            {/* Dropdown */}
            {!collapsed && showDropdown && (
              <div
                className="profile-dropdown"
                style={{
                  position: 'absolute',
                  top: 60,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: colors.surface,
                  color: colors.text,
                  borderRadius: 8,
                  boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.12)',
                  minWidth: 160,
                  zIndex: 200,
                  padding: '0.5rem 0',
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="dropdown-item px-3 py-2" style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-user me-2"></i> Profile
                </div>
                <div className="dropdown-item px-3 py-2" style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-gear me-2"></i> Settings
                </div>
                <div className="dropdown-item px-3 py-2" style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-right-from-bracket me-2"></i> Logout
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <>
              {/* Logo/Brand */}
              <span className="fw-bold" style={{ fontSize: '1.45rem', color: '#2563eb', letterSpacing: '-1px' }}>
                <i className="fa-solid fa-graduation-cap me-2"></i>Super Admin
              </span>
              <div className="mt-2 mb-2">
                <span className="badge bg-danger" style={{ fontSize: '0.95rem', fontWeight: 600 }}>super_admin</span>
              </div>
              <div className="text-muted small mb-2" style={{ fontWeight: 500 }}>
                Welcome, {user?.name || 'Super Admin'}
              </div>
            </>
          )}
          {/* Collapse/Expand Button */}
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{
              position: 'absolute',
              top: 12,
              right: collapsed ? 8 : 16,
              width: collapsed ? 32 : 40,
              zIndex: 101,
              transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)'
            }}
            onClick={() => setCollapsed(!collapsed)} // This line is correct
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}
              style={{
                transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
                transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)'
              }}
            ></i>
          </button>
        </div>
        <nav className="nav flex-column px-2" role="navigation" aria-label="Sidebar navigation" style={{ overflowY: 'auto', flex: 1, paddingBottom: '0.5rem', scrollbarWidth: 'thin', scrollbarColor: `${isDarkMode ? '#475569 #1e293b' : '#cbd5e1 #f1f5f9'}` }}>
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
              <div key={item.to} style={{ position: 'relative' }}>
                {/* Active indicator */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 6,
                      height: 32,
                      borderRadius: 4,
                      background: '#2563eb',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.12)'
                    }}
                    aria-hidden="true"
                  />
                )}
                <Link
                  to={item.to}
                  className={`sidebar-nav-link nav-link d-flex align-items-center mb-2 ${isActive ? 'active fw-bold' : ''}`}
                  style={{
                    fontSize: '1em',
                    gap: '1rem',
                    padding: collapsed ? '0.5rem 0.5rem' : '0.6rem 1rem',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 4,
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? (isDarkMode ? colors.sidebarHover : '#e7f1ff') : 'transparent',
                    boxShadow: isActive ? (isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(37,99,235,0.07)') : 'none',
                    minWidth: collapsed ? 0 : 220,
                    outline: 'none',
                    color: colors.text,
                    borderLeft: isActive ? `3px solid ${colors.primary}` : 'none'
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  tabIndex={0}
                  onKeyDown={e => handleKeyDown(e, idx)}
                  onClick={() => isMobile && setCollapsed(true)}
                  title={collapsed ? item.label : undefined}
                >
                  <i className={item.icon} style={{ fontSize: collapsed ? '1.5rem' : '1rem', color: colors.primary }}></i>
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', color: colors.text }}>{item.label}</span>}
                  {/* Badge for Audit Logs */}
                  {item.label === 'Audit Logs' && logCount > 0 && !collapsed && (
                    <span className="badge bg-danger ms-auto" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {logCount}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
        {/* Footer */}
        {!collapsed && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderTop: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.textMuted,
              fontSize: '0.7rem',
              textAlign: 'center',
              flexShrink: 0
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <i className="fa fa-book-open" style={{ marginRight: '0.25rem' }}></i>
              v1.0.0 © 2025 VoteSys
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '0.25rem',
              }}
            >
              <i className="fa fa-sign-out-alt" style={{ marginRight: '0.25rem' }}></i>
              Logout
            </button>
          </div>
        )}
        <style>{`
          .superadmin-sidebar { background: #fff; border-right: 1px solid #eee; }
          .superadmin-sidebar .nav-link.active { background: #e7f1ff; border-radius: 12px; }
          .superadmin-sidebar .nav-link,
          .superadmin-sidebar .nav-link.active {
            color: #2563eb !important;
            font-size: 1em !important; /* <-- changed from 1.08rem to 1em */
            padding: 0.85rem 1.5rem;
            border-radius: 12px;
            transition: background 0.18s, border-left 0.18s;
            outline: none;
          }
          .superadmin-sidebar .nav-link:hover { background: #f8f9fa; border-radius: 12px; color: #2563eb !important; }
          .superadmin-sidebar.collapsed .sidebar-header .fw-bold,
          .superadmin-sidebar.collapsed .sidebar-header .badge,
          .superadmin-sidebar.collapsed .sidebar-header .mb-2,
          .superadmin-sidebar.collapsed .sidebar-header .small,
          .superadmin-sidebar.collapsed .sidebar-footer {
            display: none !important;
          }
          .profile-dropdown .dropdown-item:hover {
            background: #f0f4ff;
            color: #2563eb;
          }
          .superadmin-sidebar-overlay {
            display: none;
          }
          .superadmin-sidebar-overlay.show {
            display: block;
          }
          @media (max-width: 992px) {
            .superadmin-sidebar {
              left: ${collapsed ? '-280px' : '0'} !important;
              min-width: ${collapsed ? '64px' : '280px'} !important;
              width: ${collapsed ? '64px' : '280px'} !important;
              transition: left 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s, width 0.3s;
            }
            .superadmin-sidebar-overlay {
              display: ${collapsed ? 'none' : 'block'};
            }
          }
        `}</style>
      </aside>
      {/* Floating button to open sidebar when collapsed on mobile */}
      {isMobile && collapsed && (
        <button
          className="btn btn-primary"
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 102,
            borderRadius: '50%',
            width: 48,
            height: 48,
            boxShadow: '0 2px 8px rgba(37,99,235,0.15)'
          }}
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      )}
    </>
  );
}
