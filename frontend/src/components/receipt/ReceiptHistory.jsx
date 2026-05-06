import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faEye, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axios from '../../utils/axiosInstance';
import Swal from 'sweetalert2';
import ReceiptDisplay from './ReceiptDisplay';
import styles from './ReceiptHistory.module.css';

function ReceiptHistory() {
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

  const handleViewReceipt = async (receipt) => {
    try {
      const response = await axios.get(`/api/receipts/${receipt.receiptId}`);
      setSelectedReceipt(response.data.receipt);
      setShowDetail(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Receipt',
        text: error.response?.data?.error || error.message
      });
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedReceipt(null);
  };

  if (showDetail && selectedReceipt) {
    return <ReceiptDisplay receipt={selectedReceipt} onClose={handleCloseDetail} />;
  }

  return (
    <div className={styles['history-container']}>
      <div className={styles['header']}>
        <h2>
          <FontAwesomeIcon icon={faHistory} /> Your Vote Receipts
        </h2>
        <p>View and manage all your election receipts</p>
      </div>

      {loading ? (
        <div className={styles['loading']}>
          <FontAwesomeIcon icon={faSpinner} spin />
          <p>Loading your receipts...</p>
        </div>
      ) : receipts.length === 0 ? (
        <div className={styles['empty-state']}>
          <FontAwesomeIcon icon={faHistory} />
          <h3>No Receipts Yet</h3>
          <p>You haven't cast any votes yet. Once you vote, your receipt will appear here.</p>
        </div>
      ) : (
        <div className={styles['receipts-grid']}>
          {receipts.map((receipt) => (
            <div
              key={receipt.receiptId}
              className={`${styles['receipt-card']} ${
                receipt.isExpired ? styles['expired'] : ''
              }`}
            >
              {receipt.isExpired && (
                <div className={styles['expired-badge']}>
                  <FontAwesomeIcon icon={faExclamationTriangle} /> Expired
                </div>
              )}

              <div className={styles['card-header']}>
                <h3>{receipt.election?.title}</h3>
                <span
                  className={`${styles['status-dot']} ${
                    receipt.verified ? styles['verified'] : styles['unverified']
                  }`}
                  title={receipt.verified ? 'Verified' : 'Unverified'}
                />
              </div>

              <div className={styles['card-body']}>
                <div className={styles['info-row']}>
                  <span className={styles['label']}>Receipt ID:</span>
                  <code className={styles['value']}>{receipt.receiptId}</code>
                </div>

                <div className={styles['info-row']}>
                  <span className={styles['label']}>Date:</span>
                  <span className={styles['value']}>
                    {new Date(receipt.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className={styles['info-row']}>
                  <span className={styles['label']}>Status:</span>
                  <span
                    className={`${styles['status-badge']} ${
                      receipt.isExpired ? styles['expired-status'] : styles['active-status']
                    }`}
                  >
                    {receipt.isExpired
                      ? 'Expired'
                      : receipt.emailSent
                      ? '✓ Email Sent'
                      : 'Active'}
                  </span>
                </div>
              </div>

              <button
                className={styles['view-btn']}
                onClick={() => handleViewReceipt(receipt)}
              >
                <FontAwesomeIcon icon={faEye} /> View Receipt
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReceiptHistory;
