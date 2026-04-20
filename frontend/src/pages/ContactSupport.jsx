import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaHeadset, FaEnvelope, FaPhone, FaClock, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import ProgressIndicator from '../components/ProgressIndicator';
import TableOfContents from '../components/TableOfContents';
import PrintButton from '../components/PrintButton';
import './LegalPages.css';

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulated submission - replace with actual API call
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        priority: 'normal'
      });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="legal-container">
      {/* Progress Indicator */}
      <ProgressIndicator pageTitle="Contact Support" />

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
              <FaHeadset />
            </div>
            <div>
              <h1>Contact & Support</h1>
              <p className="last-updated">We're here to help! Get in touch with us.</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <PrintButton pageTitle="Contact & Support" />

        {/* Table of Contents */}
        <TableOfContents pageTitle="Contact & Support" />

        {/* Support Channels */}
        <div className="legal-section">
          <h2><FaEnvelope /> Support Channels</h2>
          <Row className="g-4 mt-3">
            <Col md={6}>
              <div className="support-card">
                <div className="support-icon">
                  <FaEnvelope />
                </div>
                <h3>Email Support</h3>
                <p>
                  <strong>General Inquiries:</strong><br />
                  <a href="mailto:support@campusballot.tech">support@campusballot.tech</a>
                </p>
                <p>
                  <strong>Technical Issues:</strong><br />
                  <a href="mailto:tech-support@campusballot.tech">tech-support@campusballot.tech</a>
                </p>
                <p>
                  <strong>Security/Complaints:</strong><br />
                  <a href="mailto:legal@campusballot.tech">legal@campusballot.tech</a>
                </p>
                <p className="response-time">
                  <FaClock /> Response time: 24-48 hours
                </p>
              </div>
            </Col>

            <Col md={6}>
              <div className="support-card">
                <div className="support-icon">
                  <FaPhone />
                </div>
                <h3>Phone Support</h3>
                <p>
                  <strong>Main Line:</strong><br />
                  <a href="tel:+256 742 685 864">+256 742 685 864</a>
                </p>
                <p>
                  <strong>Hours:</strong> Monday - Friday, 8 AM - 5 PM EAT
                </p>
                <p>
                  <strong>Emergency Line:</strong><br />
                  <a href="tel:+256 742 685 864">+256 742 685 864 (24/7)</a>
                </p>
                <p className="response-time">
                  <FaClock /> Average wait time: 5-10 minutes
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Quick Contact Form */}
        <div className="legal-section">
          <h2><FaCheckCircle /> Send us a Message</h2>
          <p>
            Fill out the form below and we'll get back to you as soon as possible.
          </p>

          {submitStatus === 'success' && (
            <div className="alert alert-success" role="alert">
              <FaCheckCircle className="me-2" />
              Thank you! Your message has been sent successfully. We'll contact you soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="alert alert-danger" role="alert">
              There was an error sending your message. Please try again or email us directly.
            </div>
          )}

          <Form onSubmit={handleSubmit} className="support-form">
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@kyambogo.ac.ug"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="voting">Voting Issues</option>
                <option value="account">Account & Access</option>
                <option value="technical">Technical Problem</option>
                <option value="candidate">Candidate Application</option>
                <option value="security">Security Concern</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject *</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief subject line"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority Level *</Form.Label>
              <Form.Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low - General inquiry</option>
                <option value="normal">Normal - Standard issue</option>
                <option value="high">High - Urgent matter</option>
                <option value="critical">Critical - System down</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control
                as="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your issue in detail..."
                rows={6}
                required
              />
            </Form.Group>

            <Button type="submit" className="btn-primary-custom">
              <FaEnvelope className="me-2" />
              Send Message
            </Button>
          </Form>
        </div>

        {/* Support Information */}
        <div className="legal-section">
          <h2><FaClock /> Support Response Times</h2>
          <div className="support-info">
            <Row className="g-3">
              <Col md={6}>
                <div className="info-card">
                  <h4><FaClock /> Response Time Standards</h4>
                  <ul>
                    <li><strong>Critical Issues:</strong> 1-2 hours</li>
                    <li><strong>High Priority:</strong> 4-6 hours</li>
                    <li><strong>Normal Issues:</strong> 24 hours</li>
                    <li><strong>Low Priority:</strong> 48 hours</li>
                  </ul>
                </div>
              </Col>

              <Col md={6}>
                <div className="info-card">
                  <h4><FaCheckCircle /> Support Availability</h4>
                  <ul>
                    <li><strong>Email:</strong> 24/7 (24-48 hr response)</li>
                    <li><strong>Phone:</strong> Mon-Fri 8 AM - 5 PM EAT</li>
                    <li><strong>Emergency:</strong> 24/7 for critical issues</li>
                    <li><strong>Chat:</strong> During business hours</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="legal-section">
          <h2><FaCheckCircle /> Frequently Asked Questions</h2>
          <div className="faq-section">
            <div className="faq-item">
              <h4>How long does it take to resolve my issue?</h4>
              <p>
                Response times vary based on priority level. Most issues are resolved within 24-48 hours. Critical issues receive immediate attention.
              </p>
            </div>

            <div className="faq-item">
              <h4>Can I track the status of my support ticket?</h4>
              <p>
                After submitting a support request via email, you'll receive a ticket number. You can use this to check status on our support portal.
              </p>
            </div>

            <div className="faq-item">
              <h4>What information should I include in my support request?</h4>
              <p>
                Include: detailed description of the issue, steps to reproduce it, browser/device you're using, and any error messages you received.
              </p>
            </div>

            <div className="faq-item">
              <h4>Is there emergency support for voting issues?</h4>
              <p>
                Yes. During election periods, we have 24/7 emergency support. Call our emergency line for immediate assistance with voting problems.
              </p>
            </div>
          </div>
        </div>

        {/* Office Location */}
        <div className="legal-section">
          <h2><FaMapMarkerAlt /> Visit Us</h2>
          <div className="office-info">
            <h3>Campus Ballot Office</h3>
            <p>
              <strong>Location:</strong><br />
              Kyambogo University<br />
              Kampala, Uganda
            </p>
            <p>
              <strong>Hours:</strong><br />
              Monday - Friday: 8:00 AM - 5:00 PM<br />
              Saturday & Sunday: Closed
            </p>
            <p>
              <strong>For emergency matters during off-hours,</strong> call our emergency support line.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            © 2026 Campus Ballot. All rights reserved. | We're committed to supporting you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
