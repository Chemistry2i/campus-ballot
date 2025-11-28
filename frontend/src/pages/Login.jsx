import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "./Login.module.css";
import useSocket from '../hooks/useSocket';
import kyuLogo from "../assets/kyambogo-university-kyu-logo-png_seeklogo-550308.png";

function Login({ setCurrentUser }) {
  const { reconnectWithToken } = useSocket();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/auth/login",
        form
      );
      const { token, user } = res.data;
      // Save user and token to localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Update App state if setCurrentUser is provided
      if (setCurrentUser) setCurrentUser(user);

      // Reconnect socket with new token
      try {
        reconnectWithToken(token);
      } catch (e) {
        console.warn('Socket reconnect failed:', e.message);
      }

      // Redirect based on role
      if (user.role === "super_admin") {
        navigate("/super-admin/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/"); // fallback for other roles
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler for Registration link
  const handleLoginRedirect = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Redirecting",
      text: "Navigating to Registration page...",
      icon: "info",
      timer: 2500,
      button: false,
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      navigate("/register");
    });
  };

  return (
    <div className={`login-outer-container ${styles["login-outer-container"]}`}>
      <div className={`login-inner-container bg-white p-4 rounded-1 shadow ${styles["login-inner-container"]}`}
        style={{ minWidth: 300, maxWidth: 400, width: "100%" }}>
        <div className="text-center mb-4">
          <img src={kyuLogo} alt="Kyambogo University Logo" style={{ width: 100, marginBottom: 0 }} />
          <h5 className="fw-bold" style={{ color: "#2563eb" }}>Campus Ballot</h5>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
            <input className="form-control" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group mb-2">
            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
            <input
              className="form-control"
              name="password"
              type={showPassword ? "text" : "password"} // Toggle password visibility
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              className="input-group-text" onClick={() => setShowPassword(!showPassword)} // Toggle state
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <div className="d-flex justify-content-end mb-3">
            <Link to="/forgot-password" className="small text-decoration-none" style={{ color: "#2563eb" }}>
              Forgot Password?
            </Link>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button className="btn btn-primary w-100 fw-bold" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="text-center mt-3">
          <span>Don't have an account? </span>
          <Link to="/register" className="fw-bold" style={{ color: "#2563eb" }} onClick={handleLoginRedirect}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;