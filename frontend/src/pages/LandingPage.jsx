import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import kyuLogo from "../assets/kyambogo-university-kyu-logo-png_seeklogo-550308.png";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const LandingPage = () => {
  return (
    <div style={{ fontFamily: "'Merriweather', serif", overflowX: "hidden" }}>
      {/* ===== NAVBAR ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#003366", width: "100%", height: '72px' }}
      >
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold d-flex align-items-center" href="#" style={{ fontSize: '1.05rem' }}>
            <img src={kyuLogo} alt="Kyambogo University" style={{ height: 70, marginRight: 10 }} />
            <span style={{ fontSize: '1.15rem' }}>Campus Ballot</span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <a className="nav-link active" href="#about">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#features">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how">
                  How It Works
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#testimonials">
                  Testimonials
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#developers">
                  Developers
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact
                </a>
              </li>
            </ul>
            <Link
              to="/login"
              className="btn btn-light ms-3 d-flex align-items-center justify-content-center"
              style={{ minWidth: 140, padding: '0.5rem 0.85rem' }}
              aria-label="Login"
            >
              {/* small inline SVG login icon */}
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
                icon: '🔒',
                title: "High Security",
                desc: "Every vote is encrypted and tamper-proof, ensuring full integrity.",
              },
              {
                icon: '⚙️',
                title: "Automation",
                desc: "Instant result tallying with minimal administrative overhead.",
              },
              {
                icon: '🚀',
                title: "Fast & Reliable",
                desc: "Optimized for performance and uptime during peak election hours.",
              },
              {
                icon: '👥',
                title: "User-Centered",
                desc: "Simple, accessible interface for all students and admins.",
              },
            ].map((item, index) => (
              <Col lg={3} md={6} key={index}>
                <Card className="h-100 text-center shadow-sm border-0 p-3">
                  <Card.Body>
                    <div className="card-icon mb-3">{item.icon}</div>
                    <h5 className="fw-bold">{item.title}</h5>
                    <p className="text-muted">{item.desc}</p>
                  </Card.Body>
                </Card>
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
          <Row className="g-4">
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
                name: 'Sa',
                text: 'Voting has never been this easy. The interface is clean and quick!',
              },
              {
                img: 'https://via.placeholder.com/100?text=David',
                name: 'David',
                text: 'I love the transparency and the instant results. Great system!',
              },
              {
                img: 'https://via.placeholder.com/100?text=Emily',
                name: 'Emily',
                text: 'As an admin, managing elections is now stress-free and automated.',
              },
            ].map((item, index) => (
              <Col lg={3} md={4} key={index}>
                <Card className="p-3 shadow-sm border-0 h-100 text-center">
                  <img src={item.img} alt={item.name} className="testimonial-img mb-3" />
                  <Card.Body>
                    <p className="text-muted">"{item.text}"</p>
                    <h6 className="fw-bold mt-3">{item.name}</h6>
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
      <section id="contact" className="py-5 bg-light" style={{ width: "100%" }}>
        <div className="container-fluid px-5 text-center">
          <h2 className="fw-bold mb-4" style={{ color: "#003366" }}>
            Contact Us
          </h2>
          <p>Email: info@campusvoting.com</p>
          <p>Kyambogo University, Kampala, Uganda</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="text-center text-white py-3"
        style={{ backgroundColor: "#003366", width: "100%" }}
      >
        <p className="mb-0">
          © {new Date().getFullYear()} Campus Voting | Developed by Concept
          Crashers
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
