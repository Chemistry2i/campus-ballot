import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-outline-secondary ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <FontAwesomeIcon 
          icon={isDarkMode ? faSun : faMoon} 
          style={{
            transition: 'transform 0.3s ease',
            transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
        {showLabel && (
          <span className="d-none d-sm-inline">
            {isDarkMode ? 'Light' : 'Dark'}
          </span>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
