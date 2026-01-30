import React from 'react';
import { FaPrint } from 'react-icons/fa';
import './PrintButton.css';

/**
 * PrintButton Component
 * Provides print and export functionality for legal pages
 */
const PrintButton = ({ pageTitle = 'Document' }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Note: For production, integrate with a library like jsPDF or html2pdf
    alert('PDF export feature requires jsPDF library installation. Using browser print as alternative.');
    window.print();
  };

  return (
    <div className="print-button-container">
      <button
        className="btn-print"
        onClick={handlePrint}
        aria-label={`Print ${pageTitle}`}
        title={`Print ${pageTitle}`}
      >
        <FaPrint />
        <span>Print</span>
      </button>
      <button
        className="btn-export-pdf"
        onClick={handleExportPDF}
        aria-label={`Export ${pageTitle} as PDF`}
        title={`Export ${pageTitle} as PDF`}
      >
        <FaPrint />
        <span>Export PDF</span>
      </button>
    </div>
  );
};

export default PrintButton;
