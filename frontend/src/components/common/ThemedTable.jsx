import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemedTable = ({ 
  children, 
  striped = true, 
  bordered = true, 
  hover = true, 
  responsive = true, 
  size = null,
  className = '',
  ...props 
}) => {
  const { isDarkMode } = useTheme();
  
  const tableClasses = [
    'table',
    striped && 'table-striped',
    bordered && 'table-bordered', 
    hover && 'table-hover',
    size && `table-${size}`,
    className
  ].filter(Boolean).join(' ');

  const table = (
    <table 
      className={tableClasses}
      style={{
        marginBottom: 0,
        ...(isDarkMode && {
          '--bs-table-bg': '#1e293b',
          '--bs-table-striped-bg': '#2d3748',
          '--bs-table-hover-bg': '#3b4a5c',
          '--bs-table-border-color': '#475569',
        })
      }}
      {...props}
    >
      {children}
    </table>
  );

  if (responsive) {
    return (
      <div 
        className="table-responsive"
        style={{
          ...(isDarkMode && {
            borderRadius: '0.5rem',
            border: '1px solid #475569',
            backgroundColor: '#1e293b'
          })
        }}
      >
        {table}
      </div>
    );
  }

  return table;
};

export default ThemedTable;
