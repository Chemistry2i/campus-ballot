import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract, FaCheckCircle, FaUserTie, FaVoteYea, FaShield, FaScaleBalanced, FaEnvelope } from 'react-icons/fa';
import './LegalPages.css';

const TermsOfService = () => {
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
              <FaFileContract />
            </div>
            <div>
              <h1>Terms of Service</h1>
              <p className="last-updated">Last Updated: January 29, 2026</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="legal-section">
          <h2><FaCheckCircle /> Agreement to Terms</h2>
          <p>
            By accessing and using Campus Ballot ("the Platform", "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaShield /> Use License</h2>
          <p>
            Subject to your compliance with these Terms of Service, Campus Ballot grants you a limited, non-exclusive, non-transferable license to use the Platform for lawful purposes. You are granted limited license rights to use the Platform solely for voting and participating in elections authorized by your institution.
          </p>
          <h3>Prohibited Activities</h3>
          <p>You may not:</p>
          <ul>
            <li>Attempt to gain unauthorized access to the Platform or its systems</li>
            <li>Use the Platform for any illegal or unauthorized purpose</li>
            <li>Reproduce, duplicate, copy, or sell any portion of the Platform</li>
            <li>Attempt to reverse engineer, decompile, or discover the source code</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Transmit malware, viruses, or any malicious code</li>
            <li>Interfere with the normal operation of the Platform</li>
            <li>Spam or send unsolicited messages</li>
            <li>Attempt to manipulate elections or voting results</li>
            <li>Create multiple accounts to circumvent system restrictions</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaUserTie /> User Accounts and Registration</h2>
          <h3>Account Creation</h3>
          <p>
            To use Campus Ballot, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your password and account information.
          </p>

          <h3>Account Eligibility</h3>
          <p>
            You must be at least 18 years old and a current student or authorized personnel of the institution to use this Platform. You must provide verified institutional email and valid student identification.
          </p>

          <h3>Account Responsibility</h3>
          <p>
            You are responsible for all activities that occur under your account. You agree to notify Campus Ballot immediately of any unauthorized use of your account. We are not liable for any loss or damage resulting from unauthorized access to your account.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaVoteYea /> Voting and Elections</h2>
          <h3>Voting Rights and Eligibility</h3>
          <p>
            Voting rights are determined by the institution and configured per election. Only eligible voters as determined by the election administrator may participate. By voting, you confirm your eligibility.
          </p>

          <h3>One Vote Per Election</h3>
          <p>
            Each eligible voter may cast only one vote per election. Attempting to vote multiple times is prohibited and may result in account suspension and legal action.
          </p>

          <h3>Vote Finality</h3>
          <div className="legal-highlight">
            <p>
              <strong>Votes are final and cannot be changed:</strong> Once you submit your vote, it cannot be modified or withdrawn. Please review your selections carefully before submitting.
            </p>
          </div>

          <h3>Vote Integrity</h3>
          <p>
            Your vote is immediately encrypted and separated from your personal information. Vote counting is performed transparently with audit trails. Results are announced according to the election timeline.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> User Content and Conduct</h2>
          <h3>Content Responsibility</h3>
          <p>
            Any content you upload or submit (profile information, messages, campaign materials, etc.) is your responsibility. You grant Campus Ballot a license to use your content for election administration and system operation.
          </p>

          <h3>Content Standards</h3>
          <p>
            All user content must be lawful, appropriate, and respectful. Prohibited content includes:
          </p>
          <ul>
            <li>Hateful, discriminatory, or threatening language</li>
            <li>Sexually explicit or inappropriate material</li>
            <li>Misinformation or false claims about elections</li>
            <li>Defamatory or libelous statements</li>
            <li>Content violating intellectual property rights</li>
          </ul>

          <h3>Content Moderation</h3>
          <p>
            We reserve the right to review, edit, or remove any content that violates these Terms. Repeated violations may result in account suspension or termination.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaShield /> Disclaimer of Warranties</h2>
          <div className="legal-highlight">
            <p>
              <strong>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE"</strong> WITHOUT WARRANTY OF ANY KIND. CAMPUS BALLOT DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </div>
          <p>
            We do not warrant that the Platform will be uninterrupted, error-free, or secure.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaScaleBalanced /> Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL CAMPUS BALLOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p>
            The total liability of Campus Ballot for any claims shall not exceed $100 USD.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Suspension and Termination</h2>
          <h3>Grounds for Suspension</h3>
          <p>
            We may suspend or terminate your account if you:
          </p>
          <ul>
            <li>Violate these Terms of Service</li>
            <li>Engage in illegal or harmful activity</li>
            <li>Violate institutional policies</li>
            <li>Pose a security risk to the Platform</li>
            <li>Provide false or fraudulent information</li>
          </ul>

          <h3>Effect of Termination</h3>
          <p>
            Upon termination, your right to access the Platform ceases immediately. We retain the right to retain your data according to our Privacy Policy and legal obligations.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaScaleBalanced /> Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of Uganda and the internal laws of that jurisdiction without regard to its conflict of law provisions.
          </p>
          <p>
            You agree to submit to the exclusive jurisdiction of the courts located in Kampala, Uganda.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaEnvelope /> Contact Information</h2>
          <div className="contact-info">
            <h3><FaEnvelope /> For Questions About These Terms</h3>
            <p>
              <strong>Email:</strong> <a href="mailto:legal@campusballot.tech">legal@campusballot.tech</a>
            </p>
            <p>
              <strong>Mailing Address:</strong><br />
              Campus Ballot - Legal Team<br />
              Kyambogo University<br />
              Kampala, Uganda
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            © 2026 Campus Ballot. All rights reserved. | These Terms of Service are effective as of January 29, 2026.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
