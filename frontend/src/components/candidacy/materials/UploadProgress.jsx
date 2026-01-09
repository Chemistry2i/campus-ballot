import React from 'react';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';

const UploadProgress = ({ progress, isUploading }) => {
  if (!isUploading) return null;

  return (
    <div 
      className="mb-4 p-4" 
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
      }}
    >
      <div className="d-flex align-items-center justify-content-center mb-3">
        <div className="position-relative">
          <FaCloudUploadAlt 
            size={48} 
            color="#fff" 
            style={{ 
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 0.9
            }} 
          />
          <FaSpinner 
            size={20} 
            color="#fff" 
            className="position-absolute"
            style={{ 
              bottom: -5, 
              right: -5,
              animation: 'spin 1s linear infinite'
            }} 
          />
        </div>
        <div className="ms-3 text-white">
          <h6 className="mb-0 fw-bold">Uploading...</h6>
          <small style={{ opacity: 0.9 }}>
            {progress < 100 ? 'Please wait while your files are being uploaded' : 'Processing...'}
          </small>
        </div>
      </div>
      
      <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ 
            width: `${progress}%`,
            backgroundColor: '#fff',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      
      <div className="text-center mt-2">
        <span className="text-white fw-semibold" style={{ fontSize: '0.9rem' }}>
          {progress}% Complete
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UploadProgress;
