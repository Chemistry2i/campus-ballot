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
  },

  /**
   * Welcome email sent to users created via bulk import
   */
  bulkImportWelcome: ({ userName, userEmail, password, role, organizationName = 'Campus Ballot', loginUrl = 'https://campusballot.tech/login' }) => {
    const roleDisplay = {
      'student': 'Student Voter',
      'admin': 'Administrator',
      'observer': 'Election Observer',
      'candidate': 'Candidate',
      'agent': 'Campaign Agent',
      'federation_admin': 'Federation Administrator'
    };
    
    return {
      subject: `Welcome to Campus Ballot - Your Account Has Been Created`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0d6efd 0%, #0056d2 100%); color: white; padding: 50px 30px; text-align: center; }
            .header-icon { font-size: 48px; margin-bottom: 15px; }
            .header h1 { font-size: 32px; margin-bottom: 8px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 35px; }
            .welcome-text { font-size: 18px; color: #333; margin-bottom: 25px; }
            .welcome-text .name { color: #0d6efd; font-weight: 700; }
            .credentials-box { background: linear-gradient(135deg, #f8fafc 0%, #f0f6ff 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; }
            .credentials-box h3 { color: #0d6efd; font-size: 16px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
            .credential-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .credential-row:last-child { border-bottom: none; }
            .credential-label { color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
            .credential-value { color: #1e293b; font-size: 15px; font-weight: 600; font-family: 'Consolas', 'Monaco', monospace; background: #fff; padding: 8px 14px; border-radius: 6px; border: 1px solid #e2e8f0; }
            .password-value { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
            .warning-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0; display: flex; align-items: flex-start; gap: 12px; }
            .warning-icon { color: #f59e0b; font-size: 20px; flex-shrink: 0; }
            .warning-text { color: #92400e; font-size: 13px; line-height: 1.6; }
            .info-section { margin: 30px 0; }
            .info-section h2 { color: #0d6efd; font-size: 18px; margin-bottom: 15px; font-weight: 600; }
            .info-section p { color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 12px; }
            .feature-list { list-style: none; margin: 15px 0; }
            .feature-list li { padding: 10px 0; padding-left: 28px; position: relative; color: #555; font-size: 14px; }
            .feature-list li::before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 16px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #0d6efd 0%, #0056d2 100%); color: white !important; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 25px 0; text-align: center; box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3); }
            .cta-button:hover { background: linear-gradient(135deg, #0056d2 0%, #004299 100%); }
            .org-badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
            .role-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 8px; }
            .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 30px 0; }
            .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer p { color: #64748b; font-size: 12px; margin: 6px 0; }
            .footer-links { margin-top: 15px; }
            .footer-link { color: #0d6efd; text-decoration: none; font-weight: 600; font-size: 13px; margin: 0 10px; }
            .social-links { margin-top: 20px; }
            .social-link { display: inline-block; width: 36px; height: 36px; background: #e2e8f0; border-radius: 50%; margin: 0 5px; line-height: 36px; color: #64748b; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-icon">🗳️</div>
              <h1>Welcome to Campus Ballot!</h1>
              <p>Your secure digital voting platform</p>
            </div>
            
            <div class="content">
              <p class="welcome-text">
                Hello <span class="name">${userName}</span>,
              </p>
              
              <p style="color: #555; font-size: 15px; line-height: 1.8; margin-bottom: 20px;">
                We're excited to welcome you to <strong>Campus Ballot</strong>! Your account has been successfully created by your institution's administrator. You now have access to participate in secure digital elections.
              </p>
              
              <div style="margin-bottom: 15px;">
                <span class="org-badge">📍 ${organizationName}</span>
                <span class="role-badge">👤 ${roleDisplay[role] || role}</span>
              </div>
              
              <div class="credentials-box">
                <h3>🔐 Your Login Credentials</h3>
                <div class="credential-row">
                  <span class="credential-label">Email Address</span>
                  <span class="credential-value">${userEmail}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Temporary Password</span>
                  <span class="credential-value password-value">${password}</span>
                </div>
              </div>
              
              <div class="warning-box">
                <span class="warning-icon">⚠️</span>
                <span class="warning-text">
                  <strong>Important Security Notice:</strong> Please change your password immediately after your first login. This temporary password should not be shared with anyone. For your security, we recommend using a strong, unique password.
                </span>
              </div>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="cta-button">Login to Your Account →</a>
              </div>
              
              <div class="divider"></div>
              
              <div class="info-section">
                <h2>What You Can Do</h2>
                <p>As a registered member, you have access to:</p>
                <ul class="feature-list">
                  <li>Participate in secure, transparent elections</li>
                  <li>View upcoming and ongoing elections</li>
                  <li>Cast your vote with complete privacy</li>
                  <li>Track election results in real-time</li>
                  <li>Receive important election notifications</li>
                </ul>
              </div>
              
              <div class="divider"></div>
              
              <div class="info-section">
                <h2>Getting Started</h2>
                <p>Follow these simple steps to get started:</p>
                <ol style="margin-left: 20px; color: #555; font-size: 14px; line-height: 2;">
                  <li>Click the login button above or visit <strong>${loginUrl}</strong></li>
                  <li>Enter your email and temporary password</li>
                  <li>Change your password to something secure and memorable</li>
                  <li>Complete your profile information</li>
                  <li>You're ready to participate in elections!</li>
                </ol>
              </div>
              
              <div class="divider"></div>
              
              <p style="color: #555; font-size: 14px; line-height: 1.8;">
                If you have any questions or need assistance, please don't hesitate to contact your institution's election administrator or our support team.
              </p>
              
              <p style="margin-top: 25px; color: #333;">
                Welcome aboard!<br>
                <strong style="color: #0d6efd;">The Campus Ballot Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Campus Ballot</strong> - Secure Digital Voting for Universities</p>
              <p>This is an automated welcome message. Please do not reply to this email.</p>
              <div class="footer-links">
                <a href="${loginUrl}" class="footer-link">Login</a>
                <a href="#" class="footer-link">Help Center</a>
                <a href="#" class="footer-link">Contact Support</a>
              </div>
              <p style="margin-top: 20px;">© 2026 Campus Ballot. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  /**
   * Email verification template
   */
  verifyEmail: ({ userName, verifyUrl }) => {
    return {
      subject: "Verify your email",
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 40px; }
            .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗳️ Campus Ballot</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">University Voting Platform</p>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Thank you for registering with Campus Ballot! To complete your registration and gain access to our voting platform, please verify your email address by clicking the button below.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </div>
              <div style="background: #e8f4f8; padding: 12px; border-left: 4px solid #667eea; margin: 20px 0; font-size: 13px; color: #555;">
                <strong>⏱️ Note:</strong> This verification link will expire in 1 hour. If you didn't create this account, you can safely ignore this email.
              </div>
              <p>If the button above doesn't work, copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 12px;">${verifyUrl}</p>
            </div>
            <div class="footer">
              <p>© 2026 Campus Ballot. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>`
    };
  },

  /**
   * Password reset template
   */
  resetPassword: ({ userName, resetUrl }) => {
    return {
      subject: "Password Reset Request",
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; }
            .content { background: white; padding: 40px; }
            .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗳️ Campus Ballot</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>We received a request to reset your Campus Ballot password. Click the button below to create a new password.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div style="background: #fff3cd; padding: 12px; border-left: 4px solid #ffc107; margin: 20px 0; font-size: 13px; color: #856404;">
                <strong>⚠️ Security Alert:</strong> This link expires in 30 minutes. If you didn't request this, please ignore this email.
              </div>
              <p>Or copy this link:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 12px;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>© 2026 Campus Ballot. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>`
    };
  }
};

module.exports = emailTemplates;
