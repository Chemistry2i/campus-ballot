import React, { useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const LandingPage = () => {
  const [navOpen, setNavOpen] = useState(false);

  const MobileToggler = () => (
    <button
      className="navbar-toggler"
      type="button"
      aria-controls="navbarNav"
      aria-expanded={navOpen}
      aria-label="Toggle navigation"
      onClick={() => setNavOpen((s) => !s)}
    >
      <span className="navbar-toggler-icon"></span>
    </button>
  );

  const closeNav = () => setNavOpen(false);

  return (
    <div style={{ fontFamily: "'Merriweather', serif", overflowX: "hidden" }}>
      {/* ===== NAVBAR ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#003366", width: "100%", height: '72px' }}
      >
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold" href="#" style={{ fontSize: '1.35rem' }}>
            Campus Voting
          </a>
          <MobileToggler />
          <div className={`navbar-collapse ${navOpen ? 'show' : 'collapse'}`} id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <a className="nav-link active" href="#about" onClick={closeNav}>
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#features" onClick={closeNav}>
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how" onClick={closeNav}>
                  How It Works
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#testimonials" onClick={closeNav}>
                  Testimonials
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#developers" onClick={closeNav}>
                  Developers
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact" onClick={closeNav}>
                  Contact
                </a>
              </li>
            </ul>
            <Link to="/login" className="btn btn-light ms-3" onClick={closeNav}>
              Login
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
            <Col lg={6}>
              <h1 className="display-4 fw-bold">
                Transparent, Secure, and Easy Campus Elections
              </h1>
              <p className="lead mt-3">
                Empowering universities with digital voting solutions that
                ensure fairness, integrity, and accessibility.
              </p>
              <div className="mt-4">
                <Link to="/register" className="btn btn-primary btn-lg me-3">
                  Register Now
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  Login
                </Link>
              </div>
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
