// PDF Receipt Generator for Vote Confirmation
export const generateVoteReceipt = (voteData) => {
  const { election, candidate, votedAt, verificationCode } = voteData;
  
  // Create a simple HTML receipt that can be printed or saved
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vote Receipt - ${election.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .receipt {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #0d6efd;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #0d6efd;
          margin: 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        .label {
          font-weight: bold;
          color: #666;
        }
        .value {
          color: #333;
        }
        .verification {
          background: #f8f9fa;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
          text-align: center;
        }
        .code {
          font-size: 24px;
          font-weight: bold;
          color: #0d6efd;
          letter-spacing: 2px;
          font-family: monospace;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #10b981;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
        }
        @media print {
          body { background: white; margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="checkmark">✓</div>
          <h1>Vote Confirmation Receipt</h1>
          <p style="color: #666; margin-top: 10px;">Your vote has been successfully recorded</p>
        </div>
        
        <div class="info-row">
          <span class="label">Election:</span>
          <span class="value">${election.title}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Candidate:</span>
          <span class="value">${candidate.name}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Position:</span>
          <span class="value">${candidate.position || 'N/A'}</span>
        </div>
        
        <div class="info-row">
          <span class="label">Date & Time:</span>
          <span class="value">${new Date(votedAt).toLocaleString()}</span>
        </div>
        
        <div class="verification">
          <p class="label" style="margin-bottom: 10px;">Verification Code:</p>
          <div class="code">${verificationCode}</div>
          <p style="margin-top: 10px; font-size: 12px; color: #666;">
            Save this code for your records. You can use it to verify your vote.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an official vote receipt from Campus Ballot System</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p style="margin-top: 20px;" class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; background: #0d6efd; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print Receipt
            </button>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Open in new window
  const receiptWindow = window.open('', '_blank');
  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
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
