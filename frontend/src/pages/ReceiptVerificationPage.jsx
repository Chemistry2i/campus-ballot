import React from 'react';
import ReceiptVerification from '../components/receipt/ReceiptVerification';
import styles from './ReceiptVerificationPage.module.css';

function ReceiptVerificationPage() {
  return (
    <div className={styles['page-container']}>
      <ReceiptVerification />
    </div>
  );
}

export default ReceiptVerificationPage;
