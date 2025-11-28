import React from 'react';
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

export default function SuperAdminSidebar() {
  const location = useLocation();

  return (
    <aside className="superadmin-sidebar bg-white shadow-sm" style={{ minWidth: 220, height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100 }}>
      <div className="sidebar-header text-center py-4">
        <span className="fw-bold fs-4" style={{ color: '#2563eb' }}>Super Admin</span>
        <div className="mt-2">
          <span className="badge bg-danger">super_admin</span>
        </div>
      </div>
      <nav className="nav flex-column px-3">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-link d-flex align-items-center mb-2 ${location.pathname === item.to ? 'active fw-bold text-primary' : 'text-dark'}`}
            style={{ fontSize: '1rem', gap: '0.7rem' }}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <style>{`
        .superadmin-sidebar { background: #fff; border-right: 1px solid #eee; }
        .superadmin-sidebar .nav-link.active { background: #f0f4ff; border-radius: 6px; }
        .superadmin-sidebar .nav-link:hover { background: #f8f9fa; border-radius: 6px; }
      `}</style>
    </aside>
  );
}
