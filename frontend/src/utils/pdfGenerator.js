// Anonymous Vote Receipt Generator - No vote details shown
// Generates printable HTML receipt with verification code but NO candidate/vote information
export const generateVoteReceipt = (voteData) => {
  // Handle both direct receipt objects and vote data passed to function
  let election = voteData?.election;
  let votedAt = voteData?.votedAt || voteData?.createdAt;
  let receiptId = voteData?.receiptId;
  
  // If election is an object with title property (populated), use it as-is
  // If election is just an ID string or nested object, handle gracefully
  const electionTitle = election?.title || election?.name || 'Election';
  
  // Validate that we have the minimum required data
  if (!receiptId) {
    console.error('Invalid vote data for receipt generation:', voteData);
    console.error('Missing receiptId. Available fields:', Object.keys(voteData || {}));
    alert('Error: Unable to generate receipt. Missing verification code.');
    return;
  }
  
  if (!votedAt) {
    console.warn('Missing votedAt, using current time');
    votedAt = new Date();
  }
  
  if (!electionTitle || electionTitle === 'Election') {
    console.warn('Missing election title, using default');
  }
  
  // Create a professional HTML receipt with campus ballot branding
  // IMPORTANT: Does NOT show who was voted for (anonymous voting)
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vote Receipt - ${electionTitle}</title>
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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 40px 30px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
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
          color: #10b981;
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
          background: #10b981;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
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
        
        .alert-anonymity {
          background: #dbeafe;
          border-left: 4px solid #0284c7;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #075985;
          font-size: 0.95em;
        }
        
        .receipt-details {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
          border-radius: 10px;
          padding: 30px;
          margin: 30px 0;
          border: 1px solid rgba(16, 185, 129, 0.2);
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
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          text-align: center;
          position: relative;
        }
        
        .verification-title {
          font-weight: 600;
          color: #10b981;
          margin-bottom: 15px;
          font-size: 1.1em;
        }
        
        .verification-code {
          font-size: 2em;
          font-weight: bold;
          color: #10b981;
          letter-spacing: 3px;
          font-family: 'Courier New', monospace;
          background: white;
          padding: 15px 20px;
          border-radius: 8px;
          margin: 15px 0;
          border: 2px dashed #10b981;
          word-break: break-all;
        }
        
        .verification-note {
          font-size: 0.9em;
          color: #495057;
          line-height: 1.5;
        }
        
        .footer {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.03), rgba(5, 150, 105, 0.03));
          padding: 30px;
          text-align: center;
          border-top: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .footer-logo {
          font-size: 1.2em;
          font-weight: 600;
          color: #10b981;
          margin-bottom: 10px;
        }
        
        .footer-text {
          color: #6c757d;
          font-size: 0.9em;
          margin: 5px 0;
        }
        
        .print-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          margin: 20px 0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
        }
        
        .print-button:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
        <div class="header">
          <div class="logo">🗳️</div>
          <h1>CAMPUS BALLOT</h1>
          <div class="subtitle">Official Vote Confirmation Receipt</div>
        </div>
        
        <div class="receipt-body">
          <div class="success-indicator">
            <div class="checkmark">✓</div>
            <div class="success-text">Vote Successfully Recorded</div>
            <div class="success-subtitle">Thank you for participating in the democratic process</div>
          </div>
          
          <div class="alert-anonymity">
            <strong>🔒 Your Vote is Anonymous:</strong> This receipt does not contain details of who or what you voted for. 
            Your voting preferences are protected and remain completely confidential. Only the verification code proves you voted.
          </div>
          
          <div class="receipt-details">
            <div class="detail-row">
              <span class="detail-label">📊 Election</span>
              <span class="detail-value">${electionTitle}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📅 Date</span>
              <span class="detail-value">${new Date(votedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              })}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">⏰ Time</span>
              <span class="detail-value">${new Date(votedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}</span>
            </div>
          </div>
          
          <div class="verification-section">
            <div class="verification-title">🔐 Your Unique Verification Code</div>
            <div class="verification-code">${receiptId}</div>
            <div class="verification-note">
              <strong>Important:</strong> Save this code for your records. 
              You can use it to verify that your vote was recorded in the system. 
              This code is your proof of participation and is unique to you alone.
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">🗳️ Campus Ballot System</div>
          <div class="footer-text">Official vote confirmation receipt</div>
          <div class="footer-text">Your vote has been securely recorded and counted</div>
          <div class="footer-text">For verification support, contact election observers</div>
          
          <button onclick="window.print()" class="print-button">
            🖨️ Print This Receipt
          </button>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    // Open in new window and write document
    const receiptWindow = window.open('', '_blank', 'width=800,height=1000,scrollbars=yes,resizable=yes');
    if (receiptWindow) {
      receiptWindow.document.write(receiptHTML);
      receiptWindow.document.close();
      receiptWindow.focus();
    } else {
      console.error('Could not open print window');
      alert('Please allow pop-ups to print your receipt');
    }
  } catch (error) {
    console.error('Error generating receipt:', error);
    alert('An error occurred while generating your receipt. Please try again.');
  }
};
