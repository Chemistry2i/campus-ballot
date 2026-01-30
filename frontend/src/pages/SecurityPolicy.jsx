import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaShieldAlt, FaKey, FaDatabase, FaEye, FaCheckCircle, FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';
import ProgressIndicator from '../components/ProgressIndicator';
import TableOfContents from '../components/TableOfContents';
import PrintButton from '../components/PrintButton';
import './LegalPages.css';

const SecurityPolicy = () => {
  return (
    <div className="legal-container">
      {/* Progress Indicator */}
      <ProgressIndicator pageTitle="Security Policy" />

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
              <h1>Security Policy</h1>
              <p className="last-updated">Last Updated: January 29, 2026</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <PrintButton pageTitle="Security Policy" />

        {/* Table of Contents */}
        <TableOfContents pageTitle="Security Policy" />

        {/* Content Sections */}
        <div className="legal-section">
          <h2><FaLock /> Information Security Framework</h2>
          <p>
            Campus Ballot is committed to protecting the security and integrity of user data and election systems. We implement comprehensive security measures aligned with industry standards and regulatory requirements.
          </p>
          <p>
            Our security approach encompasses:
          </p>
          <ul>
            <li>Technical security controls (encryption, firewalls, intrusion detection)</li>
            <li>Administrative safeguards (access controls, staff training)</li>
            <li>Physical security (secure data centers, access restrictions)</li>
            <li>Operational procedures (incident response, vulnerability management)</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaKey /> Authentication and Access Control</h2>
          <h3>Authentication Methods</h3>
          <p>
            Campus Ballot employs multi-factor authentication to verify user identity:
          </p>
          <ul>
            <li>Institutional credentials (single sign-on via university system)</li>
            <li>Password requirements (minimum 8 characters, complexity requirements)</li>
            <li>Multi-factor authentication for sensitive operations</li>
            <li>Session timeout (automatic logout after inactivity)</li>
          </ul>

          <h3>Access Control Principles</h3>
          <p>
            We implement role-based access control (RBAC) with least-privilege principles:
          </p>
          <ul>
            <li>Users only access resources necessary for their role</li>
            <li>Administrative access is restricted and monitored</li>
            <li>Regular access reviews and revocation of unnecessary permissions</li>
            <li>Audit logging of all access attempts</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaDatabase /> Data Encryption</h2>
          <h3>Encryption in Transit</h3>
          <p>
            All data transmitted between users and Campus Ballot systems is encrypted using:
          </p>
          <ul>
            <li>TLS 1.2 or higher for all internet communications</li>
            <li>HTTPS protocol for all web connections</li>
            <li>Encrypted APIs for all data exchanges</li>
          </ul>

          <h3>Encryption at Rest</h3>
          <p>
            Sensitive data stored in our systems is encrypted using:
          </p>
          <ul>
            <li>AES-256 encryption for sensitive databases</li>
            <li>Industry-standard encryption algorithms</li>
            <li>Secure key management and rotation</li>
            <li>Encrypted backups and archives</li>
          </ul>

          <h3>Vote Encryption</h3>
          <p>
            Vote information is protected through:
          </p>
          <ul>
            <li>End-to-end encryption of voting data</li>
            <li>Cryptographic separation of voter identity and ballot content</li>
            <li>Tamper-evident audit trails</li>
            <li>Cryptographic verification of vote counts</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaShieldAlt /> Voter Privacy and Ballot Secrecy</h2>
          <p>
            Campus Ballot maintains strict ballot secrecy and voter privacy:
          </p>
          <ul>
            <li>Voter identity is never recorded with ballot content</li>
            <li>Vote audit logs do not reveal voting choices</li>
            <li>Aggregate results do not enable voter identification</li>
            <li>Access to voter records is strictly limited and audited</li>
            <li>Votes cannot be traced to individual voters</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaEye /> System Monitoring and Logging</h2>
          <h3>Continuous Monitoring</h3>
          <p>
            We maintain 24/7 monitoring of our systems for security threats:
          </p>
          <ul>
            <li>Network traffic monitoring for anomalies</li>
            <li>Intrusion detection and prevention systems</li>
            <li>Real-time security alerts and responses</li>
            <li>Vulnerability scanning and remediation</li>
          </ul>

          <h3>Audit Logging</h3>
          <p>
            Comprehensive audit logs record:
          </p>
          <ul>
            <li>All user authentication attempts</li>
            <li>Administrative actions and system changes</li>
            <li>Data access and modifications</li>
            <li>Security events and anomalies</li>
            <li>Vote submission and verification events</li>
          </ul>

          <h3>Log Protection</h3>
          <p>
            Audit logs are:
          </p>
          <ul>
            <li>Encrypted and protected from tampering</li>
            <li>Stored securely with restricted access</li>
            <li>Retained according to regulatory requirements</li>
            <li>Regularly reviewed for security events</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Vulnerability Management</h2>
          <h3>Vulnerability Assessment</h3>
          <p>
            We conduct regular security assessments:
          </p>
          <ul>
            <li>Quarterly penetration testing by independent security firms</li>
            <li>Regular vulnerability scanning and assessment</li>
            <li>Code security analysis and review</li>
            <li>Dependency vulnerability scanning</li>
          </ul>

          <h3>Patch Management</h3>
          <p>
            Security vulnerabilities are addressed through:
          </p>
          <ul>
            <li>Rapid patch development and testing</li>
            <li>Prioritized deployment of critical patches</li>
            <li>Emergency update procedures when necessary</li>
            <li>Comprehensive change management</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaExclamationTriangle /> Incident Response</h2>
          <h3>Incident Response Plan</h3>
          <p>
            Campus Ballot maintains a comprehensive incident response program:
          </p>
          <ul>
            <li>Dedicated incident response team</li>
            <li>24/7 incident detection and response</li>
            <li>Formal escalation procedures</li>
            <li>Documentation and analysis of all security incidents</li>
          </ul>

          <h3>Breach Notification</h3>
          <p>
            In the event of a security breach, affected users will be notified:
          </p>
          <ul>
            <li>Promptly and without unreasonable delay</li>
            <li>With details of the nature and scope of the breach</li>
            <li>With information about protective measures taken</li>
            <li>With guidance on steps users can take</li>
            <li>In compliance with applicable legal requirements</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Third-Party Security</h2>
          <p>
            Campus Ballot carefully manages third-party security risks:
          </p>
          <ul>
            <li>Vendors undergo security assessments before engagement</li>
            <li>Contractual security requirements are mandatory</li>
            <li>Regular security audits of third-party systems</li>
            <li>Restricted data access for third-party vendors</li>
            <li>Data processing agreements for compliance</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Security Training and Awareness</h2>
          <p>
            Our staff receives regular security training:
          </p>
          <ul>
            <li>Annual security awareness training for all employees</li>
            <li>Role-specific security training (administrators, developers)</li>
            <li>Incident response training and drills</li>
            <li>Secure development practices training</li>
            <li>Social engineering and phishing awareness</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Responsible Disclosure</h2>
          <p>
            We welcome responsible security research and reporting:
          </p>
          <ul>
            <li>Email security vulnerabilities to: security@campusballot.tech</li>
            <li>Do not publicly disclose vulnerabilities without notification</li>
            <li>Allow reasonable time for patches before disclosure</li>
            <li>Avoid unauthorized system access or data access</li>
            <li>We will acknowledge receipt and work toward resolution</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Compliance and Certification</h2>
          <p>
            Campus Ballot maintains security compliance:
          </p>
          <ul>
            <li>Regular third-party security audits</li>
            <li>Compliance with data protection regulations</li>
            <li>International security standards alignment</li>
            <li>Electoral security best practices</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaEnvelope /> Security Inquiries and Reporting</h2>
          <div className="contact-info">
            <h3><FaEnvelope /> Report Security Issues</h3>
            <p>
              <strong>Email:</strong> <a href="mailto:security@campusballot.tech">security@campusballot.tech</a>
            </p>
            <p>
              <strong>Response Time:</strong> Within 24 hours
            </p>
            <p>
              <strong>Escalation:</strong> For urgent security matters, contact the Chief Information Security Officer
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            © 2026 Campus Ballot. All rights reserved. | Security is our priority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;
