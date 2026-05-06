import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faDownload,
  faCopy,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import axios from '../../utils/axiosInstance';
import Swal from 'sweetalert2';

function ReceiptDisplay({ receipt, onClose }) {
  const { isDarkMode, colors } = useTheme();
  const [emailSending, setEmailSending] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!receipt) {
    return null;
  }

  const isExpired = new Date(receipt.expiresAt) < new Date();
  const expiryDays = Math.ceil(
    (new Date(receipt.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const handleCopyReceiptId = () => {
    navigator.clipboard.writeText(receipt.receiptId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      await axios.post(`/api/receipts/${receipt.receiptId}/email`);
      Swal.fire({
        icon: 'success',
        title: 'Email Sent',
        text: 'Receipt has been sent to your email',
        timer: 3000
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || error.message
      });
    } finally {
      setEmailSending(false);
    }
  };

  const handleDownloadPDF = () => {
    const receiptContent = `
ELECTION RECEIPT
================================================================================

Receipt ID: ${receipt.receiptId}
Date: ${new Date(receipt.createdAt).toLocaleDateString()} ${new Date(receipt.createdAt).toLocaleTimeString()}
Election: ${receipt.election?.title || 'N/A'}

VOTES CAST
--------------------------------------------------------------------------------
${receipt.votes.map((v, i) => `Position: ${v.position}\nVote: ${v.candidateName || 'Abstained'}`).join('\n\n')}

VERIFICATION
--------------------------------------------------------------------------------
Status: ${receipt.verified ? 'VERIFIED ✓' : 'UNVERIFIED'}
Verified At: ${receipt.verifiedAt ? new Date(receipt.verifiedAt).toLocaleString() : 'N/A'}
Expires: ${new Date(receipt.expiresAt).toLocaleDateString()}

IMPORTANT
================================================================================
- Keep this receipt for your records
- Do not share this receipt ID
- You can verify this receipt at any time using the Receipt ID
- Contact support if you have questions about your vote
`;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(receiptContent)}`);
    element.setAttribute('download', `receipt-${receipt.receiptId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    Swal.fire({
      icon: 'success',
      title: 'Downloaded',
      text: 'Receipt saved to your downloads',
      timer: 2000
    });
  };

  return (
    <div style={{
      background: isDarkMode ? colors.background : colors.background,
      minHeight: '100vh',
      padding: '40px 20px',
      color: isDarkMode ? colors.text : colors.text
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: isDarkMode ? colors.surface : colors.surface,
        borderRadius: '12px',
        boxShadow: `0 8px 32px rgba(0, 0, 0, ${isDarkMode ? 0.4 : 0.15})`,
        overflow: 'hidden',
        border: `1px solid ${isDarkMode ? colors.border : colors.border}`
      }}>
        {/* Header */}
        <div style={{
          background: isDarkMode ? colors.surfaceHover : colors.surfaceHover,
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${isDarkMode ? colors.border : colors.border}`
        }}>
          <h2 style={{
            margin: '0',
            fontSize: '1.5rem',
            color: isDarkMode ? colors.text : colors.text
          }}>📋 Vote Receipt</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: isDarkMode ? colors.textMuted : colors.textMuted,
              transition: 'color 0.2s'
            }}
            aria-label="Close receipt"
          >
            ✕
          </button>
        </div>

        {/* Receipt Body */}
        <div style={{ padding: '24px' }}>
          {/* Status Banner */}
          <div style={{
            background: receipt.verified 
              ? isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'
              : isDarkMode ? 'rgba(220, 53, 69, 0.15)' : 'rgba(220, 53, 69, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            borderLeft: `4px solid ${receipt.verified ? '#10b981' : '#dc3545'}`
          }}>
            <FontAwesomeIcon
              icon={receipt.verified ? faCheckCircle : faTimesCircle}
              style={{
                fontSize: '1.5rem',
                color: receipt.verified ? '#10b981' : '#dc3545',
                marginTop: '4px'
              }}
            />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px', color: isDarkMode ? colors.text : colors.text }}>
                {receipt.verified ? 'Receipt Verified' : 'Receipt Unverified'}
              </strong>
              <p style={{
                margin: '0',
                fontSize: '0.9rem',
                color: isDarkMode ? colors.textSecondary : colors.textSecondary
              }}>
                {receipt.verified
                  ? 'Your vote receipt has been cryptographically verified'
                  : 'This receipt has not been verified yet'}
              </p>
            </div>
          </div>

          {/* Receipt Details */}
          <div style={{ marginBottom: '24px' }}>
            {[
              { label: 'Receipt ID:', value: receipt.receiptId, isCode: true, hasCopy: true },
              { label: 'Election:', value: receipt.election?.title || 'N/A' },
              { label: 'Date:', value: `${new Date(receipt.createdAt).toLocaleDateString()} at ${new Date(receipt.createdAt).toLocaleTimeString()}` },
              { label: 'Status:', value: isExpired ? `⏰ Expired ${Math.abs(expiryDays)} days ago` : `✓ Expires in ${expiryDays} days`, isStatus: true }
            ].map((row, idx, arr) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                marginBottom: '12px',
                borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : colors.border}`
              }}>
                <label style={{
                  fontWeight: '600',
                  color: isDarkMode ? colors.textSecondary : colors.textSecondary,
                  minWidth: '100px'
                }}>{row.label}</label>
                {row.hasCopy ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                    <code style={{
                      background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontFamily: "'Courier New', monospace",
                      fontSize: '0.85rem',
                      color: isDarkMode ? colors.text : colors.text,
                      flex: 1,
                      marginLeft: '10px',
                      wordBreak: 'break-all'
                    }}>{receipt.receiptId}</code>
                    <button
                      onClick={handleCopyReceiptId}
                      style={{
                        background: isDarkMode ? colors.primary : colors.primary,
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                      title="Copy Receipt ID"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ) : row.isStatus ? (
                  <span style={{
                    color: isExpired ? '#dc3545' : '#10b981',
                    fontWeight: '600',
                    marginLeft: '10px'
                  }}>{row.value}</span>
                ) : (
                  <span style={{
                    color: isDarkMode ? colors.textSecondary : colors.textSecondary,
                    marginLeft: '10px',
                    textAlign: 'right',
                    flex: 1
                  }}>{row.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Votes Summary */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              margin: '0 0 16px 0',
              color: isDarkMode ? colors.text : colors.text,
              fontSize: '1.1rem'
            }}>Your Votes</h3>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `1px solid ${isDarkMode ? colors.inputBorder : colors.border}`
            }}>
              {receipt.votes.map((vote, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  padding: '12px 16px',
                  borderBottom: idx === receipt.votes.length - 1 ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : colors.border}`,
                  alignItems: 'center'
                }}>
                  <div style={{ color: isDarkMode ? colors.textMuted : colors.textMuted, fontWeight: '600' }}>
                    {vote.position}
                  </div>
                  <div style={{
                    color: vote.candidateName ? (isDarkMode ? colors.text : colors.text) : (isDarkMode ? colors.textMuted : colors.textMuted),
                    fontStyle: vote.candidateName ? 'normal' : 'italic'
                  }}>
                    {vote.candidateName || 'Abstained'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Info */}
          <p style={{
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: isDarkMode ? colors.textSecondary : colors.textSecondary,
            margin: '0',
            borderLeft: `3px solid ${isDarkMode ? colors.primary : colors.primary}`
          }}>
            <strong>Note:</strong> This receipt serves as your proof of vote. Keep it safe.
            You can verify this receipt at any time by providing the Receipt ID to election observers.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '24px',
          borderTop: `1px solid ${isDarkMode ? colors.border : colors.border}`,
          background: isDarkMode ? colors.surfaceHover : colors.surfaceHover
        }}>
          <button
            onClick={handleDownloadPDF}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: isDarkMode ? colors.surfaceHover : colors.surfaceHover,
              color: isDarkMode ? colors.text : colors.text,
              border: `1px solid ${isDarkMode ? colors.border : colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FontAwesomeIcon icon={faDownload} /> Download
          </button>
          <button
            onClick={handleSendEmail}
            disabled={emailSending}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: isDarkMode ? colors.primary : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: emailSending ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              opacity: emailSending ? 0.7 : 1
            }}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            {emailSending ? 'Sending...' : 'Email to Me'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'transparent',
              color: isDarkMode ? colors.textMuted : colors.textMuted,
              border: `1px solid ${isDarkMode ? colors.border : colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptDisplay;
