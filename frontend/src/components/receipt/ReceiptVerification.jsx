import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from '../../utils/axiosInstance';
import Swal from 'sweetalert2';
import ReceiptDisplay from './ReceiptDisplay';
import styles from './ReceiptVerification.module.css';

function ReceiptVerification() {
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
    <div className={styles['verification-container']}>
      {!showReceipt ? (
        <div className={styles['search-section']}>
          {/* Header */}
          <div className={styles['header']}>
            <h1>🔍 Verify Your Receipt</h1>
            <p>Enter your receipt ID below to verify your vote</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className={styles['search-form']}>
            <div className={styles['input-group']}>
              <input
                type="text"
                placeholder="Enter Receipt ID (e.g., RECEIPT-XXXX-YYYY)"
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                className={styles['search-input']}
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className={styles['search-btn']}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Verifying...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} /> Verify
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
                className={`${styles['status-card']} ${
                  verificationResult.valid ? styles['valid'] : styles['invalid']
                }`}
              >
                <FontAwesomeIcon
                  icon={verificationResult.valid ? faCheckCircle : faTimesCircle}
                  className={styles['status-icon']}
                />
                <div>
                  <h2>
                    {verificationResult.valid
                      ? 'Receipt Verified'
                      : 'Receipt Verification Failed'}
                  </h2>
                  <p>{verificationResult.message}</p>
                </div>
              </div>

              {/* Receipt Preview */}
              <div className={styles['preview-section']}>
                <h3>Receipt Details</h3>
                <div className={styles['preview-card']}>
                  <div className={styles['preview-row']}>
                    <span className={styles['label']}>Receipt ID:</span>
                    <code className={styles['value']}>{receipt.receiptId}</code>
                  </div>
                  <div className={styles['preview-row']}>
                    <span className={styles['label']}>Election:</span>
                    <span className={styles['value']}>
                      {receipt.election?.title}
                    </span>
                  </div>
                  <div className={styles['preview-row']}>
                    <span className={styles['label']}>Date:</span>
                    <span className={styles['value']}>
                      {new Date(receipt.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles['preview-row']}>
                    <span className={styles['label']}>Votes Cast:</span>
                    <span className={styles['value']}>
                      {receipt.votes?.length || 0}
                    </span>
                  </div>
                  <div className={styles['preview-row']}>
                    <span className={styles['label']}>Status:</span>
                    <span
                      className={`${styles['value']} ${
                        !receipt.isExpired ? styles['active'] : styles['expired']
                      }`}
                    >
                      {receipt.isExpired
                        ? '⏰ Expired'
                        : '✓ Active'}
                    </span>
                  </div>

                  {/* Votes List */}
                  {receipt.votes && receipt.votes.length > 0 && (
                    <div className={styles['votes-list']}>
                      <h4>Votes:</h4>
                      <ul>
                        {receipt.votes.map((vote, idx) => (
                          <li key={idx}>
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
              <div className={styles['action-buttons']}>
                <button
                  className={styles['view-btn']}
                  onClick={handleShowReceipt}
                >
                  View Full Receipt
                </button>
                <button
                  className={styles['new-search-btn']}
                  onClick={() => {
                    setReceipt(null);
                    setVerificationResult(null);
                    setReceiptId('');
                  }}
                >
                  Search Another Receipt
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          {!receipt && (
            <div className={styles['info-box']}>
              <h3>How to Verify Your Receipt</h3>
              <ol>
                <li>Enter your unique Receipt ID in the search box above</li>
                <li>Click "Verify" to check the receipt signature</li>
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
