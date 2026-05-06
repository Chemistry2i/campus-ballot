import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import ReceiptVerification from '../components/receipt/ReceiptVerification';
import styles from './ReceiptVerificationPage.module.css';

function ReceiptVerificationPage() {
  return (
    <ThemeProvider>
      <div className={styles['page-container']}>
        <ReceiptVerification />
      </div>
    </ThemeProvider>
  );
}

export default ReceiptVerificationPage;
