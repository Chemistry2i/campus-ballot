import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  FaFile, 
  FaFilePdf, 
  FaFileImage, 
  FaFileVideo,
  FaDownload,
  FaEye,
  FaTrash
} from 'react-icons/fa';

// Helper to get the full image URL
const getImageUrl = (url) => {
  if (!url) return '';
  // If already absolute URL, use as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // For relative URLs like /uploads/..., use API base URL in production
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) {
    return `${apiBase.replace(/\/$/, '')}${url}`;
  }
  // In development with proxy, relative URL should work
  return url;
};

const MaterialCard = ({ material, onDownload, onPreview, onDelete }) => {
  const { isDarkMode, colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FaFileImage size={40} color="#3b82f6" />;
    if (fileType.startsWith('video/')) return <FaFileVideo size={40} color="#8b5cf6" />;
    if (fileType === 'application/pdf') return <FaFilePdf size={40} color="#ef4444" />;
    return <FaFile size={40} color="#6b7280" />;
  };

  const formatFileSize = (mb) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div
      className="card h-100"
      style={{
        background: isDarkMode ? colors.surface : '#fff',
        border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
        borderRadius: '12px',
        transition: 'all 0.3s',
        cursor: 'pointer',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="card-body" style={{ padding: '1rem' }}>
        {/* File Icon/Preview */}
        <div
          className="d-flex align-items-center justify-content-center mb-3"
          style={{
            minHeight: '120px',
            background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {material.fileType.startsWith('image/') && !imageError ? (
            <img
              src={getImageUrl(material.url)}
              alt={material.title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                objectFit: 'contain'
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            getFileIcon(material.fileType)
          )}
        </div>

        {/* Material Info */}
        <h6 
          className="fw-bold mb-2" 
          style={{ 
            color: colors.text,
            fontSize: '0.95rem',
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={material.title}
        >
          {material.title}
        </h6>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-primary">{material.category}</span>
          <small style={{ color: colors.textSecondary }}>{formatFileSize(material.fileSize)}</small>
        </div>
        <div className="d-flex justify-content-between small mb-3" style={{ color: colors.textSecondary }}>
          <span>
            <FaEye size={12} className="me-1" />
            {material.views}
          </span>
          <span>
            <FaDownload size={12} className="me-1" />
            {material.downloads}
          </span>
          <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary flex-fill"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(material);
            }}
          >
            <FaDownload size={12} />
          </button>
          <button
            className="btn btn-sm btn-outline-info flex-fill"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(material);
            }}
          >
            <FaEye size={12} />
          </button>
          <button
            className="btn btn-sm btn-outline-danger flex-fill"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(material._id);
            }}
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
