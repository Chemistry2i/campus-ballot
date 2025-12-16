import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SimpleCandidateTest = ({ user, onLogout }) => {
  const { colors } = useTheme();

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: colors.background }}>
      <h1 style={{ color: colors.text }}>🎯 Candidate Dashboard Test</h1>
      <div style={{ 
        background: colors.surface, 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3 style={{ color: colors.text }}>✅ Dashboard Working!</h3>
        <p style={{ color: colors.text }}>User: {user?.name}</p>
        <p style={{ color: colors.text }}>Email: {user?.email}</p>
        <p style={{ color: colors.text }}>Role: {user?.role}</p>
        <button 
          onClick={onLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            marginTop: '10px'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SimpleCandidateTest;