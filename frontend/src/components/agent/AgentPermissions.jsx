import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaUnlock,
  FaFileUpload,
  FaComments,
  FaQuestion,
  FaChartBar,
  FaTasks,
  FaClock,
  FaShieldAlt
} from 'react-icons/fa';

const AgentPermissions = ({ permissions, candidateName, agentRole }) => {
  const { isDarkMode, colors } = useTheme();

  const permissionMap = [
    {
      key: 'updateMaterials',
      name: 'Update Materials',
      description: 'Upload, edit, and manage campaign materials',
      icon: FaFileUpload,
      color: '#3b82f6'
    },
    {
      key: 'postUpdates',
      name: 'Post Updates',
      description: 'Send campaign messages and announcements',
      icon: FaComments,
      color: '#10b981'
    },
    {
      key: 'respondToQuestions',
      name: 'Respond to Questions',
      description: 'Answer voter questions and inquiries',
      icon: FaQuestion,
      color: '#f59e0b'
    },
    {
      key: 'viewStatistics',
      name: 'View Statistics',
      description: 'Access campaign analytics and performance data',
      icon: FaChartBar,
      color: '#8b5cf6'
    },
    {
      key: 'manageTasks',
      name: 'Manage Tasks',
      description: 'Create, assign, and track campaign tasks',
      icon: FaTasks,
      color: '#ec4899'
    }
  ];

  const hasPermission = (key) => permissions?.includes(key) || false;

  return (
    <div
      className="card"
      style={{
        background: isDarkMode ? colors.surface : '#fff',
        border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
        borderRadius: '12px'
      }}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="mb-4">
          <h5 className="mb-2" style={{ color: colors.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaShieldAlt style={{ color: '#3b82f6' }} />
            Agent Permissions
          </h5>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.95rem' }}>
            {candidateName && <>
              Assigned to: <strong>{candidateName}</strong>
            </>}
            {agentRole && <>
              {candidateName && ' • '}
              Role: <strong className="text-capitalize">{agentRole}</strong>
            </>}
          </p>
        </div>

        {/* Summary Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: isDarkMode ? colors.background : '#f8f9fa',
              border: `1px solid ${colors.border}`,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {permissions.length}
            </div>
            <small style={{ color: colors.textSecondary }}>/ 5 Permissions</small>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: isDarkMode ? colors.background : '#f8f9fa',
              border: `1px solid ${colors.border}`,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {Math.round((permissions.length / 5) * 100)}%
            </div>
            <small style={{ color: colors.textSecondary }}>Permission Level</small>
          </div>
        </div>

        {/* Permissions Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}
        >
          {permissionMap.map((permission) => {
            const isGranted = hasPermission(permission.key);
            const Icon = permission.icon;

            return (
              <div
                key={permission.key}
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: isDarkMode ? colors.background : '#f8f9fa',
                  border: `2px solid ${isGranted ? permission.color : isDarkMode ? colors.border : '#e9ecef'}`,
                  position: 'relative',
                  opacity: isGranted ? 1 : 0.65,
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Status Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isGranted ? permission.color : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {isGranted ? (
                    <FaCheckCircle size={16} />
                  ) : (
                    <FaTimesCircle size={16} />
                  )}
                </div>

                {/* Icon & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: `${permission.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: permission.color
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h6 style={{ color: colors.text, fontWeight: 600, margin: 0 }}>
                    {permission.name}
                  </h6>
                </div>

                {/* Description */}
                <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
                  {permission.description}
                </p>

                {/* Status Text */}
                <div
                  style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: isGranted ? '#10b981' : '#6b7280'
                  }}
                >
                  {isGranted ? (
                    <>
                      <FaUnlock size={12} />
                      Enabled
                    </>
                  ) : (
                    <>
                      <FaLock size={12} />
                      Disabled
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            borderRadius: '8px',
            background: isDarkMode ? colors.background : '#f0f9ff',
            border: `1px solid ${isDarkMode ? colors.border : '#bfdbfe'}`,
            fontSize: '0.85rem',
            color: isDarkMode ? colors.textSecondary : '#1e40af'
          }}
        >
          <strong>💡 Tip:</strong> Permissions are managed by your candidate. If you need additional permissions, contact them to request access to specific features.
        </div>
      </div>
    </div>
  );
};

export default AgentPermissions;
