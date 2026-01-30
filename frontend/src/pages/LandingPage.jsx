import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  Accordion,
} from "react-bootstrap";
import "./LandingPage.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import kyuLogo from "../assets/kyambogo-university-kyu-logo-png_seeklogo-550308.png";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

// At the top of your AdminDashboard.jsx file
import BalibasekaImage from "../devTeam/Balibaseka_Deo.jpeg";
import GittaImage from "../devTeam/Gitta_Ibrahim.jpeg";
import KijjambuImage from "../devTeam/Kijjambu_Joseph.jpeg";
import MugerwaImage from "../devTeam/Mugerwa_Dickson.jpeg";
import MulwanyiImage from "../devTeam/Mulwanyi_Akram.jpeg";
import OmoloImage from "../devTeam/Omolo_Pasikali.jpeg";
import WambogoImage from "../devTeam/Wambogo_Hassan_Sadat.jpg";
import NsubugaImage from "../devTeam/Nsubuga_Ediger.jpeg";
import SsentongoImage from "../devTeam/Ssentongo_Edrine.jpeg";
import MuchweziImage from "../devTeam/Muchwezi_Onesmus.jpeg";

const LandingPage = () => {
  useEffect(() => {
    // mark body so css can add padding for the fixed-top navbar
    document.body.classList.add("has-fixed-navbar");
    return () => {
      document.body.classList.remove("has-fixed-navbar");
    };
  }, []);

  // detect small screens so we can apply inline mobile styles immediately
  const [isMobileNav, setIsMobileNav] = useState(false);
  useEffect(() => {
    function update() {
      setIsMobileNav(window.innerWidth < 992);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Contact form handler (client-side simulation)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name");
    const email = fd.get("email");
    const subject = fd.get("subject");
    const message = fd.get("message");

    try {
      // Show loading state
      Swal.fire({
        title: "Sending...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Send to backend API
      const response = await fetch(
        "https://api.campusballot.tech/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Show simple success message
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Thank you for contacting us. We'll get back to you soon.",
        timer: 3000,
        showConfirmButton: true,
        confirmButtonText: "OK",
      });

      // Reset form
      e.target.reset();
    } catch (error) {
      console.error("Contact form error:", error);

      // Show error message
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to send message. Please try again.",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
    }
  };

  // FAQ items (could be moved to CMS later)
  const faqs = [
    {
      q: "How do I register to vote?",
      a: "Click the Register button, fill in your student details including your student ID and institutional email address. You'll receive a confirmation email to verify your account. Once verified, you can participate in all active elections.",
    },
    {
      q: "Is my vote really anonymous?",
      a: "Yes, absolutely. Your vote is encrypted and separated from your identity immediately after casting. The system uses advanced cryptographic techniques to ensure complete anonymity while maintaining vote integrity and preventing duplicate voting.",
    },
    {
      q: "Can I change my vote after submitting?",
      a: "No, once a vote is submitted it cannot be changed. This ensures the integrity of the election process. Please review your selections carefully before clicking the final submit button.",
    },
    {
      q: "How do I know my vote was counted?",
      a: "After voting, you'll receive a unique receipt code (non-identifying). You can use this code to verify your vote was recorded in the final tally on the results page, without revealing how you voted.",
    },
    {
      q: "Who can create and manage elections?",
      a: "Only university administrators with the admin role can create and manage elections. This includes setting up candidates, defining positions, configuring voting periods, and managing election settings. Contact your university IT office to request admin access.",
    },
    {
      q: "What happens if I forget my password?",
      a: 'Use the "Forgot password" link on the login page. Enter your registered email address and you\'ll receive a secure password reset link. The link expires after 1 hour for security reasons.',
    },
    {
      q: "Who is eligible to vote?",
      a: "Eligibility is defined by your university and the specific election. Typically, all registered students with an active student account and verified institutional email are eligible during open election periods. Check each election's requirements for details.",
    },
    {
      q: "Can I vote from my mobile phone?",
      a: "Yes! Campus Ballot is fully responsive and optimized for mobile devices. You can vote securely from your smartphone, tablet, laptop, or desktop computer with any modern web browser.",
    },
    {
      q: "How secure is this voting system?",
      a: "Very secure. We use industry-standard encryption (SSL/TLS), secure authentication, encrypted vote storage, audit logs for all actions, and regular security updates. We recommend administrators enable two-factor authentication (2FA) for additional protection.",
    },
    {
      q: "What if there's a technical issue during voting?",
      a: "Contact support immediately at support@campusballot.tech or use the Contact form. Our technical team monitors elections in real-time and can assist with any issues. All system activities are logged for troubleshooting.",
    },
    {
      q: "Can alumni or external users participate?",
      a: "Only if explicitly allowed by the institution for specific elections. Voting eligibility is configurable per election. External participants would need special access credentials provided by the university administration.",
    },
    {
      q: "How long is my data stored?",
      a: "We retain election logs and audit trails for 2 years by default for accountability purposes. Personal identification data retention follows your university's policy and GDPR-compliant best practices. Votes are stored indefinitely but remain anonymous.",
    },
    {
      q: "What happens if there's a dispute or complaint?",
      a: "The platform provides comprehensive audit logs including timestamps, IP addresses, and action details to support investigations. All dispute resolution follows your institution's established election rules and procedures.",
    },
    {
      q: "Can candidates nominate themselves?",
      a: "Yes, if enabled by the election administrator. The nomination process is fully configurable per election. Administrators can set nomination windows, require endorsements, and define eligibility criteria for each position.",
    },
    {
      q: "Are results available in real-time?",
      a: "Results can be viewed in real-time if enabled by the administrator, or they can be hidden until the election officially closes. Live results use WebSocket technology for instant updates without page refresh.",
    },
    {
      q: "Is this the official voting system for Kyambogo University?",
      a: "No, this is a demonstration platform for educational purposes. For official university elections, please use the authorized channels provided by Kyambogo University administration.",
    },
  ];
  return (
    <div style={{ fontFamily: "'Merriweather', serif", overflowX: "hidden" }}>
      {/* ===== NAVBAR ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#003366", width: "100%", height: "72px" }}
      >
        <div
          className="container-fluid px-4"
          style={
            isMobileNav ? { paddingLeft: 20, paddingRight: 20 } : undefined
          }
        >
          <Link
            className="navbar-brand fw-bold d-flex align-items-center"
            to="/"
            style={{ fontSize: "1.05rem" }}
          >
            <img
              src={kyuLogo}
              alt="Kyambogo University"
              style={{ height: 48, marginRight: 10 }}
            />
            <span style={{ fontSize: "1.15rem" }}>Campus Ballot</span>
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
              <img
                src={kyuLogo}
                alt="Kyambogo University"
                style={{ height: 40 }}
              />
              <span
                className="text-white fw-bold"
                style={{ fontSize: "1.1rem" }}
              >
                Campus Ballot
              </span>
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
                      document
                        .getElementById("about")
                        ?.scrollIntoView({ behavior: "smooth" });
                      if (window.innerWidth < 992) {
                        document
                          .querySelector(
                            '[data-bs-target="#navbarSupportedContent"]'
                          )
                          ?.click();
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
                      document
                        .getElementById("features")
                        ?.scrollIntoView({ behavior: "smooth" });
                      if (window.innerWidth < 992) {
                        document
                          .querySelector(
                            '[data-bs-target="#navbarSupportedContent"]'
                          )
                          ?.click();
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
                      document
                        .getElementById("developers")
                        ?.scrollIntoView({ behavior: "smooth" });
                      if (window.innerWidth < 992) {
                        document
                          .querySelector(
                            '[data-bs-target="#navbarSupportedContent"]'
                          )
                          ?.click();
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
                      document
                        .getElementById("faqs")
                        ?.scrollIntoView({ behavior: "smooth" });
                      if (window.innerWidth < 992) {
                        document
                          .querySelector(
                            '[data-bs-target="#navbarSupportedContent"]'
                          )
                          ?.click();
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
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                      if (window.innerWidth < 992) {
                        document
                          .querySelector(
                            '[data-bs-target="#navbarSupportedContent"]'
                          )
                          ?.click();
                      }
                    }}
                  >
                    Contact
                  </a>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/candidates"
                    onClick={() => {
                      if (window.innerWidth < 992) {
                        document
                          .querySelector(
                            '[data-bs-target="#navbarSupportedContent"]'
                          )
                          ?.click();
                      }
                    }}
                  >
                    Candidates
                  </Link>
                </li>
              </ul>

              {/* Separator */}
              <hr
                className="d-lg-none"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  margin: "1rem 0",
                }}
              />

              <div className="d-grid gap-2 d-sm-flex align-items-center">
                <Link
                  to="/register"
                  className="btn btn-primary d-flex align-items-center"
                  onClick={() => {
                    if (window.innerWidth < 992) {
                      const navCollapse = document.getElementById(
                        "navbarSupportedContent"
                      );
                      const bsCollapse =
                        window.bootstrap?.Collapse?.getInstance(navCollapse);
                      if (bsCollapse) bsCollapse.hide();
                    }
                  }}
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
                  <span>Register</span>
                </Link>

                <Link
                  to="/login"
                  className="btn btn-light d-flex align-items-center"
                  aria-label="Login"
                  onClick={() => {
                    if (window.innerWidth < 992) {
                      const navCollapse = document.getElementById(
                        "navbarSupportedContent"
                      );
                      const bsCollapse =
                        window.bootstrap?.Collapse?.getInstance(navCollapse);
                      if (bsCollapse) bsCollapse.hide();
                    }
                  }}
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

              {/* Footer text - only visible on mobile */}
              <div
                className="d-lg-none pt-3"
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  marginTop: "1rem",
                }}
              >
                <p className="text-white-50 small mb-0 text-center">
                  © 2025 Campus Ballot
                </p>
                <p className="text-white-50 small mb-0 text-center">
                  Kyambogo University
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section
        className="hero-section d-flex align-items-center text-white"
        style={{
          width: "100%",
          minHeight: "calc(100vh - 72px)", // account for fixed navbar
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
                    display: "inline-block",
                    backgroundColor: "rgba(255,193,7,0.12)",
                    color: "#ffd966",
                    border: "1px solid rgba(255,193,7,0.25)",
                  }}
                >
                  <strong>Notice:</strong> This is not the official voting
                  system for Kyambogo University. For official elections use the
                  university's authorized channels.
                </div>
              </div>

              <div className="mt-4 d-flex align-items-center">
                <Link
                  to="/register"
                  className="btn btn-primary btn-md d-flex align-items-center justify-content-center me-3"
                  style={{ minWidth: 170, padding: "0.6rem 1rem" }}
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
                  style={{ minWidth: 150, padding: "0.6rem 1rem" }}
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
              <Card
                className="shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Card.Body>
                  <h5 className="text-white fw-bold">Sample Ballot</h5>
                  <p className="text-white-50 small">
                    Preview how voting looks for students
                  </p>
                  <div className="mt-3">
                    <div className="mb-2 text-white">
                      <strong>President</strong>
                      <div className="d-flex justify-content-between align-items-center bg-white bg-opacity-10 p-2 rounded mt-1">
                        <div>
                          <div className="fw-bold">Alice N.</div>
                          <div className="small text-white-50">
                            Manifesto highlight...
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-light">
                          Select
                        </button>
                      </div>
                    </div>

                    <div className="mb-2 text-white">
                      <strong>Vice President</strong>
                      <div className="d-flex justify-content-between align-items-center bg-white bg-opacity-10 p-2 rounded mt-1">
                        <div>
                          <div className="fw-bold">Brian K.</div>
                          <div className="small text-white-50">
                            Focus on student services
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-light">
                          Select
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 d-flex justify-content-between align-items-center">
                      <small className="text-white-50">
                        Preview only — actual voting is secure & verified
                      </small>
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
            {[
              {
                key: "security",
                title: "High Security",
                desc: "Every vote is encrypted and tamper-proof, ensuring full integrity.",
                bg: "#e8f4ff",
                fg: "#08306b",
                icon: (
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V7l-8-4-8 4v5c0 6 8 10 8 10z" />
                  </svg>
                ),
                details:
                  "Uses modern encryption and auditable logs to protect votes.",
              },
              {
                key: "automation",
                title: "Automation",
                desc: "Instant result tallying with minimal administrative overhead.",
                bg: "#f0fff4",
                fg: "#0b5132",
                icon: (
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.8 13.3A8 8 0 1 0 12 20v-2a6 6 0 1 1 6-6h2.8z" />
                  </svg>
                ),
                details:
                  "Automated tallies, scheduling and role-based workflows reduce manual effort.",
              },
              {
                key: "performance",
                title: "Fast & Reliable",
                desc: "Optimized for performance and uptime during peak election hours.",
                bg: "#fff7e6",
                fg: "#7a4300",
                icon: (
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-4l-3 9-4-18-3 9H2" />
                  </svg>
                ),
                details:
                  "Built to scale with caching and resilient connections to ensure availability.",
              },
              {
                key: "user",
                title: "User-Centered",
                desc: "Simple, accessible interface for all students and admins.",
                bg: "#f6eefc",
                fg: "#3f0f66",
                icon: (
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
                details:
                  "Designed with accessibility and simplicity in mind for fast onboarding.",
              },
            ].map((item) => (
              <Col lg={3} md={6} key={item.key}>
                <a
                  className="lp-feature-link"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("openFeatureModal", { detail: item })
                    )
                  }
                >
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
                icon: "🛡️",
                title: "Role-Based Dashboards",
                text: "Separate interfaces for students and admins to enhance workflow and control.",
              },
              {
                icon: "📊",
                title: "Real-Time Results",
                text: "Get live vote counts and results updates powered by WebSocket communication.",
              },
              {
                icon: "📝",
                title: "Audit Logs",
                text: "Every action recorded for transparency and accountability.",
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
        style={{ width: "100%", overflow: "hidden", maxWidth: "100vw" }}
      >
        <div
          className="container-fluid text-center"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            overflow: "hidden",
            paddingLeft: "2rem",
            paddingRight: "2rem",
          }}
        >
          <h2 className="fw-bold mb-5" style={{ color: "#003366" }}>
            What Students Say
          </h2>
          <div className="testimonials-scroll-container">
            <div className="testimonials-scroll-track">
              {/* First set of testimonials */}
              {[
                {
                  img: "https://via.placeholder.com/100?text=Sarah",
                  name: "Sarah",
                  text: "Voting has never been this easy. The interface is clean and quick!",
                  faculty: "Faculty of Science",
                  course: "Information Technology",
                  rating: 5,
                },
                {
                  img: "https://via.placeholder.com/100?text=David",
                  name: "David",
                  text: "I love the transparency and the instant results. Great system!",
                  faculty: "Faculty of Engineering",
                  course: "Computer Engineering",
                  rating: 5,
                },
                {
                  img: "https://via.placeholder.com/100?text=Emily",
                  name: "Emily",
                  text: "As an admin, managing elections is now stress-free and automated.",
                  faculty: "Faculty of Business",
                  course: "Marketing",
                  rating: 5,
                },
                {
                  img: "https://via.placeholder.com/100?text=John",
                  name: "John",
                  text: "The voting process is secure and transparent. I trust this system!",
                  faculty: "Faculty of Arts",
                  course: "Political Science",
                  rating: 5,
                },
                {
                  img: "https://via.placeholder.com/100?text=Mary",
                  name: "Mary",
                  text: "Real-time results are amazing! No more waiting for days.",
                  faculty: "Faculty of Education",
                  course: "Education Management",
                  rating: 5,
                },
              ].map((item, index) => (
                <Card
                  key={`testimonial-1-${index}`}
                  className="testimonial-card p-4 text-center"
                  style={{ border: "0", boxShadow: "none", outline: "none" }}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="testimonial-img mb-3 mx-auto"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #003366",
                    }}
                  />
                  <Card.Body className="p-0">
                    {/* Star Rating */}
                    <div className="mb-3">
                      {[...Array(item.rating)].map((_, i) => (
                        <i
                          key={i}
                          className="fa-solid fa-star"
                          style={{
                            color: "#ffc107",
                            fontSize: "0.9rem",
                            marginRight: "2px",
                          }}
                        ></i>
                      ))}
                    </div>
                    <p
                      className="text-muted mb-3"
                      style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                    >
                      <em>"{item.text}"</em>
                    </p>
                    <h6 className="fw-bold mb-1" style={{ color: "#003366" }}>
                      {item.name}
                    </h6>
                    <div className="small text-secondary">
                      <em>{item.faculty}</em>
                    </div>
                    <div className="small text-muted">
                      <em>{item.course}</em>
                    </div>
                  </Card.Body>
                </Card>
              ))}

              {/* Duplicate set for seamless loop */}
              {[
                {
                  img: "https://via.placeholder.com/100?text=Sarah",
                  name: "Sarah",
                  text: "Voting has never been this easy. The interface is clean and quick!",
                  faculty: "Faculty of Science",
                  course: "Information Technology",
                  rating: 5,
                },
                {
                  img: "https://via.placeholder.com/100?text=David",
                  name: "David",
                  text: "I love the transparency and the instant results. Great system!",
                  faculty: "Faculty of Engineering",
                  course: "Computer Engineering",
                  rating: 5,
                },
                {
                  img: "https://via.placeholder.com/100?text=Emily",
                  name: "Emily",
                  text: "As an admin, managing elections is now stress-free and automated.",
                  faculty: "Faculty of Business",
                  course: "Marketing",
                  rating: 5,
                },
                {
                  img: "https://via.placeholder.com/100?text=John",
                  name: "John",
                  text: "The voting process is secure and transparent. I trust this system!",
                  faculty: "Faculty of Arts",
                  course: "Political Science",
                  rating: 5,
                },
                {
                  img: "https://via.placeholder.com/100?text=Mary",
                  name: "Mary",
                  text: "Real-time results are amazing! No more waiting for days.",
                  faculty: "Faculty of Education",
                  course: "Education Management",
                  rating: 5,
                },
              ].map((item, index) => (
                <Card
                  key={`testimonial-2-${index}`}
                  className="testimonial-card p-4 text-center"
                  style={{ border: "0", boxShadow: "none", outline: "none" }}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="testimonial-img mb-3 mx-auto"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #003366",
                    }}
                  />
                  <Card.Body className="p-0">
                    {/* Star Rating */}
                    <div className="mb-3">
                      {[...Array(item.rating)].map((_, i) => (
                        <i
                          key={i}
                          className="fa-solid fa-star"
                          style={{
                            color: "#ffc107",
                            fontSize: "0.9rem",
                            marginRight: "2px",
                          }}
                        ></i>
                      ))}
                    </div>
                    <p
                      className="text-muted mb-3"
                      style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                    >
                      <em>"{item.text}"</em>
                    </p>
                    <h6 className="fw-bold mb-1" style={{ color: "#003366" }}>
                      {item.name}
                    </h6>
                    <div className="small text-secondary">
                      <em>{item.faculty}</em>
                    </div>
                    <div className="small text-muted">
                      <em>{item.course}</em>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEVELOPERS ===== */}
      <section
        id="developers"
        className="py-5"
        style={{
          width: "100%",
          backgroundColor: "#f8f9fa",
          overflow: "hidden",
          maxWidth: "100vw",
        }}
      >
        <div
          className="container-fluid text-center"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            overflow: "hidden",
            paddingLeft: "2rem",
            paddingRight: "2rem",
          }}
        >
          <div className="mb-5">
            <h2 className="fw-bold mb-3" style={{ color: "#003366" }}>
              Meet the Development Team
            </h2>
            <p
              className="text-muted"
              style={{
                maxWidth: "700px",
                margin: "0 auto",
                fontSize: "1.05rem",
              }}
            >
              A dedicated team of innovators from Kyambogo University's School
              of Computing, passionate about transforming campus democracy
              through technology.
            </p>
          </div>

          <div className="developers-scroll-container">
            <div className="developers-scroll-track">
              {/* First set of developers */}
              {[
                {
                  img: BalibasekaImage,
                  name: "Balibaseka Deo",
                  role: "Full Stack Engineer",
                  expertise: "Scalable Architecture",
                  bio: "Specializes in architecting robust end-to-end solutions and high-performance backends.",
                  years: "2+ years",
                  skills: [
                    "Python",
                    "Django",
                    "PostgreSQL",
                    "React",
                    "REST APIs",
                  ],
                },
                {
                  img: WambogoImage,
                  name: "Wambogo Hassan Sadat",
                  role: "Project Manager",
                  expertise: "Agile Operations",
                  bio: "Expert at bridging the gap between stakeholder vision and technical execution through Scrum.",
                  years: "3+ years",
                  skills: [
                    "Scrum", 
                    "Jira", 
                    "Agile Strategy", 
                    "Leadership"
                  ],
                },
                {
                  img: GittaImage,
                  name: "Ggita Ibrahim",
                  role: "System Analyst & Researcher",
                  expertise: "User Research",
                  bio: "Focuses on translating complex user requirements into actionable system specifications.",
                  years: "2+ years",
                  skills: [
                    "Requirements Gathering",
                    "UML",
                    "Figma",
                    "Analytical Writing",
                  ],
                },
                {
                  img: KijjambuImage,
                  name: "Kijjambu Joseph",
                  role: "Frontend Developer",
                  expertise: "Interactive UI",
                  bio: "Crafting high-performance, responsive interfaces with a focus on smooth user flows.",
                  years: "2+ years",
                  skills: [
                    "React",
                    "HTML5",
                    "CSS3",
                    "Tailwind CSS",
                    "Framer Motion",
                  ],
                },
                {
                  img: OmoloImage,
                  name: "Omolo Pasikali",
                  role: "Database Specialist",
                  expertise: "Data Integrity",
                  bio: "Specialist in optimizing complex queries and managing high-availability data clusters.",
                  years: "2+ years",
                  skills: ["OracleDB", "MySQL", "Redis", "SQL Optimization"],
                },
                {
                  img: MulwanyiImage,
                  name: "Mulwanyi Akram",
                  role: "QA Engineer",
                  expertise: "Automation Testing",
                  bio: "Implementing rigorous automated testing pipelines to ensure zero-defect deployments.",
                  years: "2+ years",
                  skills: ["Jest", "Cypress", "CI/CD", "Automated Testing"],
                },
                {
                  img: MugerwaImage,
                  name: "Mugerwa Dickson",
                  role: "Frontend Developer",
                  expertise: "Visual Design",
                  bio: "Bridging the gap between creative design and functional, pixel-perfect frontend code.",
                  years: "2+ years",
                  skills: ["React", "CSS3", "Adobe XD", "Component Libraries"],
                },
                {
                  name: "Lisa Anderson",
                  role: "Senior Project Manager",
                  expertise: "Strategic Leadership",
                  bio: "Driving long-term product roadmaps and mentoring agile teams for peak performance.",
                  years: "6+ years",
                  skills: [
                    "Kanban",
                    "Stakeholder Management",
                    "Strategic Planning",
                    "Leadership",
                  ],
                },
                {
                  img: SsentongoImage,
                  name: "Ssentongo Edrine",
                  role: "Frontend Developer",
                  expertise: "Responsive Design",
                  bio: "Mobile-first development",
                  years: "2+ years",
                  skills: ["Bootstrap", "Sass", "Mobile"],
                },
                {
                  img: NsubugaImage,
                  name: "Nsubuga Ediger",
                  role: "Full Stack Engineer",
                  expertise: "Scalable Architecture",
                  bio: "Specializes in architecting robust end-to-end solutions and high-performance backends.",
                  years: "2+ years",
                  skills: [
                    "Python",
                    "Django",
                    "OracleDB",
                    "HTML5",
                    "REST APIs",
                  ],
                },
                {
                  img: MuchweziImage,
                  name: "Muchwezi Onesmus",
                  role: "Full Stack Engineer",
                  expertise: "Integration",
                  bio: "Connecting systems seamlessly",
                  years: "2+ years",
                  skills: ["Webhooks", "APIs", "Integration"],
                },
                {
                  name: "Amanda Moore",
                  role: "Documentation Lead",
                  expertise: "Technical Writing",
                  bio: "Making tech understandable",
                  years: "2+ years",
                  skills: ["Writing", "Docs", "Guides"],
                },
              ].map((dev, i) => (
                <Card
                  key={`dev-1-${i}`}
                  className="developer-card-new shadow-sm border-0 p-4 text-center"
                >
                  <div className="position-relative d-inline-block mx-auto mb-3">
                    <Card.Img
                      src={
                        dev.img ||
                        `https://via.placeholder.com/120?text=${
                          dev.name.split(" ")[0]
                        }`
                      }
                      className="rounded-circle"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        border: "4px solid #003366",
                      }}
                    />
                    <span
                      className="position-absolute"
                      style={{
                        bottom: "0",
                        right: "0",
                        background: "#28a745",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "3px solid white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    ></span>
                  </div>
                  <Card.Body className="p-0">
                    <h6
                      className="fw-bold mb-2"
                      style={{ color: "#003366", fontSize: "1.05rem" }}
                    >
                      {dev.name}
                    </h6>
                    <div
                      className="mb-2 px-3 py-1 d-inline-block"
                      style={{
                        backgroundColor: "#e3f0ff",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#0056b3",
                      }}
                    >
                      {dev.role}
                    </div>
                    <p
                      className="text-muted mb-2"
                      style={{ fontSize: "0.9rem", fontStyle: "italic" }}
                    >
                      {dev.bio}
                    </p>
                    <div className="mb-3">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#fff3cd",
                          color: "#856404",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "4px 10px",
                        }}
                      >
                        <i className="fa-solid fa-award me-1"></i>
                        {dev.years}
                      </span>
                    </div>
                    {/* Skills tags */}
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                      {dev.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge bg-light text-dark"
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {/* Social links */}
                    <div
                      className="d-flex justify-content-center gap-3 mt-3 pt-3"
                      style={{ borderTop: "1px solid #e9ecef" }}
                    >
                      <a
                        href="#"
                        className="text-muted"
                        style={{ fontSize: "1.1rem", transition: "all 0.2s" }}
                        aria-label="GitHub"
                      >
                        <i className="fa-brands fa-github"></i>
                      </a>
                      <a
                        href="#"
                        className="text-muted"
                        style={{ fontSize: "1.1rem", transition: "all 0.2s" }}
                        aria-label="LinkedIn"
                      >
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                      <a
                        href="#"
                        className="text-muted"
                        style={{ fontSize: "1.1rem", transition: "all 0.2s" }}
                        aria-label="Email"
                      >
                        <i className="fa-solid fa-envelope"></i>
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              ))}

              {/* Duplicate set for seamless loop */}
              {[
                {
                  img: BalibasekaImage,
                  name: "Balibaseka Deo",
                  role: "Full Stack Engineer",
                  expertise: "Scalable Architecture",
                  bio: "Specializes in architecting robust end-to-end solutions and high-performance backends.",
                  years: "2+ years",
                  skills: [
                    "Python",
                    "Django",
                    "PostgreSQL",
                    "React",
                    "REST APIs",
                  ],
                },
                {
                  img: WambogoImage,
                  name: "Wambogo Hassan Sadat",
                  role: "Project Manager",
                  expertise: "Agile Operations",
                  bio: "Expert at bridging the gap between stakeholder vision and technical execution through Scrum.",
                  years: "3+ years",
                  skills: [
                    "Scrum", 
                    "Jira", 
                    "Agile Strategy", 
                    "Leadership"
                  ],
                },
                {
                  img: GittaImage,
                  name: "Ggita Ibrahim",
                  role: "System Analyst & Researcher",
                  expertise: "User Research",
                  bio: "Focuses on translating complex user requirements into actionable system specifications.",
                  years: "2+ years",
                  skills: [
                    "Requirements Gathering",
                    "UML",
                    "Figma",
                    "Analytical Writing",
                  ],
                },
                {
                  img: KijjambuImage,
                  name: "Kijjambu Joseph",
                  role: "Frontend Developer",
                  expertise: "Interactive UI",
                  bio: "Crafting high-performance, responsive interfaces with a focus on smooth user flows.",
                  years: "2+ years",
                  skills: [
                    "React",
                    "HTML5",
                    "CSS3",
                    "Tailwind CSS",
                    "Framer Motion",
                  ],
                },
                {
                  img: OmoloImage,
                  name: "Omolo Pasikali",
                  role: "Database Specialist",
                  expertise: "Data Integrity",
                  bio: "Specialist in optimizing complex queries and managing high-availability data clusters.",
                  years: "2+ years",
                  skills: ["OracleDB", "MySQL", "Redis", "SQL Optimization"],
                },
                {
                  img: MulwanyiImage,
                  name: "Mulwanyi Akram",
                  role: "QA Engineer",
                  expertise: "Automation Testing",
                  bio: "Implementing rigorous automated testing pipelines to ensure zero-defect deployments.",
                  years: "2+ years",
                  skills: ["Jest", "Cypress", "CI/CD", "Automated Testing"],
                },
                {
                  img: MugerwaImage,
                  name: "Mugerwa Dickson",
                  role: "Frontend Developer",
                  expertise: "Visual Design",
                  bio: "Bridging the gap between creative design and functional, pixel-perfect frontend code.",
                  years: "2+ years",
                  skills: ["React", "CSS3", "Adobe XD", "Component Libraries"],
                },
                {
                  name: "Lisa Anderson",
                  role: "Senior Project Manager",
                  expertise: "Strategic Leadership",
                  bio: "Driving long-term product roadmaps and mentoring agile teams for peak performance.",
                  years: "6+ years",
                  skills: [
                    "Kanban",
                    "Stakeholder Management",
                    "Strategic Planning",
                    "Leadership",
                  ],
                },
                {
                  img: SsentongoImage,
                  name: "Ssentongo Edrine",
                  role: "Frontend Developer",
                  expertise: "Responsive Design",
                  bio: "Mobile-first development",
                  years: "2+ years",
                  skills: ["Bootstrap", "Sass", "Mobile"],
                },
                {
                  img: NsubugaImage,
                  name: "Nsubuga Ediger",
                  role: "Full Stack Engineer",
                  expertise: "Scalable Architecture",
                  bio: "Specializes in architecting robust end-to-end solutions and high-performance backends.",
                  years: "2+ years",
                  skills: [
                    "Python",
                    "Django",
                    "OracleDB",
                    "HTML5",
                    "REST APIs",
                  ],
                },
                {
                  img: MuchweziImage,
                  name: "Muchwezi Onesmus",
                  role: "Full Stack Engineer",
                  expertise: "Integration",
                  bio: "Connecting systems seamlessly",
                  years: "2+ years",
                  skills: ["Webhooks", "APIs", "Integration"],
                },
                {
                  name: "Amanda Moore",
                  role: "Documentation Lead",
                  expertise: "Technical Writing",
                  bio: "Making tech understandable",
                  years: "2+ years",
                  skills: ["Writing", "Docs", "Guides"],
                },
              ].map((dev, i) => (
                <Card
                  key={`dev-2-${i}`}
                  className="developer-card-new shadow-sm border-0 p-4 text-center"
                >
                  <div className="position-relative d-inline-block mx-auto mb-3">
                    <Card.Img
                      src={
                        dev.img ||
                        `https://via.placeholder.com/120?text=${
                          dev.name.split(" ")[0]
                        }`
                      }
                      className="rounded-circle"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        border: "4px solid #003366",
                      }}
                    />
                    <span
                      className="position-absolute"
                      style={{
                        bottom: "0",
                        right: "0",
                        background: "#28a745",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "3px solid white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    ></span>
                  </div>
                  <Card.Body className="p-0">
                    <h6
                      className="fw-bold mb-2"
                      style={{ color: "#003366", fontSize: "1.05rem" }}
                    >
                      {dev.name}
                    </h6>
                    <div
                      className="mb-2 px-3 py-1 d-inline-block"
                      style={{
                        backgroundColor: "#e3f0ff",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#0056b3",
                      }}
                    >
                      {dev.role}
                    </div>
                    <p
                      className="text-muted mb-2"
                      style={{ fontSize: "0.9rem", fontStyle: "italic" }}
                    >
                      {dev.bio}
                    </p>
                    <div className="mb-3">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#fff3cd",
                          color: "#856404",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "4px 10px",
                        }}
                      >
                        <i className="fa-solid fa-award me-1"></i>
                        {dev.years}
                      </span>
                    </div>
                    {/* Skills tags */}
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                      {dev.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge bg-light text-dark"
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {/* Social links */}
                    <div
                      className="d-flex justify-content-center gap-3 mt-3 pt-3"
                      style={{ borderTop: "1px solid #e9ecef" }}
                    >
                      <a
                        href="#"
                        className="text-muted"
                        style={{ fontSize: "1.1rem", transition: "all 0.2s" }}
                        aria-label="GitHub"
                      >
                        <i className="fa-brands fa-github"></i>
                      </a>
                      <a
                        href="#"
                        className="text-muted"
                        style={{ fontSize: "1.1rem", transition: "all 0.2s" }}
                        aria-label="LinkedIn"
                      >
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                      <a
                        href="#"
                        className="text-muted"
                        style={{ fontSize: "1.1rem", transition: "all 0.2s" }}
                        aria-label="Email"
                      >
                        <i className="fa-solid fa-envelope"></i>
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>

          {/* Team CTA */}
          <div className="mt-5">
            <div
              className="p-5 position-relative"
              style={{
                background: "linear-gradient(135deg, #003366 0%, #0056b3 100%)",
                borderRadius: "16px",
                maxWidth: "1400px",
                margin: "0 auto",
                boxShadow: "0 10px 40px rgba(0,51,102,0.2)",
                overflow: "hidden",
              }}
            >
              {/* Decorative elements */}
              <div
                className="position-absolute"
                style={{
                  top: "-50px",
                  right: "-50px",
                  width: "200px",
                  height: "200px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                }}
              ></div>
              <div
                className="position-absolute"
                style={{
                  bottom: "-30px",
                  left: "-30px",
                  width: "150px",
                  height: "150px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "50%",
                }}
              ></div>

              <div className="position-relative text-center text-white">
                <div className="mb-4">
                  <i
                    className="fa-solid fa-users-gear"
                    style={{ fontSize: "3.5rem", opacity: 0.9 }}
                  ></i>
                </div>
                <h4 className="fw-bold mb-3">Join Our Innovative Team</h4>
                <p
                  className="mb-4"
                  style={{
                    fontSize: "1.05rem",
                    opacity: 0.95,
                    maxWidth: "600px",
                    margin: "0 auto 1.5rem",
                  }}
                >
                  Passionate about technology and democracy? We're building the
                  future of campus elections and we'd love to have you on board.
                  Whether you're a developer, designer, or tech enthusiast,
                  there's a place for you here.
                </p>

                {/* Features */}
                <div className="row g-3 mb-4 text-start">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <i
                        className="fa-solid fa-rocket mt-1"
                        style={{ fontSize: "1.2rem", color: "#ffc107" }}
                      ></i>
                      <div>
                        <h6 className="mb-1 fw-bold">Modern Tech Stack</h6>
                        <small style={{ opacity: 0.9 }}>
                          Work with React, Node.js, MongoDB, Java, Python, MySQL, Oracle and cutting-edge tools
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <i
                        className="fa-solid fa-lightbulb mt-1"
                        style={{ fontSize: "1.2rem", color: "#ffc107" }}
                      ></i>
                      <div>
                        <h6 className="mb-1 fw-bold">Real Impact</h6>
                        <small style={{ opacity: 0.9 }}>
                          Build solutions that transform campus democracy
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <i
                        className="fa-solid fa-graduation-cap mt-1"
                        style={{ fontSize: "1.2rem", color: "#ffc107" }}
                      ></i>
                      <div>
                        <h6 className="mb-1 fw-bold">Learn & Grow</h6>
                        <small style={{ opacity: 0.9 }}>
                          Collaborate with talented peers and mentors
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <i
                        className="fa-solid fa-clock mt-1"
                        style={{ fontSize: "1.2rem", color: "#ffc107" }}
                      ></i>
                      <div>
                        <h6 className="mb-1 fw-bold">Flexible Hours</h6>
                        <small style={{ opacity: 0.9 }}>
                          Work on your schedule while studying
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-2 gap-md-3" style={{ flexWrap: 'nowrap', overflowX: 'auto', justifyContent: 'center' }}>
                  <a href="#contact" className="btn btn-light btn-lg px-3 px-md-4" style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em' }}>
                    <i className="fa-solid fa-envelope me-2"></i>
                    <span className="d-none d-sm-inline">Get In Touch</span>
                    <span className="d-sm-none">Touch</span>
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-light btn-lg px-3 px-md-4"
                    style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em' }}
                  >
                    <i className="fa-brands fa-github me-2"></i>
                    <span className="d-none d-sm-inline">View on GitHub</span>
                    <span className="d-sm-none">GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section
        id="cta"
        className="text-center text-white d-flex align-items-center justify-content-center flex-column py-5 px-3"
        style={{
          backgroundColor: "#004080",
          minHeight: "50vh",
          width: "100%",
        }}
      >
        <div className="container">
          <h2 className="fw-bold mb-4">
            Be Part of the Future of Campus Elections
          </h2>
          <p className="mb-4 mx-auto" style={{ maxWidth: "600px" }}>
            Register today and make your voice count in every election.
          </p>
          <Link to="/register" className="btn btn-light btn-lg">
            Get Started
          </Link>
        </div>
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
                  <div
                    className="contact-line d-flex align-items-start gap-3 py-3"
                    style={{ borderBottom: "1px solid rgba(3,51,102,0.06)" }}
                  >
                    <i
                      className="fa-solid fa-envelope contact-icon"
                      aria-hidden="true"
                      style={{
                        width: 52,
                        height: 52,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(11,99,181,0.12)",
                        borderRadius: 10,
                        color: "#0b63b5",
                        fontSize: 20,
                        flex: "0 0 52px",
                      }}
                    ></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div
                        className="small text-muted"
                        style={{ marginBottom: 4 }}
                      >
                        Email
                      </div>
                      <a
                        href="mailto:conceptcrashers256@gmail.com"
                        className="fw-semibold contact-value"
                        style={{
                          fontWeight: 600,
                          color: "#0b63b5",
                          textDecoration: "underline",
                        }}
                      >
                        info@campusballot.tech
                      </a>
                    </div>
                  </div>

                  <div
                    className="contact-line d-flex align-items-start gap-3 py-3"
                    style={{ borderBottom: "1px solid rgba(3,51,102,0.06)" }}
                  >
                    <i
                      className="fa-solid fa-phone contact-icon"
                      aria-hidden="true"
                      style={{
                        width: 52,
                        height: 52,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(11,99,181,0.12)",
                        borderRadius: 10,
                        color: "#0b63b5",
                        fontSize: 20,
                        flex: "0 0 52px",
                      }}
                    ></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div
                        className="small text-muted"
                        style={{ marginBottom: 4 }}
                      >
                        Phone
                      </div>
                      <a
                        href="tel:+256775299688"
                        className="fw-semibold contact-value"
                        style={{
                          fontWeight: 600,
                          color: "#0b63b5",
                          textDecoration: "underline",
                        }}
                      >
                        +256 775299688
                      </a>
                    </div>
                  </div>

                  <div
                    className="contact-line d-flex align-items-start gap-3 py-3"
                    style={{ borderBottom: "1px solid rgba(3,51,102,0.06)" }}
                  >
                    <i
                      className="fa-solid fa-location-dot contact-icon"
                      aria-hidden="true"
                      style={{
                        width: 52,
                        height: 52,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(11,99,181,0.12)",
                        borderRadius: 10,
                        color: "#0b63b5",
                        fontSize: 20,
                        flex: "0 0 52px",
                      }}
                    ></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div
                        className="small text-muted"
                        style={{ marginBottom: 4 }}
                      >
                        Office
                      </div>
                      <div
                        className="fw-semibold"
                        style={{ fontWeight: 600, color: "#111" }}
                      >
                        SCIS, Kyambogo University
                      </div>
                    </div>
                  </div>

                  <div
                    className="contact-line d-flex align-items-start gap-3 py-3"
                    style={{ borderBottom: "1px solid rgba(3,51,102,0.06)" }}
                  >
                    <i
                      className="fa-solid fa-clock contact-icon"
                      aria-hidden="true"
                      style={{
                        width: 52,
                        height: 52,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(11,99,181,0.12)",
                        borderRadius: 10,
                        color: "#0b63b5",
                        fontSize: 20,
                        flex: "0 0 52px",
                      }}
                    ></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div
                        className="small text-muted"
                        style={{ marginBottom: 4 }}
                      >
                        Office Hours
                      </div>
                      <div className="fw-semibold" style={{ fontWeight: 600 }}>
                        Mon - Fri, 09:00 - 17:00
                      </div>
                    </div>
                  </div>

                  <div
                    className="contact-line d-flex align-items-start gap-3 py-3"
                    style={{ borderBottom: "none" }}
                  >
                    <i
                      className="fa-solid fa-life-ring contact-icon"
                      aria-hidden="true"
                      style={{
                        width: 52,
                        height: 52,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(11,99,181,0.12)",
                        borderRadius: 10,
                        color: "#0b63b5",
                        fontSize: 20,
                        flex: "0 0 52px",
                      }}
                    ></i>
                    <div className="contact-text" style={{ lineHeight: 1.15 }}>
                      <div
                        className="small text-muted"
                        style={{ marginBottom: 4 }}
                      >
                        Support
                      </div>
                      <a
                        href="mailto:conceptcrashers256@gmail.com"
                        className="fw-semibold contact-value"
                        style={{
                          fontWeight: 600,
                          color: "#0b63b5",
                          textDecoration: "underline",
                        }}
                      >
                        support@campusballot.tech
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="p-3 h-100">
                <h5 className="fw-bold">Send us a message</h5>
                <form onSubmit={handleContactSubmit}>
                  <div className="mb-3">
                    <div className="input-with-icon">
                      <i className="fa-solid fa-user input-icon"></i>
                      <input
                        className="form-control contact-input"
                        name="name"
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="input-with-icon">
                      <i className="fa-solid fa-envelope input-icon"></i>
                      <input
                        className="form-control contact-input"
                        type="email"
                        name="email"
                        placeholder="Your email"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="input-with-icon">
                      <i className="fa-solid fa-pen input-icon"></i>
                      <input
                        className="form-control contact-input"
                        name="subject"
                        placeholder="Subject"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="input-with-icon">
                      <i className="fa-solid fa-message input-icon-textarea"></i>
                      <textarea
                        className="form-control contact-textarea"
                        name="message"
                        rows={8}
                        placeholder="Your message..."
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="d-grid">
                    <button className="btn btn-primary btn-lg" type="submit">
                      <i className="fa-solid fa-paper-plane me-2"></i>
                      Send Message
                    </button>
                  </div>
                </form>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* ===== FAQS ===== */}
      <section
        id="faqs"
        className="py-5"
        style={{ width: "100%", backgroundColor: "#f8f9fa" }}
      >
        <div className="container-fluid px-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ color: "#003366" }}>
              Frequently Asked Questions
            </h2>
            <p
              className="text-muted"
              style={{
                maxWidth: "700px",
                margin: "0 auto",
                fontSize: "1.05rem",
              }}
            >
              Find answers to common questions about Campus Ballot. Can't find
              what you're looking for?
              <a
                href="#contact"
                style={{
                  color: "#003366",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {" "}
                Contact us
              </a>
              .
            </p>
          </div>
          <Row className="justify-content-center">
            <Col lg={9}>
              <Accordion defaultActiveKey="0" className="faq-accordion">
                {faqs.map((f, i) => (
                  <Accordion.Item
                    eventKey={String(i)}
                    key={i}
                    className="mb-3"
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <Accordion.Header
                      style={{ fontSize: "1.05rem", fontWeight: 600 }}
                    >
                      {f.q}
                    </Accordion.Header>
                    <Accordion.Body
                      style={{
                        fontSize: "1rem",
                        lineHeight: "1.7",
                        color: "#555",
                        padding: "1.25rem 1.5rem",
                      }}
                    >
                      {f.a}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>

          {/* Still have questions CTA */}
          <div className="text-center mt-5">
            <div
              className="p-4"
              style={{
                background: "#fff",
                borderRadius: "12px",
                maxWidth: "600px",
                margin: "0 auto",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h5 className="fw-bold mb-3" style={{ color: "#003366" }}>
                Still have questions?
              </h5>
              <p className="text-muted mb-3">
                Our support team is here to help you with any questions or
                concerns.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <a href="#contact" className="btn btn-primary">
                  <i className="fa-solid fa-envelope me-2"></i>
                  Contact Support
                </a>
                <a
                  href="mailto:support@campusballot.tech"
                  className="btn btn-outline-primary"
                >
                  <i className="fa-solid fa-life-ring me-2"></i>
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="footer-section"
        style={{ backgroundColor: "#003366", width: "100%" }}
      >
        <div className="container-fluid px-5 py-5">
          <Row className="g-4">
            {/* About Column */}
            <Col lg={3} md={6}>
              <div className="footer-brand mb-3">
                <img
                  src={kyuLogo}
                  alt="Kyambogo University"
                  style={{ height: 48, marginBottom: 12 }}
                />
                <h5 className="text-white fw-bold mb-2">Campus Ballot</h5>
              </div>
              <p className="text-white-50 small mb-3">
                Empowering universities with secure, transparent, and accessible
                digital voting solutions for campus elections.
              </p>
              <div className="footer-social d-flex gap-2">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Twitter">
                  <i className="fa-brands fa-twitter"></i>
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
              </div>
            </Col>

            {/* Quick Links Column */}
            <Col lg={2} md={6}>
              <h6 className="text-white fw-bold mb-3">Quick Links</h6>
              <ul className="footer-links list-unstyled">
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#developers">Our Team</a>
                </li>
                <li>
                  <a href="#testimonials">Testimonials</a>
                </li>
                <li>
                  <a href="#faqs">FAQs</a>
                </li>
              </ul>
            </Col>

            {/* Resources Column */}
            <Col lg={2} md={6}>
              <h6 className="text-white fw-bold mb-3">Resources</h6>
              <ul className="footer-links list-unstyled">
                <li>
                  <Link to="/register">Register</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/contact-support">Contact Support</Link>
                </li>
                <li>
                  <Link to="/documentation">Documentation</Link>
                </li>
                <li>
                  <Link to="/privacy-policy">Privacy Policy</Link>
                </li>
              </ul>
            </Col>

            {/* Support Column */}
            <Col lg={2} md={6}>
              <h6 className="text-white fw-bold mb-3">Support</h6>
              <ul className="footer-links list-unstyled">
                <li>
                  <Link to="/documentation">Help Center</Link>
                </li>
                <li>
                  <Link to="/technical-support">Technical Support</Link>
                </li>
                <li>
                  <Link to="/terms-of-service">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/security-policy">Security</Link>
                </li>
                <li>
                  <a href="https://status.campusballot.tech" target="_blank" rel="noopener noreferrer">System Status</a>
                </li>
              </ul>
            </Col>

            {/* Contact Column */}
            <Col lg={3} md={6}>
              <h6 className="text-white fw-bold mb-3">Contact Info</h6>
              <ul className="footer-contact list-unstyled">
                <li className="d-flex align-items-start mb-2">
                  <i className="fa-solid fa-location-dot me-2 mt-1"></i>
                  <span className="text-white-50 small">
                    SCIS, Kyambogo University, Kampala
                  </span>
                </li>
                <li className="d-flex align-items-center mb-2">
                  <i className="fa-solid fa-envelope me-2"></i>
                  <a
                    href="mailto:info@campusballot.tech"
                    className="text-white-50 small"
                  >
                    info@campusballot.tech
                  </a>
                </li>
                <li className="d-flex align-items-center mb-2">
                  <i className="fa-solid fa-phone me-2"></i>
                  <a href="tel:+256700000000" className="text-white-50 small">
                    +256 700 000 000
                  </a>
                </li>
                <li className="d-flex align-items-center">
                  <i className="fa-solid fa-clock me-2"></i>
                  <span className="text-white-50 small">
                    Mon - Fri, 09:00 - 17:00
                  </span>
                </li>
              </ul>
            </Col>
          </Row>

          {/* Footer Bottom */}
          <div
            className="footer-bottom mt-4 pt-4"
            style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Row className="align-items-center mb-3">
              <Col className="text-center">
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Link to="/privacy-policy" className="text-white-50 small text-decoration-none" style={{transition: 'color 0.3s'}}>Privacy Policy</Link>
                  <span className="text-white-50">|</span>
                  <Link to="/terms-of-service" className="text-white-50 small text-decoration-none" style={{transition: 'color 0.3s'}}>Terms of Service</Link>
                  <span className="text-white-50">|</span>
                  <Link to="/eula" className="text-white-50 small text-decoration-none" style={{transition: 'color 0.3s'}}>EULA</Link>
                  <span className="text-white-50">|</span>
                  <Link to="/security-policy" className="text-white-50 small text-decoration-none" style={{transition: 'color 0.3s'}}>Security Policy</Link>
                </div>
              </Col>
            </Row>
            <Row className="align-items-center">
              <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
                <p className="text-white-50 small mb-0">
                  © {new Date().getFullYear()} Campus Ballot. All rights
                  reserved.
                </p>
              </Col>
              <Col md={6} className="text-center text-md-end">
                <p className="text-white-50 small mb-0">
                  Developed with{" "}
                  <i className="fa-solid fa-heart text-danger"></i> by{" "}
                  <strong className="text-white">Concept Crashers</strong>
                </p>
              </Col>
            </Row>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          aria-label="Scroll to top"
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #003366 0%, #0056b3 100%)",
            color: "white",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,51,102,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            transition: "all 0.3s ease",
            zIndex: 1000,
            animation: "fadeInUp 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-5px) scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,51,102,0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,51,102,0.3)";
          }}
        >
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      )}

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/256786021431?text=Hello!%20I'm%20interested%20in%20Campus%20Ballot"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat on WhatsApp"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#25D366",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(37,211,102,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          transition: "all 0.3s ease",
          zIndex: 1000,
          textDecoration: "none",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.15) rotate(10deg)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,0.6)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,211,102,0.4)";
        }}
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>
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
    window.addEventListener("openFeatureModal", handler);
    return () => window.removeEventListener("openFeatureModal", handler);
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
