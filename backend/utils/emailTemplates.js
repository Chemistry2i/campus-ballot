/**
 * Professional Email Templates for Candidate Applications
 * Uses Campus Ballot branding with professional blue color (#0d6efd)
 */

const emailTemplates = {
  /**
   * Email sent when candidate application is submitted
   */
  applicationSubmitted: ({ candidateName, electionTitle, position, userEmail }) => {
    return {
      subject: `Your Candidacy Application Received - ${electionTitle}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #0d6efd; color: white; padding: 40px 20px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 600; }
            .header p { font-size: 14px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .content h2 { color: #0d6efd; font-size: 20px; margin-bottom: 20px; font-weight: 600; }
            .content p { margin-bottom: 15px; color: #555; font-size: 14px; line-height: 1.8; }
            .info-box { background: #f0f6ff; border-left: 4px solid #0d6efd; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-box .label { color: #0d6efd; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-box .value { color: #333; font-size: 16px; margin-top: 5px; font-weight: 500; }
            .status-badge { display: inline-block; background: #ffc107; color: #333; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 12px; text-transform: uppercase; margin: 15px 0; }
            .footer { background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee; }
            .footer p { color: #666; font-size: 12px; margin: 8px 0; }
            .footer-link { color: #0d6efd; text-decoration: none; font-weight: 600; }
            .divider { height: 1px; background: #eee; margin: 25px 0; }
            .highlight { color: #0d6efd; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Received</h1>
              <p>Campus Ballot - Candidate Registration</p>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${candidateName}</span>,</p>
              
              <p>Thank you for applying as a candidate in the <span class="highlight">${electionTitle}</span> election!</p>
              
              <div class="info-box">
                <div class="label">Application Status</div>
                <div class="value">Pending Review</div>
              </div>
              
              <p>We have successfully received your candidacy application for the position of <span class="highlight">${position}</span>. Our team will carefully review your application and verify all submitted information.</p>
              
              <div class="divider"></div>
              
              <h2>What's Next?</h2>
              <p>Here's what you can expect:</p>
              <ul style="margin-left: 20px; margin-bottom: 15px;">
                <li style="margin-bottom: 10px; color: #555;">Our admins will review your application and documentation</li>
                <li style="margin-bottom: 10px; color: #555;">We'll verify your eligibility and qualifications</li>
                <li style="margin-bottom: 10px; color: #555;">You'll receive an email notification when your application is approved or if we need additional information</li>
                <li style="margin-bottom: 10px; color: #555;">Typically, applications are reviewed within 3-5 business days</li>
              </ul>
              
              <div class="divider"></div>
              
              <p>If you have any questions about your application, please don't hesitate to contact our support team. You can check the status of your application anytime by logging into your Campus Ballot account.</p>
              
              <p>We appreciate your interest in participating in this important election!</p>
              
              <p style="margin-top: 25px;">Best regards,<br><span class="highlight">Campus Ballot Administration</span></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2026 Campus Ballot. All rights reserved.</p>
              <p><a href="#" class="footer-link">View Your Dashboard</a> | <a href="#" class="footer-link">Contact Support</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  /**
   * Email sent when candidate application is approved
   */
  applicationApproved: ({ candidateName, electionTitle, position, userEmail }) => {
    return {
      subject: `Congratulations! Your Candidacy Application is Approved - ${electionTitle}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #0d6efd; color: white; padding: 40px 20px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 600; }
            .header p { font-size: 14px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .content h2 { color: #0d6efd; font-size: 20px; margin-bottom: 20px; font-weight: 600; }
            .content p { margin-bottom: 15px; color: #555; font-size: 14px; line-height: 1.8; }
            .info-box { background: #f0f6ff; border-left: 4px solid #0d6efd; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-box .label { color: #0d6efd; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-box .value { color: #333; font-size: 16px; margin-top: 5px; font-weight: 500; }
            .status-badge { display: inline-block; background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 12px; text-transform: uppercase; margin: 15px 0; }
            .footer { background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee; }
            .footer p { color: #666; font-size: 12px; margin: 8px 0; }
            .footer-link { color: #0d6efd; text-decoration: none; font-weight: 600; }
            .divider { height: 1px; background: #eee; margin: 25px 0; }
            .highlight { color: #0d6efd; font-weight: 600; }
            .success { color: #10b981; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Application Approved!</h1>
              <p>Campus Ballot - Candidate Registration</p>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${candidateName}</span>,</p>
              
              <p>We are delighted to inform you that your candidacy application has been <span class="success">APPROVED</span>!</p>
              
              <div class="info-box">
                <div class="label">Application Status</div>
                <div class="value"><span class="success">✓ APPROVED</span></div>
              </div>
              
              <p>Your application for the position of <span class="highlight">${position}</span> in the <span class="highlight">${electionTitle}</span> election has been reviewed and approved by our administration team. You are now officially registered as a candidate for this election.</p>
              
              <div class="divider"></div>
              
              <h2>What Happens Now?</h2>
              <p>As an approved candidate, you can now:</p>
              <ul style="margin-left: 20px; margin-bottom: 15px;">
                <li style="margin-bottom: 10px; color: #555;">Access your candidate dashboard and campaign materials section</li>
                <li style="margin-bottom: 10px; color: #555;">Upload campaign photos, videos, and promotional materials</li>
                <li style="margin-bottom: 10px; color: #555;">View detailed election information and important dates</li>
                <li style="margin-bottom: 10px; color: #555;">Track your campaign performance and voter engagement</li>
                <li style="margin-bottom: 10px; color: #555;">Communicate with your supporters through the platform</li>
              </ul>
              
              <div class="divider"></div>
              
              <p><span class="highlight">Important Reminders:</span></p>
              <ul style="margin-left: 20px; margin-bottom: 15px;">
                <li style="margin-bottom: 10px; color: #555;">Please review the election guidelines and campaign regulations</li>
                <li style="margin-bottom: 10px; color: #555;">Ensure all your campaign materials comply with our code of conduct</li>
                <li style="margin-bottom: 10px; color: #555;">Stay updated with important election dates and deadlines</li>
              </ul>
              
              <p style="margin-top: 25px;">We wish you the very best in your candidacy campaign! If you need any assistance or have questions, please don't hesitate to reach out to our support team.</p>
              
              <p style="margin-top: 25px;">Best regards,<br><span class="highlight">Campus Ballot Administration</span></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2026 Campus Ballot. All rights reserved.</p>
              <p><a href="#" class="footer-link">View Your Dashboard</a> | <a href="#" class="footer-link">Contact Support</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  /**
   * Email sent when candidate application is disqualified
   */
  applicationDisqualified: ({ candidateName, electionTitle, position, userEmail, reason = null }) => {
    return {
      subject: `Application Status Update - ${electionTitle}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #0d6efd; color: white; padding: 40px 20px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 600; }
            .header p { font-size: 14px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .content h2 { color: #0d6efd; font-size: 20px; margin-bottom: 20px; font-weight: 600; }
            .content p { margin-bottom: 15px; color: #555; font-size: 14px; line-height: 1.8; }
            .info-box { background: #fff5f5; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-box .label { color: #dc3545; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-box .value { color: #333; font-size: 16px; margin-top: 5px; font-weight: 500; }
            .footer { background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee; }
            .footer p { color: #666; font-size: 12px; margin: 8px 0; }
            .footer-link { color: #0d6efd; text-decoration: none; font-weight: 600; }
            .divider { height: 1px; background: #eee; margin: 25px 0; }
            .highlight { color: #0d6efd; font-weight: 600; }
            .warning { color: #dc3545; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Status Update</h1>
              <p>Campus Ballot - Candidate Registration</p>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${candidateName}</span>,</p>
              
              <p>Thank you for submitting your candidacy application for the <span class="highlight">${electionTitle}</span> election. After careful review, we regret to inform you that your application has not been approved at this time.</p>
              
              <div class="info-box">
                <div class="label">Application Status</div>
                <div class="value"><span class="warning">✗ NOT APPROVED</span></div>
              </div>
              
              <p>Your application for the position of <span class="highlight">${position}</span> was reviewed by our administration team. Unfortunately, your application does not meet the required criteria for candidacy in this election.</p>
              
              ${reason ? `
              <div class="info-box">
                <div class="label">Reason for Decision</div>
                <div class="value">${reason}</div>
              </div>
              ` : ''}
              
              <div class="divider"></div>
              
              <h2>What You Can Do Next</h2>
              <p>We appreciate your interest in running for a position. Here are your options:</p>
              <ul style="margin-left: 20px; margin-bottom: 15px;">
                <li style="margin-bottom: 10px; color: #555;">Review the requirements and guidelines for future elections</li>
                <li style="margin-bottom: 10px; color: #555;">Ensure you meet all eligibility criteria before applying again</li>
                <li style="margin-bottom: 10px; color: #555;">Contact our support team for clarification on the decision</li>
                <li style="margin-bottom: 10px; color: #555;">Consider applying for different positions in upcoming elections</li>
              </ul>
              
              <div class="divider"></div>
              
              <p>If you believe this decision was made in error or if you have questions about the reasons for rejection, please don't hesitate to contact our support team. We are here to help and will be happy to discuss your concerns.</p>
              
              <p style="margin-top: 25px;">We encourage you to remain involved in your campus community, and we hope to see you participate in future elections.</p>
              
              <p style="margin-top: 25px;">Best regards,<br><span class="highlight">Campus Ballot Administration</span></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2026 Campus Ballot. All rights reserved.</p>
              <p><a href="#" class="footer-link">Contact Support</a> | <a href="#" class="footer-link">Election Guidelines</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};

module.exports = emailTemplates;
