import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationTriangle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />
  };

  const colors = {
    success: { bg: '#10b981', border: '#059669' },
    error: { bg: '#ef4444', border: '#dc2626' },
    warning: { bg: '#f59e0b', border: '#d97706' },
    info: { bg: '#3b82f6', border: '#2563eb' }
  };

  return (
    <div
      className="toast-item animate-slide-in"
      style={{
        background: colors[type].bg,
        borderLeft: `4px solid ${colors[type].border}`,
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '400px',
        marginBottom: '10px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div style={{ fontSize: '20px' }}>{icons[type]}</div>
      <div style={{ flex: 1, fontSize: '14px' }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
