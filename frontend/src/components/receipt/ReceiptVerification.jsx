import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle, faTimesCircle, faSpinner, faShieldAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import axios from '../../utils/axiosInstance';
import Swal from 'sweetalert2';
import ReceiptDisplay from './ReceiptDisplay';
import styles from './ReceiptVerification.module.css';

function ReceiptVerification() {
  const { isDarkMode, colors } = useTheme();
  const [receiptId, setReceiptId] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!receiptId.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Receipt ID',
        text: 'Please enter a receipt ID to verify',
        confirmButtonText: 'Got it'
      });
      return;
    }

    setLoading(true);
    setReceipt(null);
    setVerificationResult(null);

    try {
      // First, fetch the receipt details
      const receiptResponse = await axios.get(`/api/receipts/${receiptId.trim()}`);
      setReceipt(receiptResponse.data.receipt);

      // Then, verify the receipt signature
      const verifyResponse = await axios.post(`/api/receipts/${receiptId.trim()}/verify`);
      setVerificationResult(verifyResponse.data);

      if (!verifyResponse.data.valid) {
        Swal.fire({
          icon: 'warning',
          title: 'Verification Failed',
          text: verifyResponse.data.message,
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Receipt verification error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Verification Error',
        text: error.response?.data?.error || error.message || 'Failed to retrieve receipt',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowReceipt = () => {
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  return (
    <div className={styles['verification-container']} style={{
      minHeight: '100vh',
      background: isDarkMode ? colors.background : colors.background,
      padding: '40px 20px'
    }}>
      {!showReceipt ? (
        <div className={styles['search-section']}>
          {/* Header */}
          <div className={styles['header']} style={{
            textAlign: 'center',
            color: isDarkMode ? colors.text : colors.text,
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              margin: '0 0 10px 0',
              fontWeight: '700',
              color: isDarkMode ? colors.text : colors.text
            }}>
              <FontAwesomeIcon icon={faShieldAlt} /> Verify Your Receipt
            </h1>
            <p style={{
              fontSize: '1.1rem',
              margin: '0',
              opacity: '0.9',
              color: isDarkMode ? colors.textMuted : colors.textMuted
            }}>Enter your receipt ID to verify your vote integrity</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className={styles['search-form']} style={{ marginBottom: '30px' }}>
            <div className={styles['input-group']} style={{
              display: 'flex',
              gap: '10px'
            }}>
              <input
                type="text"
                placeholder="Enter Receipt ID (e.g., RECEIPT-XXXX-YYYY)"
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                className={styles['search-input']}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  border: `1px solid ${isDarkMode ? colors.inputBorder : colors.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: isDarkMode ? colors.inputBg : colors.inputBg,
                  color: isDarkMode ? colors.text : colors.text,
                  boxShadow: `0 4px 15px rgba(0, 0, 0, 0.15)`,
                  transition: 'all 0.2s ease'
                }}
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className={styles['search-btn']}
                style={{
                  padding: '14px 28px',
                  background: isDarkMode ? colors.primary : colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 15px ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
                  whiteSpace: 'nowrap',
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Verifying...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} /> Verify Receipt
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results */}
          {receipt && verificationResult && (
            <div className={styles['results-section']}>
              {/* Verification Status */}
              <div
                style={{
                  background: isDarkMode ? colors.surface : colors.surface,
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '16px',
                  boxShadow: `0 4px 15px rgba(0, 0, 0, ${isDarkMode ? 0.3 : 0.15})`,
                  borderLeft: `4px solid ${verificationResult.valid ? '#28a745' : '#dc3545'}`
                }}
              >
                <FontAwesomeIcon
                  icon={verificationResult.valid ? faCheckCircle : faTimesCircle}
                  style={{
                    fontSize: '2rem',
                    color: verificationResult.valid ? '#28a745' : '#dc3545',
                    flexShrink: 0,
                    marginTop: '4px'
                  }}
                />
                <div>
                  <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.3rem',
                    color: isDarkMode ? colors.text : colors.text
                  }}>
                    {verificationResult.valid
                      ? 'Receipt Verified'
                      : 'Receipt Verification Failed'}
                  </h2>
                  <p style={{
                    margin: '0',
                    color: isDarkMode ? colors.textSecondary : colors.textSecondary,
                    lineHeight: '1.5'
                  }}>{verificationResult.message}</p>
                </div>
              </div>

              {/* Receipt Preview */}
              <div style={{
                background: isDarkMode ? colors.surface : colors.surface,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: `0 4px 15px rgba(0, 0, 0, ${isDarkMode ? 0.3 : 0.15})`
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  color: isDarkMode ? colors.text : colors.text,
                  fontSize: '1.1rem'
                }}>Receipt Details</h3>
                <div style={{
                  background: isDarkMode ? `rgba(255,255,255,0.05)` : '#f8f9fa',
                  borderRadius: '8px',
                  padding: '16px',
                  border: `1px solid ${isDarkMode ? colors.inputBorder : colors.border}`
                }}>
                  {[
                    { label: 'Receipt ID:', value: receipt.receiptId, isCode: true },
                    { label: 'Election:', value: receipt.election?.title },
                    { label: 'Date:', value: new Date(receipt.createdAt).toLocaleString() },
                    { label: 'Votes Cast:', value: receipt.votes?.length || 0 },
                    { label: 'Status:', value: receipt.isExpired ? '⏰ Expired' : '✓ Active', status: !receipt.isExpired }
                  ].map((row, idx, arr) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: '10px 0',
                        borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e9ecef'}`
                      }}
                    >
                      <span style={{
                        fontWeight: '600',
                        color: isDarkMode ? colors.textSecondary : colors.textSecondary,
                        minWidth: '120px'
                      }}>{row.label}</span>
                      <span style={{
                        color: row.status === false ? '#dc3545' : row.status === true ? '#28a745' : isDarkMode ? colors.text : colors.text,
                        wordBreak: 'break-all',
                        textAlign: 'right',
                        flex: 1,
                        marginLeft: '10px',
                        fontFamily: row.isCode ? "'Courier New', monospace" : 'inherit',
                        fontSize: row.isCode ? '0.9rem' : '1rem',
                        fontWeight: row.status ? '600' : 'normal'
                      }}>{row.value}</span>
                    </div>
                  ))}

                  {/* Votes List */}
                  {receipt.votes && receipt.votes.length > 0 && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e9ecef'}`
                    }}>
                      <h4 style={{
                        margin: '0 0 12px 0',
                        color: isDarkMode ? colors.text : colors.text,
                        fontSize: '1rem'
                      }}>Votes:</h4>
                      <ul style={{
                        margin: '0',
                        paddingLeft: '20px',
                        color: isDarkMode ? colors.textSecondary : colors.textSecondary
                      }}>
                        {receipt.votes.map((vote, idx) => (
                          <li key={idx} style={{ marginBottom: '8px' }}>
                            <strong>{vote.position}:</strong>{' '}
                            {vote.candidateName || <em>Abstained</em>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  onClick={handleShowReceipt}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: isDarkMode ? colors.primary : colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 4px 12px ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`
                  }}
                >
                  View Full Receipt
                </button>
                <button
                  onClick={() => {
                    setReceipt(null);
                    setVerificationResult(null);
                    setReceiptId('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: isDarkMode ? colors.surfaceHover : colors.surfaceHover,
                    color: isDarkMode ? colors.text : colors.text,
                    border: `1px solid ${isDarkMode ? colors.border : colors.border}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Search Another Receipt
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          {!receipt && (
            <div style={{
              background: isDarkMode ? colors.surface : colors.surface,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: `0 4px 15px rgba(0, 0, 0, ${isDarkMode ? 0.3 : 0.15})`,
              border: `1px solid ${isDarkMode ? colors.border : colors.border}`
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                color: isDarkMode ? colors.text : colors.text,
                fontSize: '1.1rem'
              }}><FontAwesomeIcon icon={faFileAlt} /> How to Verify Your Receipt</h3>
              <ol style={{
                margin: '0',
                paddingLeft: '20px',
                color: isDarkMode ? colors.textSecondary : colors.textSecondary,
                lineHeight: '1.8'
              }}>
                <li>Enter your unique Receipt ID in the search box above</li>
                <li>Click "Verify Receipt" to check the receipt signature</li>
                <li>Your receipt must be cryptographically valid</li>
                <li>Receipts are valid for 30 days from voting date</li>
                <li>Share your Receipt ID with election observers if needed</li>
              </ol>
            </div>
          )}
        </div>
      ) : (
        <ReceiptDisplay receipt={receipt} onClose={handleCloseReceipt} />
      )}
    </div>
  );
}

export default ReceiptVerification;
