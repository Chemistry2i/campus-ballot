import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: 'fa-solid fa-gauge', to: '/super-admin/dashboard' },
  { label: 'Manage Admins', icon: 'fa-solid fa-user-shield', to: '/super-admin/manage-admins' },
  { label: 'Global Settings', icon: 'fa-solid fa-sliders', to: '/super-admin/global-settings' },
  { label: 'Audit Logs', icon: 'fa-solid fa-clipboard-list', to: '/super-admin/audit-logs' },
  { label: 'Election Oversight', icon: 'fa-solid fa-check-to-slot', to: '/super-admin/election-oversight' },
  { label: 'Data Maintenance', icon: 'fa-solid fa-database', to: '/super-admin/data-maintenance' },
  { label: 'Reporting', icon: 'fa-solid fa-chart-line', to: '/super-admin/reporting' },
  { label: 'Help', icon: 'fa-solid fa-circle-question', to: '/super-admin/help' },
];

export default function SuperAdminSidebar({ user }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Get initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA';

  return (
    <aside
      className={`superadmin-sidebar bg-white shadow-sm${collapsed ? ' collapsed' : ''}`}
      style={{
        minWidth: collapsed ? 64 : 240,
        width: collapsed ? 64 : 240,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        transition: 'min-width 0.2s, width 0.2s'
      }}
    >
      <div className="sidebar-header text-center py-4" style={{ padding: collapsed ? '1rem 0' : '2rem 0' }}>
        <div
          className="avatar bg-primary text-white mx-auto mb-2"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            fontSize: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: collapsed ? 0 : 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          {initials}
        </div>
        {!collapsed && (
          <>
            <span className="fw-bold" style={{ fontSize: '1.45rem', color: '#2563eb', letterSpacing: '-1px' }}>Super Admin</span>
            <div className="mt-2 mb-2">
              <span className="badge bg-danger" style={{ fontSize: '0.95rem', fontWeight: 600 }}>super_admin</span>
            </div>
            <div className="text-muted small mb-2" style={{ fontWeight: 500 }}>
              {user?.name || 'Super Admin'}
            </div>
            <div className="text-muted small" style={{ fontSize: '0.93rem' }}>
              {user?.email}
            </div>
          </>
        )}
        <button
          className="btn btn-sm btn-outline-secondary mt-3"
          style={{ width: collapsed ? 32 : 48 }}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>
      <nav className="nav flex-column px-2">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-link d-flex align-items-center mb-2 ${location.pathname === item.to ? 'active fw-bold text-primary' : 'text-dark'}`}
            style={{
              fontSize: '1.08rem',
              gap: '0.85rem',
              padding: collapsed ? '0.85rem 0.5rem' : '0.85rem 1.2rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10,
              fontWeight: location.pathname === item.to ? 700 : 500,
              background: location.pathname === item.to ? '#f0f4ff' : 'transparent',
              boxShadow: location.pathname === item.to ? '0 2px 8px rgba(37,99,235,0.07)' : 'none',
              transition: 'all 0.18s'
            }}
            aria-current={location.pathname === item.to ? 'page' : undefined}
          >
            <i className={item.icon} style={{ fontSize: '1.2rem' }}></i>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      <style>{`
        .superadmin-sidebar { background: #fff; border-right: 1px solid #eee; }
        .superadmin-sidebar .nav-link.active { background: #f0f4ff; border-radius: 10px; }
        .superadmin-sidebar .nav-link:hover { background: #f8f9fa; border-radius: 10px; }
        .superadmin-sidebar.collapsed .sidebar-header .fw-bold,
        .superadmin-sidebar.collapsed .sidebar-header .badge,
        .superadmin-sidebar.collapsed .sidebar-header .mb-2,
        .superadmin-sidebar.collapsed .sidebar-header .small {
          display: none !important;
        }
        @media (max-width: 768px) {
          .superadmin-sidebar { min-width: 0 !important; width: 0 !important; position: absolute; }
        }
      `}</style>
    </aside>
  );
}
