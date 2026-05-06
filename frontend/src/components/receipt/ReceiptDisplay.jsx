import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faDownload,
  faShare,
  faCopy,
  faEnvelope,
  faQrcode
} from '@fortawesome/free-solid-svg-icons';
import axios from '../../utils/axiosInstance';
import Swal from 'sweetalert2';
import styles from './ReceiptDisplay.module.css';

function ReceiptDisplay({ receipt, onClose }) {
  const [emailSending, setEmailSending] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!receipt) {
    return null;
  }

  const isExpired = new Date(receipt.expiresAt) < new Date();
  const expiryDays = Math.ceil(
    (new Date(receipt.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  );

  // Copy receipt ID to clipboard
  const handleCopyReceiptId = () => {
    navigator.clipboard.writeText(receipt.receiptId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send receipt via email
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

  // Download receipt as PDF
  const handleDownloadPDF = () => {
    const receiptContent = `
ELECTION RECEIPT
================================================================================

Receipt ID: ${receipt.receiptId}
Date: ${new Date(receipt.createdAt).toLocaleDateString()} ${new Date(receipt.createdAt).toLocaleTimeString()}
Election: ${receipt.election?.title || 'N/A'}

VOTES CAST
--------------------------------------------------------------------------------
${receipt.votes.map((v, i) => `
Position: ${v.position}
Vote: ${v.candidateName || 'Abstained'}
`).join('\n')}

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
    <div className={styles['receipt-container']}>
      {/* Header */}
      <div className={styles['receipt-header']}>
        <h2>📋 Vote Receipt</h2>
        <button
          className={styles['close-btn']}
          onClick={onClose}
          aria-label="Close receipt"
        >
          ✕
        </button>
      </div>

      {/* Receipt Body */}
      <div className={styles['receipt-body']}>
        {/* Status Banner */}
        <div
          className={`${styles['status-banner']} ${
            receipt.verified ? styles['verified'] : styles['unverified']
          }`}
        >
          <FontAwesomeIcon
            icon={receipt.verified ? faCheckCircle : faTimesCircle}
            className={styles['status-icon']}
          />
          <div>
            <strong>
              {receipt.verified ? 'Receipt Verified' : 'Receipt Unverified'}
            </strong>
            <p>
              {receipt.verified
                ? 'Your vote receipt has been cryptographically verified'
                : 'This receipt has not been verified yet'}
            </p>
          </div>
        </div>

        {/* Receipt Details */}
        <div className={styles['receipt-details']}>
          <div className={styles['detail-row']}>
            <label>Receipt ID:</label>
            <div className={styles['receipt-id-container']}>
              <code className={styles['receipt-id']}>{receipt.receiptId}</code>
              <button
                className={styles['copy-btn']}
                onClick={handleCopyReceiptId}
                title="Copy Receipt ID"
              >
                <FontAwesomeIcon icon={faCopy} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className={styles['detail-row']}>
            <label>Election:</label>
            <span>{receipt.election?.title || 'N/A'}</span>
          </div>

          <div className={styles['detail-row']}>
            <label>Date:</label>
            <span>
              {new Date(receipt.createdAt).toLocaleDateString()} at{' '}
              {new Date(receipt.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <div className={styles['detail-row']}>
            <label>Status:</label>
            <span
              className={`${styles['status-badge']} ${
                isExpired ? styles['expired'] : styles['active']
              }`}
            >
              {isExpired
                ? `⏰ Expired ${Math.abs(expiryDays)} days ago`
                : `✓ Expires in ${expiryDays} days`}
            </span>
          </div>
        </div>

        {/* Votes Summary */}
        <div className={styles['votes-section']}>
          <h3>Your Votes</h3>
          <div className={styles['votes-table']}>
            <div className={styles['table-header']}>
              <div className={styles['col-position']}>Position</div>
              <div className={styles['col-vote']}>Your Vote</div>
            </div>
            {receipt.votes.map((vote, idx) => (
              <div key={idx} className={styles['table-row']}>
                <div className={styles['col-position']}>{vote.position}</div>
                <div className={styles['col-vote']}>
                  {vote.candidateName ? (
                    <span className={styles['candidate-name']}>
                      {vote.candidateName}
                    </span>
                  ) : (
                    <em className={styles['abstained']}>Abstained</em>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Info */}
        <div className={styles['verification-info']}>
          <p className={styles['info-text']}>
            <strong>Note:</strong> This receipt serves as your proof of vote. Keep it safe.
            You can verify this receipt at any time by providing the Receipt ID to election observers.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles['receipt-footer']}>
        <button
          className={`${styles['action-btn']} ${styles['secondary']}`}
          onClick={handleDownloadPDF}
        >
          <FontAwesomeIcon icon={faDownload} /> Download
        </button>
        <button
          className={`${styles['action-btn']} ${styles['primary']}`}
          onClick={handleSendEmail}
          disabled={emailSending}
        >
          <FontAwesomeIcon icon={faEnvelope} />
          {emailSending ? 'Sending...' : 'Email to Me'}
        </button>
        <button
          className={`${styles['action-btn']} ${styles['secondary']}`}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default ReceiptDisplay;
