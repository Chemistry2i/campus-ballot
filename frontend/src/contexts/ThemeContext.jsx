import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('adminDarkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save to localStorage whenever theme changes
    localStorage.setItem('adminDarkMode', JSON.stringify(isDarkMode));
    
    // Apply theme class to body
    if (isDarkMode) {
      document.body.classList.add('admin-dark-mode');
      document.body.classList.remove('admin-light-mode');
    } else {
      document.body.classList.add('admin-light-mode');
      document.body.classList.remove('admin-dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // Dark theme colors
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#374151',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      sidebar: '#1e293b',
      sidebarHover: 'rgba(59, 130, 246, 0.1)',
      cardBg: '#1e293b',
      modalBg: 'rgba(15, 23, 42, 0.9)',
      inputBg: '#334155',
      inputBorder: '#475569',
    } : {
      // Light theme colors
      background: '#f8f9fc',
      surface: '#ffffff',
      surfaceHover: '#f1f5f9',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#4b5563',
      textMuted: '#6b7280',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0891b2',
      sidebar: '#ffffff',
      sidebarHover: '#eff6ff',
      cardBg: '#ffffff',
      modalBg: 'rgba(0, 0, 0, 0.5)',
      inputBg: '#ffffff',
      inputBorder: '#d1d5db',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
