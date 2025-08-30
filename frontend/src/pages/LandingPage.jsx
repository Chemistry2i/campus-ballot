import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVoteYea,
  faUserShield,
  faChartBar,
  faUsers,
  faLock,
  faMobileAlt,
  faCheckCircle,
  faQuestionCircle,
  faEnvelope,
  faListOl,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";// Responsive section style

const sectionStyle = (bg, color = "#fff") => ({
  minHeight: "70vh",
  width: "100vw",
  background: bg,
  color,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "5vw 4vw",
  boxSizing: "border-box",
});

function LandingPage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", overflowX: "hidden" }}>
      {/* Navigation Bar */}
      <nav
        style={{
          width: "100vw",
          background: "#2563eb",
          color: "#fff",
          padding: "1rem 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: "2rem", fontWeight: 600 }}>
          <a href="#hero" style={{ color: "#fff", textDecoration: "none" }}>Home</a>
          <a href="#about" style={{ color: "#fff", textDecoration: "none" }}>About</a>
          <a href="#features" style={{ color: "#fff", textDecoration: "none" }}>Features</a>
          <a href="#how" style={{ color: "#fff", textDecoration: "none" }}>How It Works</a>
          <a href="#faq" style={{ color: "#fff", textDecoration: "none" }}>FAQ</a>
          <a href="#contact" style={{ color: "#fff", textDecoration: "none" }}>Contact</a>
          <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>Login</Link>
          <Link to="/register" style={{ color: "#fff", textDecoration: "none" }}>Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        style={{
          ...sectionStyle("linear-gradient(135deg, #2563eb 0%, #2193b0 100%)"),
          minHeight: "80vh",
          paddingTop: "12vh",
          paddingBottom: "8vh",
        }}
      >
        <FontAwesomeIcon icon={faVoteYea} size="4x" style={{ marginBottom: 24 }} />
        <h1
          style={{
            fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          Kyambogo University Voting System
        </h1>
        <p
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            maxWidth: 700,
            margin: "0 auto 32px",
          }}
        >
          A secure, transparent, and efficient platform for managing university elections. Empowering students and administrators with real-time results and a seamless voting experience.
        </p>
        <Link
          to="/register"
          className="btn btn-light fw-bold px-5 py-3"
          style={{
            color: "#2563eb",
            borderRadius: "5px",
            fontSize: "1.2rem",
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          Get Started
        </Link>
      </section>

      {/* About Section */}
      <section id="about" style={sectionStyle("#f9f9f9", "#222")}>
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 24px rgba(37,99,235,0.08)",
            padding: "3rem 2rem",
            maxWidth: 950,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "2.5rem",
            justifyContent: "center",
          }}
        >
          <div style={{ flex: "1 1 340px", minWidth: 260, textAlign: "left" }}>
            <h2
              style={{
                fontSize: "clamp(1.7rem, 4vw, 2.5rem)",
                color: "#2563eb",
                marginBottom: 18,
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              Why Kyambogo University Voting System?
            </h2>
            <p style={{ color: "#444", fontSize: "1.15rem", lineHeight: 1.7, marginBottom: 18 }}>
              Our platform is designed to foster trust, participation, and transparency in campus elections. With a focus on security, accessibility, and real-time engagement, we empower every student and staff member to have a voice in university leadership.
            </p>
            <ul style={{ color: "#2563eb", fontSize: "1.08rem", lineHeight: 1.7, paddingLeft: 20, fontWeight: 600 }}>
              <li>Trusted by Kyambogo University</li>
              <li>Modern & Accessible on all devices</li>
              <li>Transparent, auditable, and instant results</li>
              <li>Boosts participation and campus democracy</li>
            </ul>
          </div>
          <div style={{ flex: "1 1 260px", minWidth: 220, textAlign: "center" }}>
            <img
              src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=500&q=80"
              alt="University Voting"
              style={{
                width: "100%",
                maxWidth: 320,
                borderRadius: 14,
                boxShadow: "0 2px 16px rgba(37,99,235,0.10)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={sectionStyle("#fff", "#222")}>
        <h2
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            color: "#2563eb",
            marginBottom: 40,
          }}
        >
          Key Features
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 32,
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <FeatureCard
            icon={faVoteYea}
            title="Secure Voting"
            desc="End-to-end encrypted voting to ensure integrity and privacy."
          />
          <FeatureCard
            icon={faUserShield}
            title="Admin Dashboard"
            desc="Powerful tools for managing elections, candidates, and results."
          />
          <FeatureCard
            icon={faChartBar}
            title="Real-Time Analytics"
            desc="Live statistics and instant result computation for transparency."
          />
          <FeatureCard
            icon={faUsers}
            title="User-Friendly"
            desc="Clean, intuitive interface for both students and administrators."
          />
          <FeatureCard
            icon={faLock}
            title="Authentication"
            desc="Role-based access for admins and students, with secure login."
          />
          <FeatureCard
            icon={faMobileAlt}
            title="Mobile Responsive"
            desc="Works perfectly on any device, anywhere, anytime."
          />
          <FeatureCard
            icon={faCheckCircle}
            title="Audit Trail"
            desc="Track all actions for transparency and accountability."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" style={sectionStyle("#f9f9f9", "#222")}>
        <h2
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            color: "#2563eb",
            marginBottom: 32,
          }}
        >
          How It Works
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 32,
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <FeatureCard
            icon={faListOl}
            title="1. Register"
            desc="Students and admins sign up with their university credentials."
          />
          <FeatureCard
            icon={faVoteYea}
            title="2. Vote"
            desc="Students cast their votes securely and anonymously."
          />
          <FeatureCard
            icon={faChartBar}
            title="3. View Results"
            desc="Results are computed instantly and displayed in real time."
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={sectionStyle("#fff", "#222")}>
        <h2
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            color: "#2563eb",
            marginBottom: 32,
          }}
        >
          Frequently Asked Questions
        </h2>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "left" }}>
          <FAQ
            question="Is my vote anonymous and secure?"
            answer="Yes. All votes are encrypted and stored securely. No one can see how you voted."
          />
          <FAQ
            question="Can I vote from my phone?"
            answer="Absolutely! The system is fully mobile responsive."
          />
          <FAQ
            question="How do I know my vote was counted?"
            answer="After voting, you receive a confirmation and can see your vote in the audit trail."
          />
          <FAQ
            question="Who can participate?"
            answer="Only registered students and authorized staff of Kyambogo University."
          />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={sectionStyle("#f9f9f9", "#222")}>
        <h2
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            color: "#2563eb",
            marginBottom: 18,
          }}
        >
          Contact & Support
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#444", marginBottom: 10 }}>
          Have questions or need help? Reach out to our support team.
        </p>
        <a
          href="mailto:support@kyuvoting.ac.ug"
          style={{
            color: "#2563eb",
            fontWeight: 600,
            fontSize: "1.1rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FontAwesomeIcon icon={faEnvelope} /> support@kyuvoting.ac.ug
        </a>
        <div style={{ marginTop: 18, display: "flex", gap: 18, justifyContent: "center" }}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: 24 }}>
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: 24 }}>
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: 24 }}>
            <FontAwesomeIcon icon={faInstagram} />
          </a>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        style={{
          ...sectionStyle("linear-gradient(135deg, #2563eb 0%, #2193b0 100%)"),
          minHeight: "60vh",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.3rem, 3vw, 2.2rem)",
            marginBottom: 18,
          }}
        >
          Ready to Get Started?
        </h2>
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            maxWidth: 700,
            margin: "0 auto 32px",
          }}
        >
          Register now and experience a seamless, secure, and transparent university election process.
        </p>
        <Link
          to="/register"
          className="btn btn-light fw-bold px-5 py-3"
          style={{
            color: "#2563eb",
            borderRadius: "5px",
            fontSize: "1.2rem",
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          Register Now
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#222",
          color: "#fff",
          textAlign: "center",
          padding: "20px 0",
          fontSize: "1rem",
        }}
      >
        &copy; {new Date().getFullYear()} Kyambogo University Voting System. All rights reserved.
      </footer>
    </div>
  );
}

// FeatureCard component for reusability and clarity
function FeatureCard({ icon, title, desc }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 16px rgba(37,99,235,0.07)",
        padding: "32px 24px",
        maxWidth: 320,
        minWidth: 220,
        textAlign: "center",
        flex: "1 1 260px",
      }}
    >
      <FontAwesomeIcon icon={icon} size="2x" style={{ color: "#2563eb", marginBottom: 16 }} />
      <h5 style={{ fontSize: "1.15rem", margin: "12px 0 8px", fontWeight: 700 }}>{title}</h5>
      <p style={{ color: "#444", fontSize: "1rem", fontWeight: 500 }}>{desc}</p>
    </div>
  );
}

// FAQ component for clarity
function FAQ({ question, answer }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, color: "#2563eb", marginBottom: 4 }}>
        <FontAwesomeIcon icon={faQuestionCircle} /> {question}
      </div>
      <div style={{ color: "#333", marginLeft: 24 }}>{answer}</div>
    </div>
  );
}

export default LandingPage;