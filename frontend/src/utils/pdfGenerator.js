// Enhanced PDF Receipt Generator for Vote Confirmation
export const generateVoteReceipt = (voteData) => {
  const { election, candidate, votedAt, verificationCode } = voteData;
  
  // Create a professional HTML receipt with campus ballot branding
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vote Receipt - ${election.title}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background: #f8f9fa;
          min-height: 100vh;
        }
        
        .receipt-container {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          position: relative;
        }
        
        .header {
          background: #1e3a8a;
          color: white;
          padding: 40px 30px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        
        .logo-section {
          position: relative;
          z-index: 2;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
          color: #0d6efd;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 300;
        }
        
        .header .subtitle {
          font-size: 1.1em;
          opacity: 0.9;
          font-weight: 300;
        }
        
        .receipt-body {
          padding: 40px 30px;
        }
        
        .success-indicator {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .checkmark {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #059669;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
          animation: checkmarkPulse 2s ease-in-out;
        }
        
        @keyframes checkmarkPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .success-text {
          font-size: 1.5em;
          color: #059669;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .success-subtitle {
          color: #666;
          font-size: 1.1em;
        }
        
        .receipt-details {
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.05), rgba(102, 16, 242, 0.05));
          border-radius: 10px;
          padding: 30px;
          margin: 30px 0;
          border: 1px solid rgba(13, 110, 253, 0.2);
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          font-weight: 600;
          color: #495057;
          font-size: 1em;
        }
        
        .detail-value {
          color: #212529;
          font-weight: 500;
          font-size: 1em;
        }
        
        .verification-section {
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.1), rgba(102, 16, 242, 0.1));
          border: 2px solid #0d6efd;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          text-align: center;
          position: relative;
        }
        
        .verification-section::before {
          content: '🔒';
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: #0d6efd;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        
        .verification-title {
          font-weight: 600;
          color: #0d6efd;
          margin-bottom: 15px;
          font-size: 1.1em;
        }
        
        .verification-code {
          font-size: 2em;
          font-weight: bold;
          color: #0d6efd;
          letter-spacing: 3px;
          font-family: 'Courier New', monospace;
          background: white;
          padding: 15px 20px;
          border-radius: 8px;
          margin: 15px 0;
          border: 2px dashed #0d6efd;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .verification-note {
          font-size: 0.9em;
          color: #495057;
          line-height: 1.5;
        }
        
        .footer {
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.03), rgba(102, 16, 242, 0.03));
          padding: 30px;
          text-align: center;
          border-top: 1px solid rgba(13, 110, 253, 0.2);
        }
        
        .footer-logo {
          font-size: 1.2em;
          font-weight: 600;
          color: #0d6efd;
          margin-bottom: 10px;
        }
        
        .footer-text {
          color: #6c757d;
          font-size: 0.9em;
          margin: 5px 0;
        }
        
        .print-button {
          background: #0d6efd;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          margin: 20px 0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
        }
        
        .print-button:hover {
          background: #0b5ed7;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 8em;
          color: rgba(13, 110, 253, 0.03);
          font-weight: bold;
          pointer-events: none;
          z-index: 1;
        }
        
        @media print {
          body { 
            background: white; 
            margin: 0; 
            padding: 0;
          }
          .receipt-container {
            box-shadow: none;
            border-radius: 0;
          }
          .print-button { 
            display: none; 
          }
          .watermark {
            font-size: 6em;
            color: rgba(13, 110, 253, 0.05);
          }
        }
        
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .header {
            padding: 30px 20px 20px;
          }
          .header h1 {
            font-size: 2em;
          }
          .receipt-body {
            padding: 30px 20px;
          }
          .verification-code {
            font-size: 1.5em;
            letter-spacing: 2px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="watermark">CAMPUS BALLOT</div>
        
        <div class="header">
          <div class="logo-section">
            <div class="logo">🗳️</div>
            <h1>CAMPUS BALLOT</h1>
            <div class="subtitle">Official Vote Confirmation Receipt</div>
          </div>
        </div>
        
        <div class="receipt-body">
          <div class="success-indicator">
            <div class="checkmark">✓</div>
            <div class="success-text">Vote Successfully Recorded</div>
            <div class="success-subtitle">Thank you for participating in the democratic process</div>
          </div>
          
          <div class="receipt-details">
            <div class="detail-row">
              <span class="detail-label">📊 Election</span>
              <span class="detail-value">${election.title}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🆔 Candidate ID</span>
              <span class="detail-value">${(candidate._id || candidate.id || 'N/A').substring(0, 8)}****</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📍 Position</span>
              <span class="detail-value">${candidate.position || candidate.role || 'General'}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📅 Date & Time</span>
              <span class="detail-value">${new Date(votedAt).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🏛️ Election Type</span>
              <span class="detail-value">${election.type || 'General Election'}</span>
            </div>
          </div>
          
          <div class="verification-section">
            <div class="verification-title">🔐 Your Verification Code</div>
            <div class="verification-code">${verificationCode}</div>
            <div class="verification-note">
              <strong>Important:</strong> Save this verification code for your records. 
              You can use it to verify your vote in the system. This code is unique to your vote 
              and serves as proof of your participation in this election.
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">🗳️ Campus Ballot System</div>
          <div class="footer-text">This is an official vote receipt generated by the Campus Ballot System</div>
          <div class="footer-text">Generated on ${new Date().toLocaleString()}</div>
          <div class="footer-text">Receipt ID: ${Date.now().toString(36).toUpperCase()}</div>
          
          <button onclick="window.print()" class="print-button no-print">
            🖨️ Print This Receipt
          </button>
        </div>
      </div>
      
      <script>
        // Auto-focus for better printing
        window.addEventListener('load', function() {
          document.body.focus();
        });
        
        // Enhanced print functionality
        function printReceipt() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
  
  // Open in new window with better settings
  const receiptWindow = window.open('', '_blank', 'width=800,height=1000,scrollbars=yes,resizable=yes');
  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
  receiptWindow.focus();
};

// Generate verification code
export const generateVerificationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i < 11) code += '-';
  }
  return code;
};
