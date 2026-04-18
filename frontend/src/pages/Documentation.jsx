import { Container, Accordion, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaUserPlus, FaSignInAlt, FaCheckCircle, FaCalendarAlt, FaFileAlt, FaCog, FaHeadset, FaEnvelope } from 'react-icons/fa';
import ProgressIndicator from '../components/ProgressIndicator';
import TableOfContents from '../components/TableOfContents';
import PrintButton from '../components/PrintButton';
import './LegalPages.css';

const Documentation = () => {
  return (
    <div className="legal-container">
      {/* Progress Indicator */}
      <ProgressIndicator pageTitle="Documentation" />

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
              <FaBook />
            </div>
            <div>
              <h1>Documentation & Help Center</h1>
              <p className="last-updated">Last Updated: January 29, 2026</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <PrintButton pageTitle="Documentation" />

        {/* Table of Contents */}
        <TableOfContents pageTitle="Documentation" />

        {/* Introduction */}
        <div className="legal-section">
          <h2><FaBook /> Welcome to Campus Ballot Documentation</h2>
          <p>
            This comprehensive guide covers all aspects of using Campus Ballot. Whether you're a first-time voter, candidate, or administrator, you'll find detailed instructions and answers to common questions here.
          </p>
          <p>
            Choose a topic below to get started, or use the search function to find specific information.
          </p>
        </div>

        {/* Accordion Documentation */}
        <div className="legal-section">
          <h2><FaCheckCircle /> Quick Start Guides</h2>
          
          <Accordion defaultActiveKey="0" className="legal-accordion">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <FaUserPlus className="me-2" /> Getting Started: Voter Registration
              </Accordion.Header>
              <Accordion.Body>
                <h4>Step-by-Step Registration Guide</h4>
                <ol>
                  <li><strong>Create Account:</strong> Visit the Campus Ballot homepage and click "Sign Up"</li>
                  <li><strong>Enter Email:</strong> Provide your institutional email address</li>
                  <li><strong>Verify Email:</strong> Click the verification link sent to your email</li>
                  <li><strong>Create Password:</strong> Set a strong password (min 8 characters, mixed case, numbers)</li>
                  <li><strong>Complete Profile:</strong> Add your name and student/staff ID</li>
                  <li><strong>Accept Terms:</strong> Review and accept the Terms of Service and Privacy Policy</li>
                  <li><strong>Confirm Registration:</strong> Your account is now active and ready to use</li>
                </ol>
                <h4>Troubleshooting Registration</h4>
                <ul>
                  <li><strong>Verification Email Not Received:</strong> Check spam folder or request new link</li>
                  <li><strong>Email Already Registered:</strong> Use "Forgot Password" or contact support</li>
                  <li><strong>Password Rejected:</strong> Ensure it meets all complexity requirements</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <FaSignInAlt className="me-2" /> Logging In & Account Access
              </Accordion.Header>
              <Accordion.Body>
                <h4>Login Instructions</h4>
                <ol>
                  <li>Go to Campus Ballot login page</li>
                  <li>Enter your registered email address</li>
                  <li>Enter your password</li>
                  <li>Complete multi-factor authentication if prompted</li>
                  <li>Click "Login" to access your dashboard</li>
                </ol>
                <h4>Forgot Your Password?</h4>
                <ul>
                  <li>Click "Forgot Password" on the login page</li>
                  <li>Enter your registered email</li>
                  <li>Click the reset link in your email</li>
                  <li>Create a new password</li>
                  <li>Login with your new password</li>
                </ul>
                <h4>Account Security</h4>
                <ul>
                  <li>Never share your password with others</li>
                  <li>Log out when finished, especially on shared devices</li>
                  <li>Update your password periodically</li>
                  <li>Report suspicious activity immediately</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <FaCalendarAlt className="me-2" /> How to Vote
              </Accordion.Header>
              <Accordion.Body>
                <h4>Voting Instructions</h4>
                <ol>
                  <li><strong>Check Eligibility:</strong> Ensure you meet all eligibility requirements for the election</li>
                  <li><strong>Access Election:</strong> Navigate to "Active Elections" on your dashboard</li>
                  <li><strong>Review Candidates:</strong> Read candidate information and platforms</li>
                  <li><strong>Make Your Selection:</strong> Click on candidates you wish to vote for</li>
                  <li><strong>Review Ballot:</strong> Verify your selections are correct</li>
                  <li><strong>Confirm Vote:</strong> Click "Submit Vote" to finalize</li>
                  <li><strong>Receive Confirmation:</strong> You'll get a confirmation number</li>
                </ol>
                <h4>Important Voting Rules</h4>
                <ul>
                  <li>You can only vote once per election</li>
                  <li>Votes cannot be changed after submission</li>
                  <li>Voting window has specific open/close times</li>
                  <li>Your vote is completely private and anonymous</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>
                <FaCheckCircle className="me-2" /> Vote Verification & Results
              </Accordion.Header>
              <Accordion.Body>
                <h4>Verifying Your Vote</h4>
                <ul>
                  <li>A confirmation number is provided after voting</li>
                  <li>Save your confirmation number for your records</li>
                  <li>You can verify your vote was recorded in "My Votes" section</li>
                  <li>Contact support if you have concerns about your vote</li>
                </ul>
                <h4>Viewing Election Results</h4>
                <ul>
                  <li>Results are available after voting closes</li>
                  <li>Real-time result updates may be provided</li>
                  <li>Results include candidate names and vote counts</li>
                  <li>Detailed analytics available for administrators</li>
                </ul>
                <h4>Understanding Results</h4>
                <ul>
                  <li>Vote counts are aggregated and verified</li>
                  <li>Individual votes remain completely anonymous</li>
                  <li>Results cannot identify how any specific person voted</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="4">
              <Accordion.Header>
                <FaFileAlt className="me-2" /> Candidate Application Process
              </Accordion.Header>
              <Accordion.Body>
                <h4>How to Apply as a Candidate</h4>
                <ol>
                  <li><strong>Check Eligibility:</strong> Review candidate eligibility requirements</li>
                  <li><strong>Complete Application:</strong> Fill out the candidate application form</li>
                  <li><strong>Submit Documents:</strong> Upload required supporting documents</li>
                  <li><strong>Add Platform:</strong> Write your candidate platform/manifesto</li>
                  <li><strong>Review Application:</strong> Verify all information is correct</li>
                  <li><strong>Submit:</strong> Submit your application</li>
                  <li><strong>Approval:</strong> Await administrative verification (2-5 business days)</li>
                </ol>
                <h4>Application Requirements</h4>
                <ul>
                  <li>Valid student/staff ID</li>
                  <li>Proof of eligibility</li>
                  <li>Candidate profile photo</li>
                  <li>Campaign platform statement (500 words max)</li>
                  <li>Contact information</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="5">
              <Accordion.Header>
                <FaCog className="me-2" /> Administrator Features
              </Accordion.Header>
              <Accordion.Body>
                <h4>Administrator Dashboard</h4>
                <p>Administrators have access to comprehensive election management tools:</p>
                <ul>
                  <li><strong>Create Elections:</strong> Set up new elections with custom questions</li>
                  <li><strong>Manage Candidates:</strong> Review and approve candidate applications</li>
                  <li><strong>Monitor Voting:</strong> Track real-time voting statistics</li>
                  <li><strong>Manage Users:</strong> Add, edit, or deactivate user accounts</li>
                  <li><strong>Generate Reports:</strong> Export election data and analytics</li>
                  <li><strong>Security Settings:</strong> Configure system security parameters</li>
                </ul>
                <h4>Creating an Election</h4>
                <ol>
                  <li>Navigate to "Elections" {`>`} "Create New"</li>
                  <li>Enter election title and description</li>
                  <li>Set voting open and close dates/times</li>
                  <li>Add candidates or enable applications</li>
                  <li>Configure voting rules and options</li>
                  <li>Review and publish election</li>
                </ol>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="6">
              <Accordion.Header>
                <FaHeadset className="me-2" /> Troubleshooting Common Issues
              </Accordion.Header>
              <Accordion.Body>
                <h4>Can't Log In</h4>
                <ul>
                  <li>Verify email address is correct</li>
                  <li>Check Caps Lock is off</li>
                  <li>Try "Forgot Password" to reset</li>
                  <li>Clear browser cookies and cache</li>
                  <li>Contact support if issue persists</li>
                </ul>
                <h4>Can't See Elections</h4>
                <ul>
                  <li>Verify you're logged in</li>
                  <li>Check if you meet eligibility requirements</li>
                  <li>Refresh the page or clear cache</li>
                  <li>Try a different browser</li>
                </ul>
                <h4>Voting Issues</h4>
                <ul>
                  <li>Ensure stable internet connection</li>
                  <li>Don't refresh page while voting</li>
                  <li>Use supported browsers (Chrome, Firefox, Safari, Edge)</li>
                  <li>Disable browser extensions that might interfere</li>
                </ul>
                <h4>Technical Problems</h4>
                <ul>
                  <li>Check system status page for known issues</li>
                  <li>Try a different device or browser</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Contact technical support with error details</li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        {/* Additional Resources */}
        <div className="legal-section">
          <h2><FaBook /> Additional Resources</h2>
          <p>
            For more information about specific topics, visit:
          </p>
          <ul>
            <li><strong>Privacy & Security:</strong> See our <Link to="/privacy-policy">Privacy Policy</Link> and <Link to="/security-policy">Security Policy</Link></li>
            <li><strong>Terms of Use:</strong> Review our <Link to="/terms-of-service">Terms of Service</Link></li>
            <li><strong>Technical Requirements:</strong> Check <Link to="/technical-support">Technical Support</Link> for system requirements</li>
            <li><strong>Contact Support:</strong> Reach out via <Link to="/contact-support">Contact Support</Link></li>
          </ul>
        </div>

        {/* Support Section */}
        <div className="legal-section">
          <h2><FaEnvelope /> Still Need Help?</h2>
          <div className="contact-info">
            <h3><FaHeadset /> Contact Our Support Team</h3>
            <p>
              <strong>Email:</strong> <a href="mailto:support@campusballot.tech">support@campusballot.tech</a>
            </p>
            <p>
              <strong>Phone:</strong> <a href="tel:+256 742 685 864">+256 742 685 864</a>
            </p>
            <p>
              <strong>Response Time:</strong> Within 24 hours during business days
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            © 2026 Campus Ballot. All rights reserved. | Documentation last updated January 29, 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
