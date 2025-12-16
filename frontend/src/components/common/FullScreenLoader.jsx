import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const FullScreenLoader = ({ message = 'Loading...', size = 'large' }) => {
  const { colors } = useTheme();

  const sizeConfig = {
    small: { spinner: '1rem', padding: '1rem' },
    medium: { spinner: '1.5rem', padding: '2rem' },
    large: { spinner: '2rem', padding: '3rem' }
  };

  const config = sizeConfig[size] || sizeConfig.large;

  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: colors.background,
        padding: config.padding,
        color: colors.text
      }}
    >
      <div 
        className="spinner-border text-primary mb-3" 
        role="status"
        style={{
          width: config.spinner,
          height: config.spinner
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mb-0" style={{ 
        color: colors.textSecondary,
        fontSize: '0.9rem'
      }}>
        {message}
      </p>
    </div>
  );
};

export default FullScreenLoader;