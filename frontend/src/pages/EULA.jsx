import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaScroll, FaCheckCircle, FaShield, FaLock, FaEnvelope } from 'react-icons/fa';
import './LegalPages.css';

const EULA = () => {
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
              <FaScroll />
            </div>
            <div>
              <h1>End-User License Agreement (EULA)</h1>
              <p className="last-updated">Last Updated: January 29, 2026</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="legal-section">
          <h2><FaCheckCircle /> Definitions</h2>
          <p>
            <strong>"Software"</strong> refers to the Campus Ballot application, including all associated components, modules, documentation, and any updates or upgrades provided by Campus Ballot.
          </p>
          <p>
            <strong>"End-User"</strong> refers to any person who accesses and uses Campus Ballot through authorized channels.
          </p>
          <p>
            <strong>"Licensor"</strong> refers to Campus Ballot and Kyambogo University.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaShield /> License Grant</h2>
          <p>
            Subject to the terms of this EULA, Campus Ballot grants End-Users a limited, non-exclusive, non-transferable license to use the Software for the purpose of participating in institutional elections and voting processes.
          </p>
          <h3>License Scope</h3>
          <p>
            This license is limited to:
          </p>
          <ul>
            <li>Access and use during active election periods</li>
            <li>Participation in authorized voting activities</li>
            <li>Communication with election administrators</li>
            <li>Viewing election results and information</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaLock /> Restrictions</h2>
          <p>
            End-Users SHALL NOT:
          </p>
          <ul>
            <li>Copy, modify, or create derivative works of the Software</li>
            <li>Reverse engineer, disassemble, or decompile the Software</li>
            <li>Sell, transfer, or sublicense the Software</li>
            <li>Use the Software for commercial purposes</li>
            <li>Remove or alter any proprietary notices or labels</li>
            <li>Use the Software to develop competing products</li>
            <li>Publicly display or perform the Software</li>
            <li>Attempt to access the Software through unauthorized means</li>
            <li>Use the Software to violate applicable laws or regulations</li>
            <li>Attempt to manipulate the voting or election systems</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaShield /> Intellectual Property Rights</h2>
          <p>
            All intellectual property rights in and to the Software, including all copies, modifications, and derivative works, are owned by Campus Ballot or its licensors. This license does not transfer any ownership rights to the End-User.
          </p>
          <p>
            The Software is protected by international copyright laws and treaties. Unauthorized reproduction or distribution is prohibited.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Software Updates and Maintenance</h2>
          <p>
            Campus Ballot may provide updates, patches, or new versions of the Software at its sole discretion. Updates may be mandatory for continued access to the Platform. Updates are provided under the same terms as this EULA.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> User Responsibilities</h2>
          <p>
            End-Users agree to:
          </p>
          <ul>
            <li>Maintain the confidentiality of account credentials</li>
            <li>Provide accurate registration information</li>
            <li>Use the Software lawfully and ethically</li>
            <li>Report security vulnerabilities responsibly</li>
            <li>Comply with all institutional policies</li>
            <li>Not attempt to circumvent security measures</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><FaShield /> No Warranty</h2>
          <div className="legal-highlight">
            <p>
              <strong>THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong>
            </p>
          </div>
          <p>
            Campus Ballot SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
          </p>
          <p>
            Campus Ballot does not warrant that the Software will meet your requirements, operate uninterrupted, or be error-free.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaLock /> Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL CAMPUS BALLOT, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO END-USERS FOR ANY DAMAGES, INCLUDING:
          </p>
          <ul>
            <li>Direct, indirect, incidental, or consequential damages</li>
            <li>Loss of profits, data, or use</li>
            <li>Business interruption or loss of business opportunities</li>
            <li>Any other damages arising from use of the Software</li>
          </ul>
          <p>
            This limitation applies even if Campus Ballot has been advised of the possibility of such damages.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Term and Termination</h2>
          <h3>License Term</h3>
          <p>
            This EULA is effective until terminated. Your license rights continue as long as you comply with the terms.
          </p>

          <h3>Termination</h3>
          <p>
            Campus Ballot may terminate this EULA and your license immediately if you:
          </p>
          <ul>
            <li>Breach any material term of this EULA</li>
            <li>Engage in illegal or harmful activity</li>
            <li>Violate institutional policies</li>
            <li>No longer meet eligibility requirements</li>
          </ul>

          <h3>Effect of Termination</h3>
          <p>
            Upon termination, you must cease all use of the Software and delete any copies in your possession. Sections regarding liability, intellectual property, and confidentiality survive termination.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaCheckCircle /> Entire Agreement</h2>
          <p>
            This EULA, together with the Terms of Service and Privacy Policy, constitutes the entire agreement between Campus Ballot and End-User regarding the Software and supersedes all prior agreements, understandings, and negotiations.
          </p>
        </div>

        <div className="legal-section">
          <h2><FaEnvelope /> Contact Information</h2>
          <div className="contact-info">
            <h3><FaEnvelope /> For EULA Inquiries</h3>
            <p>
              <strong>Email:</strong> <a href="mailto:legal@campusballot.tech">legal@campusballot.tech</a>
            </p>
            <p>
              <strong>Response Time:</strong> Within 48 hours
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            © 2026 Campus Ballot. All rights reserved. | This EULA is effective as of January 29, 2026.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EULA;
