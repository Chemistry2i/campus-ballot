import React, { useState, useEffect } from 'react';
import './ProgressIndicator.css';

/**
 * ProgressIndicator Component
 * Displays a progress bar based on scroll position
 */
const ProgressIndicator = ({ pageTitle = 'Document' }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill" 
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${pageTitle} reading progress: ${Math.round(scrollProgress)}%`}
      />
    </div>
  );
};

export default ProgressIndicator;
