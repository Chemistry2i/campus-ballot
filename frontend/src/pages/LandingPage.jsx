import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Modal, Accordion } from "react-bootstrap";
import "./LandingPage.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import kyuLogo from "../assets/kyambogo-university-kyu-logo-png_seeklogo-550308.png";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';

const LandingPage = () => {
  useEffect(() => {
    // mark body so css can add padding for the fixed-top navbar
    document.body.classList.add('has-fixed-navbar');
    return () => {
      document.body.classList.remove('has-fixed-navbar');
    };
  }, []);

  // detect small screens so we can apply inline mobile styles immediately
  const [isMobileNav, setIsMobileNav] = useState(false);
  useEffect(() => {
    function update() {
      setIsMobileNav(window.innerWidth < 992);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Contact form handler (client-side simulation)
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    const email = fd.get('email');
    const subject = fd.get('subject');
    const message = fd.get('message');

    // In a real app we'd POST to /api/contact. For now show a success toast and reset.
    Swal.fire({
      icon: 'success',
      title: 'Message sent',
      html: `Thanks <strong>${name}</strong> — we received your message about "${subject}". We'll reply to <a href=\"mailto:${email}\">${email}</a> within 1-2 business days.`,
      timer: 4000,
      showConfirmButton: false,
    });

    e.target.reset();
  };

  // FAQ items (could be moved to CMS later)
  const faqs = [
    {
      q: 'How do I register?',
      a: 'Click Register, fill in your student details (student ID and institutional email for students) and submit. You will receive a confirmation email.'
    },
    {
      q: 'Who can run elections on this platform?',
      a: 'University administrators with the admin role can create and manage elections. Contact your university IT office to request admin access.'
    },
    {
      q: 'Is this system secure?',
      a: 'Yes — votes are encrypted and stored with auditable logs. We recommend running a pilot before production elections and enabling 2FA for admin accounts.'
    },
    {
      q: 'How do students verify their votes?',
      a: 'After voting, students receive a non-identifying receipt code they can use to verify their vote on the results page.'
    }
  ];

  // Append a few additional FAQ entries requested
  faqs.push(
    {
      q: 'Who is eligible to vote?',
      a: 'Eligibility is defined by the university. Typically all registered students with an active student account and verified institutional email are eligible during open election periods.'
    },
    {
      q: 'How long do you keep data?',
      a: 'We retain election logs and non-identifying audit trails for 2 years by default; personal data retention follows university policy and GDPR-like best practices where applicable.'
    },
    {
      q: 'What happens if there is a dispute?',
      a: 'The platform provides detailed audit logs to support investigations. Dispute resolution should follow your institution\'s election rules.'
    }
  );
  // Extra FAQ entries
  faqs.push(
    {
      q: 'Can students nominate candidates?',
      a: 'Yes — nomination flows are configurable per election. Administrators can open nomination windows and accept submissions per the university election rules.'
    },
    {
      q: 'Can alumni or external users vote?',
      a: 'Voting eligibility is determined by the election configuration. Alumni or external voters can only participate if explicitly allowed by the institution and supported in the election settings.'
    },
    {
      q: 'How do I reset my password?',
      a: 'Use the "Forgot password" link on the login page. A secure reset email will be sent to your registered institutional email address.'
    }
  );
  return (
    <div style={{ fontFamily: "'Merriweather', serif", overflowX: "hidden" }}>
      {/* ===== NAVBAR ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#003366", width: "100%", height: '72px' }}
      >
        <div className="container-fluid px-4" style={isMobileNav ? { paddingLeft: 20, paddingRight: 20 } : undefined}>
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/" style={{ fontSize: '1.05rem' }}>
            <img src={kyuLogo} alt="Kyambogo University" style={{ height: 48, marginRight: 10 }} />
            <span style={{ fontSize: '1.15rem' }}>Campus Ballot</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {/* Mobile logo header - only visible on mobile */}
            <div className="mobile-nav-logo d-lg-none">
              <img src={kyuLogo} alt="Kyambogo University" style={{ height: 40 }} />
              <span className="text-white fw-bold" style={{ fontSize: '1.1rem' }}>Campus Ballot</span>
              <button 
                className="btn-close btn-close-white ms-auto" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarSupportedContent" 
                aria-label="Close menu"
              ></button>
            </div>

            {/* Nav content */}
            <div className="mobile-nav-content">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    href="#about" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                      if (window.innerWidth < 992) {
                        document.querySelector('[data-bs-target="#navbarSupportedContent"]')?.click();
                      }
                    }}
                  >
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    href="#features" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                      if (window.innerWidth < 992) {
                        document.querySelector('[data-bs-target="#navbarSupportedContent"]')?.click();
                      }
                    }}
                  >
                    Features
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    href="#developers" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('developers')?.scrollIntoView({ behavior: 'smooth' });
                      if (window.innerWidth < 992) {
                        document.querySelector('[data-bs-target="#navbarSupportedContent"]')?.click();
                      }
                    }}
                  >
                    Developers
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    href="#faqs" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
                      if (window.innerWidth < 992) {
                        document.querySelector('[data-bs-target="#navbarSupportedContent"]')?.click();
                      }
                    }}
                  >
                    FAQs
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    href="#contact" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      if (window.innerWidth < 992) {
                        document.querySelector('[data-bs-target="#navbarSupportedContent"]')?.click();
                      }
                    }}
                  >
                    Contact
                  </a>
                </li>
              </ul>

              {/* Separator */}
              <hr className="d-lg-none" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '1rem 0' }} />

              <div className="d-grid gap-2 d-sm-flex align-items-center">
                <Link to="/register" className="btn btn-primary d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }} aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6" />
                    <path d="M23 11h-6" />
                  </svg>
                  <span>Register</span>
                </Link>

                <Link to="/login" className="btn btn-light d-flex align-items-center" aria-label="Login" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }} aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Login</span>
                </Link>
              </div>

              {/* Footer text - only visible on mobile */}
              <div className="d-lg-none pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '1rem' }}>
                <p className="text-white-50 small mb-0 text-center">© 2025 Campus Ballot</p>
                <p className="text-white-50 small mb-0 text-center">Kyambogo University</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section
        className="d-flex align-items-center text-white"
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundImage: "url('/images/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#004080",
          position: "relative",
        }}
      >
        <div
          className="overlay position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        ></div>
        <div className="container-fluid px-5 position-relative">
          <Row className="align-items-center">
            <Col lg={7}>
              <h1 className="display-4 fw-bold">
                Transparent, Secure, and Easy Campus Elections
              </h1>
              <p className="lead mt-3">
                Empowering universities with digital voting solutions that
                ensure fairness, integrity, and accessibility.
              </p>

              {/* small stats / trust badges */}
              <div className="d-flex flex-wrap gap-3 mt-3">
                <div className="badge bg-light text-dark py-2 px-3 shadow-sm">
                  <strong>100+</strong> Universities
                </div>
                <div className="badge bg-light text-dark py-2 px-3 shadow-sm">
                  <strong>99.9%</strong> Uptime
                </div>
                <div className="badge bg-light text-dark py-2 px-3 shadow-sm">
                  <strong>Encrypted</strong> Votes
                </div>
              </div>

              {/* unofficial system warning tagline */}
              <div className="mt-3">
                <div
                  role="note"
                  aria-live="polite"
                  className="px-3 py-2 rounded"
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(255,193,7,0.12)',
                    color: '#ffd966',
                    border: '1px solid rgba(255,193,7,0.25)'
                  }}
                >
                  <strong>Notice:</strong> This is not the official voting system for Kyambogo University. For official elections use the university's authorized channels.
                </div>
              </div>

              <div className="mt-4 d-flex align-items-center">
                <Link
                  to="/register"
                  className="btn btn-primary btn-md d-flex align-items-center justify-content-center me-3"
                  style={{ minWidth: 170, padding: '0.6rem 1rem' }}
                  aria-label="Register"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: 8 }}
                    aria-hidden="true"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6" />
                    <path d="M23 11h-6" />
                  </svg>
                  <span>Register Now</span>
                </Link>

                <Link
                  to="/login"
                  className="btn btn-outline-light btn-md d-flex align-items-center justify-content-center"
                  style={{ minWidth: 150, padding: '0.6rem 1rem' }}
                  aria-label="Login"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: 8 }}
                    aria-hidden="true"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Login</span>
                </Link>
              </div>
            </Col>

            {/* Right column: mock ballot card to show product */}
            <Col lg={5} className="d-none d-lg-block">
              <Card className="shadow-lg" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Card.Body>
                  <h5 className="text-white fw-bold">Sample Ballot</h5>
                  <p className="text-white-50 small">Preview how voting looks for students</p>
                  <div className="mt-3">
                    <div className="mb-2 text-white">
                      <strong>President</strong>
                      <div className="d-flex justify-content-between align-items-center bg-white bg-opacity-10 p-2 rounded mt-1">
                        <div>
                          <div className="fw-bold">Alice N.</div>
                          <div className="small text-white-50">Manifesto highlight...</div>
                        </div>
                        <button className="btn btn-sm btn-outline-light">Select</button>
                      </div>
                    </div>

                    <div className="mb-2 text-white">
                      <strong>Vice President</strong>
                      <div className="d-flex justify-content-between align-items-center bg-white bg-opacity-10 p-2 rounded mt-1">
                        <div>
                          <div className="fw-bold">Brian K.</div>
                          <div className="small text-white-50">Focus on student services</div>
                        </div>
                        <button className="btn btn-sm btn-outline-light">Select</button>
                      </div>
                    </div>

                    <div className="mt-4 d-flex justify-content-between align-items-center">
                      <small className="text-white-50">Preview only — actual voting is secure & verified</small>
                      <button className="btn btn-success btn-sm">Vote</button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Feature details modal */}
          <FeatureModal />
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section id="about" className="py-5 bg-light" style={{ width: "100%" }}>
        <div className="container-fluid px-5">
          <h2 className="text-center fw-bold mb-5" style={{ color: "#003366" }}>
            Why Choose Our System
          </h2>
          <Row className="justify-content-center g-4">
            {(
              [
                {
                  key: 'security',
                  title: "High Security",
                  desc: "Every vote is encrypted and tamper-proof, ensuring full integrity.",
                  bg: '#e8f4ff',
                  fg: '#08306b',
                  icon: (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V7l-8-4-8 4v5c0 6 8 10 8 10z"/></svg>
                  ),
                  details: 'Uses modern encryption and auditable logs to protect votes.'
                },
                {
                  key: 'automation',
                  title: "Automation",
                  desc: "Instant result tallying with minimal administrative overhead.",
                  bg: '#f0fff4',
                  fg: '#0b5132',
                  icon: (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 13.3A8 8 0 1 0 12 20v-2a6 6 0 1 1 6-6h2.8z"/></svg>
                  ),
                  details: 'Automated tallies, scheduling and role-based workflows reduce manual effort.'
                },
                {
                  key: 'performance',
                  title: "Fast & Reliable",
                  desc: "Optimized for performance and uptime during peak election hours.",
                  bg: '#fff7e6',
                  fg: '#7a4300',
                  icon: (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9-4-18-3 9H2"/></svg>
                  ),
                  details: 'Built to scale with caching and resilient connections to ensure availability.'
                },
                {
                  key: 'user',
                  title: "User-Centered",
                  desc: "Simple, accessible interface for all students and admins.",
                  bg: '#f6eefc',
                  fg: '#3f0f66',
                  icon: (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  ),
                  details: 'Designed with accessibility and simplicity in mind for fast onboarding.'
                }
              ]
            ).map((item) => (
              <Col lg={3} md={6} key={item.key}>
                <a className="lp-feature-link" onClick={() => window.dispatchEvent(new CustomEvent('openFeatureModal', {detail: item}))}>
                  <Card className="h-100 text-center shadow-sm border-0 p-3 lp-feature-card">
                    <Card.Body>
                      <div
                        className="mb-3 lp-feature-icon"
                        style={{ background: item.bg, color: item.fg }}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </div>
                      <h5 className="fw-bold mt-2">{item.title}</h5>
                      <p className="text-muted">{item.desc}</p>
                    </Card.Body>
                  </Card>
                </a>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-5" style={{ width: "100%" }}>
        <div className="container-fluid px-5">
          <h2 className="text-center fw-bold mb-5" style={{ color: "#003366" }}>
            Core Features
          </h2>
          <Row className="g-4 contact-columns">
            {[
              {
                icon: '🛡️',
                title: 'Role-Based Dashboards',
                text: 'Separate interfaces for students and admins to enhance workflow and control.',
              },
              {
                icon: '📊',
                title: 'Real-Time Results',
                text: 'Get live vote counts and results updates powered by WebSocket communication.',
              },
              {
                icon: '📝',
                title: 'Audit Logs',
                text: 'Every action recorded for transparency and accountability.',
              },
            ].map((f, i) => (
              <Col lg={4} md={6} key={i}>
                <Card className="p-3 shadow-sm border-0 text-center h-100">
                  <div className="card-icon mb-3">{f.icon}</div>
                  <h5 className="fw-bold">{f.title}</h5>
                  <p>{f.text}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section
        id="testimonials"
        className="py-5 bg-light"
        style={{ width: "100%" }}
      >
        <div className="container-fluid px-5 text-center">
          <h2 className="fw-bold mb-5" style={{ color: "#003366" }}>
            What Students Say
          </h2>
          <Row className="justify-content-center g-4">
            {[
              {
                img: 'https://via.placeholder.com/100?text=Omolo ',
                name: 'Sarah',
                text: 'Voting has never been this easy. The interface is clean and quick!',
                faculty: 'Faculty of Science',
                course: 'Information Technology'
              },
              {
                img: 'https://via.placeholder.com/100?text=David',
                name: 'David',
                text: 'I love the transparency and the instant results. Great system!',
                faculty: 'Faculty of Engineering',
                course: 'Computer Engineering'
              },
              {
                img: 'https://via.placeholder.com/100?text=Emily',
                name: 'Emily',
                text: 'As an admin, managing elections is now stress-free and automated.',
                faculty: 'Faculty of Business',
                course: 'Marketing'
              },
            ].map((item, index) => (
              <Col lg={3} md={4} key={index}>
                    <Card className="p-3 shadow-sm border-0 h-100 text-center">
                      <img src={item.img} alt={item.name} className="testimonial-img mb-3" />
                      <Card.Body className="testimonial-italic" style={{fontStyle:'italic'}}>
                        <p style={{fontStyle:'italic'}} className="text-muted">"{item.text}"</p>
                        <h6 style={{fontStyle:'italic'}} className="fw-bold mt-3">{item.name}</h6>
                        <div style={{fontStyle:'italic'}} className="small text-secondary mt-1">{item.faculty}<br />{item.course}</div>
                      </Card.Body>
                    </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ===== DEVELOPERS ===== */}
      <section id="developers" className="py-5" style={{ width: "100%" }}>
        <div className="container-fluid px-5 text-center">
          <h2 className="fw-bold mb-5" style={{ color: "#003366" }}>
            Meet the Developers
          </h2>
          <Row className="justify-content-center g-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Col lg={2} md={3} sm={4} xs={6} key={i}>
                <Card className="shadow-sm border-0 p-2 h-100">
                  <Card.Img
                    variant="top"
                    src={`https://via.placeholder.com/150?text=Dev+${i + 1}`}
                    className="rounded-circle mx-auto mt-3"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <h6 className="fw-bold">Developer {i + 1}</h6>
                    <p className="text-muted mb-0">Full Stack Engineer</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section
        id="cta"
        className="text-center text-white d-flex align-items-center justify-content-center flex-column"
        style={{
          backgroundColor: "#004080",
          minHeight: "50vh",
          width: "100%",
        }}
      >
        <h2 className="fw-bold mb-4">
          Be Part of the Future of Campus Elections
        </h2>
        <p className="mb-4">
          Register today and make your voice count in every election.
        </p>
        <Link to="/register" className="btn btn-light btn-lg">
          Get Started
        </Link>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-5 bg-light">
        <div className="container-fluid px-5">
          <h2 className="fw-bold mb-4 text-center" style={{ color: "#003366" }}>
            Contact Us
          </h2>
          <Row className="g-4">
            <Col md={6}>
              <Card className="p-3 h-100">
                <h5 className="fw-bold">Contact Information</h5>
                <div className="contact-info-list mt-3">
                  <div className="contact-line d-flex align-items-start gap-3 py-3" style={{ borderBottom: '1px solid rgba(3,51,102,0.06)' }}>
                      <i className="fa-solid fa-envelope contact-icon" aria-hidden="true" style={{ width: 52, height: 52, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,99,181,0.12)', borderRadius: 10, color: '#0b63b5', fontSize: 20, flex: '0 0 52px' }}></i>
                      <div className="contact-text" style={{ lineHeight: 1.15 }}>
                        <div className="small text-muted" style={{ marginBottom: 4 }}>Email</div>
                        <a href="mailto:info@campusballot.com" className="fw-semibold contact-value" style={{ fontWeight: 600, color: '#0b63b5', textDecoration: 'underline' }}>info@campusballot.com</a>
                      </div>
                    </div>

                  <div className="contact-line d-flex align-items-start gap-3 py-3" style={{ borderBottom: '1px solid rgba(3,51,102,0.06)' }}>
                    <i className="fa-solid fa-phone contact-icon" aria-hidden="true" style={{ width: 52, height: 52, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,99,181,0.12)', borderRadius: 10, color: '#0b63b5', fontSize: 20, flex: '0 0 52px' }}></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div className="small text-muted" style={{ marginBottom: 4 }}>Phone</div>
                      <a href="tel:+256700000000" className="fw-semibold contact-value" style={{ fontWeight: 600, color: '#0b63b5', textDecoration: 'underline' }}>+256 700 000 000</a>
                    </div>
                  </div>

                  <div className="contact-line d-flex align-items-start gap-3 py-3" style={{ borderBottom: '1px solid rgba(3,51,102,0.06)' }}>
                    <i className="fa-solid fa-location-dot contact-icon" aria-hidden="true" style={{ width: 52, height: 52, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,99,181,0.12)', borderRadius: 10, color: '#0b63b5', fontSize: 20, flex: '0 0 52px' }}></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div className="small text-muted" style={{ marginBottom: 4 }}>Office</div>
                      <div className="fw-semibold" style={{ fontWeight: 600, color: '#111' }}>School of Computing and Information Science, Kyambogo University</div>
                    </div>
                  </div>

                  <div className="contact-line d-flex align-items-start gap-3 py-3" style={{ borderBottom: '1px solid rgba(3,51,102,0.06)' }}>
                    <i className="fa-solid fa-clock contact-icon" aria-hidden="true" style={{ width: 52, height: 52, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,99,181,0.12)', borderRadius: 10, color: '#0b63b5', fontSize: 20, flex: '0 0 52px' }}></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div className="small text-muted" style={{ marginBottom: 4 }}>Office Hours</div>
                      <div className="fw-semibold" style={{ fontWeight: 600 }}>Mon - Fri, 09:00 - 17:00</div>
                    </div>
                  </div>

                  <div className="contact-line d-flex align-items-start gap-3 py-3" style={{ borderBottom: 'none' }}>
                    <i className="fa-solid fa-life-ring contact-icon" aria-hidden="true" style={{ width: 52, height: 52, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,99,181,0.12)', borderRadius: 10, color: '#0b63b5', fontSize: 20, flex: '0 0 52px' }}></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div className="small text-muted" style={{ marginBottom: 4 }}>Support</div>
                      <a href="mailto:support@campusballot.com" className="fw-semibold contact-value" style={{ fontWeight: 600, color: '#0b63b5', textDecoration: 'underline' }}>support@campusballot.com</a>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="p-3 h-100">
                <h5 className="fw-bold">Send us a message</h5>
                <form onSubmit={handleContactSubmit}>
                  <div className="mb-2">
                    <input style={{height:50}} className="form-control" id="inputs" name="name" placeholder="Your name" required />
                  </div>
                  <div className="mb-2">
                    <input style={{height:50}} className="form-control" id="inputs" type="email" name="email" placeholder="Your email" required />
                  </div>
                  <div className="mb-2">
                    <input style={{height:50}}  className="form-control" id="inputs" name="subject" placeholder="Subject" required />
                  </div>
                  <div className="mb-2">
                    <textarea className="form-control" name="message" id="inputs" rows={10} placeholder="Message" required></textarea>
                  </div>
                  <div className="d-grid">
                    <button className="btn btn-primary btn-md" type="submit">Send Message</button>
                  </div>
                </form>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* ===== FAQS ===== */}
      <section id="faqs" className="py-5" style={{ width: '100%' }}>
        <div className="container-fluid px-5">
          <h2 className="fw-bold mb-4 text-center" style={{ color: '#003366' }}>Frequently Asked Questions</h2>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Accordion defaultActiveKey="0">
                {faqs.map((f, i) => (
                  <Accordion.Item eventKey={String(i)} key={i}>
                    <Accordion.Header>{f.q}</Accordion.Header>
                    <Accordion.Body>{f.a}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="text-center text-white py-3"
        style={{ backgroundColor: "#003366", width: "100%" }}
      >
        <p className="mb-0">
          © {new Date().getFullYear()} Campus Ballot | Developed by Concept
          Crashers
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

function FeatureModal() {
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null);

  useEffect(() => {
    function handler(e) {
      setItem(e.detail || null);
      setShow(true);
    }
    window.addEventListener('openFeatureModal', handler);
    return () => window.removeEventListener('openFeatureModal', handler);
  }, []);

  // return (
  //   <Modal show={show} onHide={() => setShow(false)} centered>
  //     <Modal.Header closeButton>
  //       <Modal.Title>{item?.title}</Modal.Title>
  //     </Modal.Header>
  //     <Modal.Body className="lp-modal-body">
  //       <p className="text-muted">{item?.details}</p>
  //       <hr />
  //       <p>{item?.desc}</p>
  //     </Modal.Body>
  //     <Modal.Footer>
  //       <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
  //       <Button variant="primary" onClick={() => { setShow(false); window.location.href = '/register'; }}>Get Started</Button>
  //     </Modal.Footer>
  //   </Modal>
  // );
}
