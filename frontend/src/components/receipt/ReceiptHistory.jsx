import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faEye, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axios from '../../utils/axiosInstance';
import Swal from 'sweetalert2';
import ReceiptDisplay from './ReceiptDisplay';

function ReceiptHistory() {
  const { isDarkMode, colors } = useTheme();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/receipts/user/my-receipts');
      setReceipts(response.data.receipts || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Receipts',
        text: error.response?.data?.error || error.message,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (receipt) => {
    // Use the receipt data we already have from the my-receipts endpoint
    // This way we don't need to call the public endpoint which doesn't return votes
    setSelectedReceipt(receipt);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedReceipt(null);
  };

  if (showDetail && selectedReceipt) {
    return <ReceiptDisplay receipt={selectedReceipt} onClose={handleCloseDetail} />;
  }

  return (
    <div style={{
      background: isDarkMode ? colors.background : colors.background,
      minHeight: '100vh',
      padding: '40px 20px',
      color: isDarkMode ? colors.text : colors.text
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2rem',
            margin: '0 0 10px 0',
            fontWeight: '700',
            color: isDarkMode ? colors.text : colors.text
          }}>
            <FontAwesomeIcon icon={faHistory} /> Your Vote Receipts
          </h2>
          <p style={{
            fontSize: '1.1rem',
            margin: '0',
            color: isDarkMode ? colors.textMuted : colors.textMuted
          }}>View and manage all your election receipts</p>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            gap: '20px'
          }}>
            <FontAwesomeIcon icon={faSpinner} spin style={{
              fontSize: '2.5rem',
              color: isDarkMode ? colors.primary : colors.primary
            }} />
            <p style={{
              fontSize: '1.1rem',
              color: isDarkMode ? colors.textSecondary : colors.textSecondary
            }}>Loading your receipts...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: isDarkMode ? colors.surface : colors.surface,
            borderRadius: '12px',
            border: `1px solid ${isDarkMode ? colors.border : colors.border}`
          }}>
            <FontAwesomeIcon icon={faHistory} style={{
              fontSize: '3rem',
              color: isDarkMode ? colors.textMuted : colors.textMuted,
              marginBottom: '20px',
              display: 'block'
            }} />
            <h3 style={{
              fontSize: '1.3rem',
              margin: '0 0 10px 0',
              color: isDarkMode ? colors.text : colors.text
            }}>No Receipts Yet</h3>
            <p style={{
              color: isDarkMode ? colors.textSecondary : colors.textSecondary,
              margin: '0',
              fontSize: '1rem'
            }}>You haven't cast any votes yet. Once you vote, your receipt will appear here.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {receipts.map((receipt) => {
              const isExpired = new Date(receipt.expiresAt) < new Date();
              const expiryDays = Math.ceil(
                (new Date(receipt.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={receipt._id}
                  style={{
                    background: isDarkMode ? colors.surface : colors.surface,
                    border: `1px solid ${isDarkMode ? colors.border : colors.border}`,
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: `0 4px 12px rgba(0, 0, 0, ${isDarkMode ? 0.2 : 0.1})`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    ':hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px rgba(0, 0, 0, ${isDarkMode ? 0.3 : 0.15})`
                    }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Receipt ID */}
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{
                      fontSize: '0.85rem',
                      color: isDarkMode ? colors.textMuted : colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Receipt ID</strong>
                    <code style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: isDarkMode ? colors.primary : colors.primary,
                      wordBreak: 'break-all',
                      margin: '4px 0 0 0',
                      fontFamily: "'Courier New', monospace"
                    }}>{receipt.receiptId}</code>
                  </div>

                  {/* Election */}
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{
                      fontSize: '0.85rem',
                      color: isDarkMode ? colors.textMuted : colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Election</strong>
                    <p style={{
                      margin: '4px 0 0 0',
                      color: isDarkMode ? colors.text : colors.text,
                      fontSize: '0.95rem'
                    }}>{receipt.election?.title || 'N/A'}</p>
                  </div>

                  {/* Date */}
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{
                      fontSize: '0.85rem',
                      color: isDarkMode ? colors.textMuted : colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Date</strong>
                    <p style={{
                      margin: '4px 0 0 0',
                      color: isDarkMode ? colors.textSecondary : colors.textSecondary,
                      fontSize: '0.9rem'
                    }}>{new Date(receipt.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Status */}
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: isExpired
                        ? isDarkMode ? 'rgba(220, 53, 69, 0.15)' : 'rgba(220, 53, 69, 0.1)'
                        : isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                      color: isExpired ? '#dc3545' : '#10b981',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {isExpired
                        ? `Expired ${Math.abs(expiryDays)}d ago`
                        : `Expires in ${expiryDays}d`}
                    </span>
                  </div>

                  {/* Votes Count */}
                  <div style({
                    padding: '12px 0',
                    borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : colors.border}`,
                    marginBottom: '16px'
                  })>
                    <p style={{
                      margin: '0',
                      fontSize: '0.9rem',
                      color: isDarkMode ? colors.textSecondary : colors.textSecondary
                    }}>
                      <strong>{receipt.votes?.length || 0}</strong> votes cast
                    </p>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => handleViewReceipt(receipt)}
                    style={{
                      padding: '10px 16px',
                      background: isDarkMode ? colors.primary : colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      marginTop: 'auto'
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} /> View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReceiptHistory;
