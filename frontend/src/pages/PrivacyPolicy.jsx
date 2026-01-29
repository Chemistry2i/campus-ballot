import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaDatabase, FaLock, FaUsers, FaCheckCircle, FaEnvelope, FaGavel } from 'react-icons/fa';
import './LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-container">
      <div className="legal-content-wrapper">
        {/* Back Navigation */}
        <div className="legal-top-nav">
          <Link to="/" className="back-to-home">
            <FaArrowLeft /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="legal-header">
          <div className="legal-header-content">
            <div className="legal-header-icon">
              <FaShieldAlt />
            </div>
            <div>
              <h1>Privacy Policy</h1>
              <p className="last-updated">Last Updated: January 29, 2026</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="legal-section">
          <h2><FaShieldAlt /> Introduction</h2>
          <p>
            Welcome to Campus Ballot ("the Platform", "we", "us", or "our"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>
          <p>
            Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Platform.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaDatabase /> Information We Collect</h2>
          <h3>Personal Information You Provide</h3>
          <p>We collect information you voluntarily provide, including:</p>
          <ul>
            <li><strong>Account Registration Data:</strong> Full name, student ID, institutional email, password, date of birth</li>
            <li><strong>Profile Information:</strong> Profile picture, bio, degree program, year of study</li>
            <li><strong>Contact Information:</strong> Phone number (optional), emergency contact details</li>
            <li><strong>Communication Data:</strong> Messages, feedback, support tickets, and correspondence</li>
            <li><strong>Application Data:</strong> For candidates, details provided in nomination applications</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>We automatically collect:</p>
          <ul>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent, clickstream data</li>
            <li><strong>Location Data:</strong> General location based on IP address (not precise)</li>
            <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, analytics data</li>
          </ul>

          <h3>Election-Related Data</h3>
          <p>
            Voting data is collected separately and processed with additional privacy protections. Your vote is immediately separated from your identity and encrypted.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> How We Use Your Information</h2>
          <p>We use collected information for:</p>
          <ul>
            <li>Creating and managing your account</li>
            <li>Facilitating election processes and voting</li>
            <li>Sending election updates and notifications</li>
            <li>Improving and personalizing your experience</li>
            <li>Responding to your inquiries and support requests</li>
            <li>Conducting analytics and system performance monitoring</li>
            <li>Complying with legal obligations and institutional policies</li>
            <li>Preventing fraud and ensuring platform security</li>
            <li>Enforcing our Terms of Service and other agreements</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaLock /> Vote Privacy and Separation</h2>
          <div className="legal-highlight">
            <p>
              <strong>Your Vote is Anonymous:</strong> Once your vote is submitted, it is immediately encrypted and separated from your personal identification information. No administrator can link your vote to your identity.
            </p>
          </div>
          <p>
            However, we maintain an audit trail that confirms you voted (without recording how you voted) to prevent duplicate voting and ensure election integrity.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaUsers /> Information Sharing</h2>
          <p>We do <strong>NOT</strong> sell your personal information. We share information only in these circumstances:</p>
          <ul>
            <li><strong>University Administrators:</strong> Limited information for election administration</li>
            <li><strong>Service Providers:</strong> Third-party vendors who assist with platform operations</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
            <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
          </ul>

          <h3>Third-Party Services</h3>
          <p>We use third-party services for:</p>
          <ul>
            <li>Cloud hosting and data storage</li>
            <li>Image hosting (Cloudinary)</li>
            <li>Email delivery</li>
            <li>Analytics and monitoring</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaDatabase /> Data Retention</h2>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Retention Period</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Account Information</td>
                <td>Until account deletion</td>
                <td>Account management</td>
              </tr>
              <tr>
                <td>Voting Records (Anonymous)</td>
                <td>Indefinitely</td>
                <td>Historical records, audit trail</td>
              </tr>
              <tr>
                <td>Audit Logs</td>
                <td>2 years</td>
                <td>Compliance, dispute resolution</td>
              </tr>
              <tr>
                <td>Support Tickets</td>
                <td>1 year after resolution</td>
                <td>Support history</td>
              </tr>
              <tr>
                <td>Device/Session Data</td>
                <td>90 days</td>
                <td>Security monitoring</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legal-section">
          <h2><FaLock /> Security Measures</h2>
          <p>We implement comprehensive security measures:</p>
          <ul>
            <li>SSL/TLS encryption for all data in transit</li>
            <li>AES-256 encryption for sensitive data at rest</li>
            <li>Secure authentication with password hashing (bcrypt)</li>
            <li>Two-factor authentication (2FA) available for sensitive accounts</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and role-based permissions</li>
            <li>Comprehensive audit logging of all sensitive operations</li>
            <li>Secure session management and timeout policies</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Your Privacy Rights</h2>
          <p>You have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Receive your data in machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at <strong>privacy@campusballot.tech</strong>
          </p>
        </div>

        <div className="legal-section">
          <h2><FaGavel /> Compliance</h2>
          <p>
            For users in the EU or countries with similar data protection laws, we comply with applicable regulations including GDPR. Your data is processed lawfully with your consent and for legitimate institutional interests.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaEnvelope /> Contact Us</h2>
          <div className="contact-info">
            <h3><FaEnvelope /> Privacy Inquiries</h3>
            <p>
              <strong>Email:</strong> <a href="mailto:privacy@campusballot.tech">privacy@campusballot.tech</a>
            </p>
            <p>
              <strong>Response Time:</strong> Within 30 days
            </p>
            <p>
              <strong>Mailing Address:</strong><br />
              Campus Ballot - Privacy Team<br />
              Kyambogo University<br />
              Kampala, Uganda
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            © 2026 Campus Ballot. All rights reserved. | This Privacy Policy is effective as of January 29, 2026.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
