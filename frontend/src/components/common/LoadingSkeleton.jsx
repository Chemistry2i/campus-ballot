import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const SkeletonCard = () => {
  const { isDarkMode, colors } = useTheme();
  
  return (
    <div className="col-md-6 col-lg-4">
      <div className="card shadow-sm h-100" style={{ 
        background: isDarkMode ? colors.surface : '#fff',
        borderRadius: '12px',
        border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`
      }}>
        <div className="card-body p-3">
          <div className="skeleton-pulse" style={{
            height: '24px',
            width: '70%',
            marginBottom: '12px',
            borderRadius: '4px',
            background: isDarkMode ? '#374151' : '#e5e7eb'
          }} />
          <div className="skeleton-pulse" style={{
            height: '16px',
            width: '100%',
            marginBottom: '8px',
            borderRadius: '4px',
            background: isDarkMode ? '#374151' : '#e5e7eb'
          }} />
          <div className="skeleton-pulse" style={{
            height: '16px',
            width: '85%',
            marginBottom: '16px',
            borderRadius: '4px',
            background: isDarkMode ? '#374151' : '#e5e7eb'
          }} />
          <div className="d-flex gap-2">
            <div className="skeleton-pulse" style={{
              height: '32px',
              width: '80px',
              borderRadius: '6px',
              background: isDarkMode ? '#374151' : '#e5e7eb'
            }} />
            <div className="skeleton-pulse" style={{
              height: '32px',
              width: '80px',
              borderRadius: '6px',
              background: isDarkMode ? '#374151' : '#e5e7eb'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonRow = () => {
  const { isDarkMode, colors } = useTheme();
  
  return (
    <div className="skeleton-pulse" style={{
      height: '60px',
      width: '100%',
      marginBottom: '12px',
      borderRadius: '8px',
      background: isDarkMode ? '#374151' : '#e5e7eb'
    }} />
  );
};

export const SkeletonStat = () => {
  const { isDarkMode, colors } = useTheme();
  
  return (
    <div className="skeleton-pulse" style={{
      height: '100px',
      width: '100%',
      borderRadius: '12px',
      background: isDarkMode ? '#374151' : '#e5e7eb'
    }} />
  );
};
