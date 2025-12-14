import React, { useState } from 'react';
import { FaShareAlt, FaFacebook, FaTwitter, FaLinkedin, FaEnvelope, FaCopy, FaCheck } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const ShareButton = ({ election }) => {
  const { isDarkMode, colors } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/election/${election._id}`;
  const shareText = `Check out this election: ${election.title}`;

  const handleShare = (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(election.title)}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    setShowMenu(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-outline-primary btn-sm"
        onClick={() => setShowMenu(!showMenu)}
        style={{
          borderColor: isDarkMode ? colors.border : '#dee2e6',
          color: isDarkMode ? colors.text : '#0d6efd'
        }}
      >
        <FaShareAlt className="me-1" /> Share
      </button>

      {showMenu && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#dee2e6'}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '8px',
              zIndex: 1000,
              minWidth: '180px'
            }}
          >
            <button
              className="btn btn-sm w-100 text-start mb-1"
              onClick={() => handleShare('facebook')}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? colors.text : '#212529',
                padding: '8px 12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaFacebook className="me-2 text-primary" /> Facebook
            </button>
            <button
              className="btn btn-sm w-100 text-start mb-1"
              onClick={() => handleShare('twitter')}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? colors.text : '#212529',
                padding: '8px 12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaTwitter className="me-2 text-info" /> Twitter
            </button>
            <button
              className="btn btn-sm w-100 text-start mb-1"
              onClick={() => handleShare('linkedin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? colors.text : '#212529',
                padding: '8px 12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaLinkedin className="me-2" style={{ color: '#0077b5' }} /> LinkedIn
            </button>
            <button
              className="btn btn-sm w-100 text-start mb-1"
              onClick={() => handleShare('email')}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? colors.text : '#212529',
                padding: '8px 12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaEnvelope className="me-2 text-danger" /> Email
            </button>
            <hr style={{ margin: '8px 0', borderColor: isDarkMode ? colors.border : '#dee2e6' }} />
            <button
              className="btn btn-sm w-100 text-start"
              onClick={() => handleShare('copy')}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? colors.text : '#212529',
                padding: '8px 12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {copied ? <FaCheck className="me-2 text-success" /> : <FaCopy className="me-2" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowMenu(false)}
          />
        </>
      )}
    </div>
  );
};

export default ShareButton;
