import { Container, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTools, FaCheckCircle, FaLaptop, FaWifi, FaGlobe, FaHeadset, FaEnvelope } from 'react-icons/fa';
import ProgressIndicator from '../components/ProgressIndicator';
import TableOfContents from '../components/TableOfContents';
import PrintButton from '../components/PrintButton';
import './LegalPages.css';

const TechnicalSupport = () => {
  return (
    <div className="legal-container">
      {/* Progress Indicator */}
      <ProgressIndicator pageTitle="Technical Support" />

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
              <FaTools />
            </div>
            <div>
              <h1>Technical Support & System Requirements</h1>
              <p className="last-updated">Last Updated: January 29, 2026</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <PrintButton pageTitle="Technical Support" />

        {/* Table of Contents */}
        <TableOfContents pageTitle="Technical Support" />

        {/* System Requirements Section */}
        <div className="legal-section">
          <h2><FaLaptop /> System Requirements</h2>
          <h3>Minimum Requirements</h3>
          <ul>
            <li><strong>Browser:</strong> Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</li>
            <li><strong>Screen Size:</strong> 320px width (mobile) to 2560px (desktop)</li>
            <li><strong>Internet:</strong> Minimum 1 Mbps connection speed</li>
            <li><strong>JavaScript:</strong> Required - must be enabled</li>
            <li><strong>Cookies:</strong> Required - must be enabled</li>
            <li><strong>Storage:</strong> 5MB local storage space</li>
          </ul>

          <h3>Recommended Setup</h3>
          <ul>
            <li><strong>Browser:</strong> Latest version of Chrome, Firefox, Safari, or Edge</li>
            <li><strong>Internet Speed:</strong> 5+ Mbps for optimal performance</li>
            <li><strong>Device:</strong> Desktop or tablet preferred for voting</li>
            <li><strong>Connection:</strong> Wired connection for critical operations</li>
          </ul>
        </div>

        {/* Troubleshooting Guide */}
        <div className="legal-section">
          <h2><FaCheckCircle /> Troubleshooting Guide</h2>
          
          <Accordion className="mb-4" defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header><FaCheckCircle className="me-2" />Login Issues</Accordion.Header>
              <Accordion.Body>
                <h5>Problem: "Invalid credentials" error</h5>
                <ul>
                  <li>Ensure Caps Lock is OFF</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Check if email is correct</li>
                  <li>Use "Forgot Password" to reset</li>
                </ul>

                <h5 className="mt-3">Problem: "Account not verified"</h5>
                <ul>
                  <li>Check email (including spam folder) for verification link</li>
                  <li>Click the verification link to activate account</li>
                  <li>Wait 5 minutes after registration before logging in</li>
                </ul>

                <h5 className="mt-3">Problem: 2FA code not working</h5>
                <ul>
                  <li>Ensure device clock is synchronized</li>
                  <li>Codes expire after 30 seconds</li>
                  <li>Verify authenticator app is up to date</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header><FaCheckCircle className="me-2" />Page Loading Issues</Accordion.Header>
              <Accordion.Body>
                <h5>Problem: Page won't load or keeps refreshing</h5>
                <ul>
                  <li>Clear browser cache and cookies</li>
                  <li>Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)</li>
                  <li>Disable browser extensions temporarily</li>
                  <li>Try incognito/private browsing window</li>
                  <li>Try a different browser</li>
                </ul>

                <h5 className="mt-3">Problem: Elements not displaying correctly</h5>
                <ul>
                  <li>Clear browser cache</li>
                  <li>Hard refresh the page</li>
                  <li>Check browser zoom level (reset to 100%)</li>
                  <li>Disable browser extensions</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header><FaCheckCircle className="me-2" />Voting Issues</Accordion.Header>
              <Accordion.Body>
                <h5>Problem: Cannot access voting page</h5>
                <ul>
                  <li>Verify you're logged in</li>
                  <li>Check election voting period is active</li>
                  <li>Verify your eligibility to vote</li>
                  <li>Check if you've already voted</li>
                </ul>

                <h5 className="mt-3">Problem: Cannot select candidates</h5>
                <ul>
                  <li>Ensure all required positions are selected</li>
                  <li>Refresh page if candidates not loaded</li>
                  <li>Try a different browser</li>
                  <li>Disable browser extensions</li>
                </ul>

                <h5 className="mt-3">Problem: Vote submission fails</h5>
                <ul>
                  <li>Check internet connection stability</li>
                  <li>Don't refresh during submission</li>
                  <li>Wait for confirmation message</li>
                  <li>Contact support with your student ID</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header><FaCheckCircle className="me-2" />Account & Profile Issues</Accordion.Header>
              <Accordion.Body>
                <h5>Problem: Forgot password</h5>
                <ol>
                  <li>Click "Forgot Password" on login page</li>
                  <li>Enter registered email address</li>
                  <li>Check email for reset link (expires in 1 hour)</li>
                  <li>Click link and enter new password</li>
                </ol>

                <h5 className="mt-3">Problem: Cannot update profile information</h5>
                <ul>
                  <li>Refresh the page</li>
                  <li>Log out and log back in</li>
                  <li>Try updating one field at a time</li>
                  <li>Contact support if unable to save</li>
                </ul>

                <h5 className="mt-3">Problem: Account locked or suspended</h5>
                <ul>
                  <li>Contact support immediately with your student ID</li>
                  <li>Provide any relevant information</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="4">
              <Accordion.Header><FaCheckCircle className="me-2" />Mobile Specific Issues</Accordion.Header>
              <Accordion.Body>
                <h5>Problem: App unresponsive on mobile</h5>
                <ul>
                  <li>Refresh the page</li>
                  <li>Close other browser tabs</li>
                  <li>Restart your phone</li>
                  <li>Update your browser</li>
                  <li>Try mobile data instead of WiFi</li>
                </ul>

                <h5 className="mt-3">Problem: Button clicks not registering</h5>
                <ul>
                  <li>Wait a moment and try again</li>
                  <li>Try zooming out (pinch gesture)</li>
                  <li>Tap more centered on the button</li>
                  <li>Restart browser or phone</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="5">
              <Accordion.Header><FaCheckCircle className="me-2" />Performance Issues</Accordion.Header>
              <Accordion.Body>
                <h5>Problem: Website is slow</h5>
                <ul>
                  <li>Check internet connection speed</li>
                  <li>Close other applications and browser tabs</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Disable browser extensions</li>
                  <li>Try from a different network</li>
                </ul>

                <h5 className="mt-3">Problem: High data usage</h5>
                <ul>
                  <li>Close other connections</li>
                  <li>Use mobile data saver mode</li>
                  <li>Disable auto-play if present</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        {/* Browser-Specific Solutions */}
        <div className="legal-section">
          <h2><FaGlobe /> Browser-Specific Solutions</h2>
          
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header><FaGlobe className="me-2" />Google Chrome</Accordion.Header>
              <Accordion.Body>
                <p><strong>Clear Cache:</strong> Settings → Privacy and security → Clear browsing data</p>
                <p><strong>Disable Extensions:</strong> Settings → Extensions → Disable all</p>
                <p><strong>Hard Refresh:</strong> Ctrl+Shift+R</p>
                <p><strong>Update:</strong> Settings → About Chrome → Check for updates</p>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header><FaGlobe className="me-2" />Mozilla Firefox</Accordion.Header>
              <Accordion.Body>
                <p><strong>Clear Cache:</strong> Settings → Privacy & Security → Cookies and Site Data → Clear Data</p>
                <p><strong>Disable Extensions:</strong> Add-ons → Extensions → Disable all</p>
                <p><strong>Hard Refresh:</strong> Ctrl+Shift+R</p>
                <p><strong>Update:</strong> Settings → Help → About Firefox</p>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header><FaGlobe className="me-2" />Safari</Accordion.Header>
              <Accordion.Body>
                <p><strong>Clear Cache:</strong> Safari → Preferences → Privacy → Manage Website Data → Remove All</p>
                <p><strong>Disable Extensions:</strong> Safari → Preferences → Extensions</p>
                <p><strong>Hard Refresh:</strong> Cmd+Shift+R</p>
                <p><strong>Update:</strong> App Store → Updates → Safari</p>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header><FaGlobe className="me-2" />Microsoft Edge</Accordion.Header>
              <Accordion.Body>
                <p><strong>Clear Cache:</strong> Settings → Privacy → Clear browsing data</p>
                <p><strong>Disable Extensions:</strong> Settings → Extensions → Manage extensions</p>
                <p><strong>Hard Refresh:</strong> Ctrl+Shift+R</p>
                <p><strong>Update:</strong> Settings → About Microsoft Edge</p>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        {/* Network Requirements */}
        <div className="legal-section">
          <h2><FaWifi /> Network Requirements</h2>
          <h3>Internet Connection</h3>
          <ul>
            <li><strong>Minimum Speed:</strong> 1 Mbps (recommended 5+ Mbps)</li>
            <li><strong>Stability:</strong> Use wired connection for voting when possible</li>
            <li><strong>Avoid Public WiFi:</strong> Use secure networks for sensitive operations</li>
            <li><strong>VPN:</strong> Disable VPN if experiencing connection issues</li>
          </ul>

          <h3>Firewall and Security</h3>
          <ul>
            <li>Ensure campusballot.tech is not blocked by firewall</li>
            <li>Whitelist if using restrictive firewall</li>
            <li>Disable proxy if experiencing issues</li>
            <li>Contact IT department if institutional firewall blocks access</li>
          </ul>
        </div>

        {/* Getting Help */}
        <div className="legal-section">
          <h2><FaHeadset /> Still Having Issues?</h2>
          <p>
            If you've tried all troubleshooting steps above and still need help, please contact our support team.
          </p>
          <p>
            Have ready when contacting support:
          </p>
          <ul>
            <li>Detailed description of the issue</li>
            <li>Browser and version (Help → About [Browser])</li>
            <li>Operating system (Windows, Mac, Linux, iOS, Android)</li>
            <li>Screenshots of error messages</li>
            <li>Steps to reproduce the issue</li>
            <li>Your student ID (do not include password)</li>
          </ul>
          <p>
            <Link to="/contact-support" className="btn btn-primary mt-3">
              <FaEnvelope className="me-2" />
              Contact Support
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            © 2026 Campus Ballot. All rights reserved. | For additional help, email <a href="mailto:tech-support@campusballot.tech">tech-support@campusballot.tech</a>
          </p>
        </div>
      </div>
    </div>
  );
};


export default TechnicalSupport;
