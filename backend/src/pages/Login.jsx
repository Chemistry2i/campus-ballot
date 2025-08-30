import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

function Login({ setCurrentUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      // Save user and token to localStorage
      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      // Update App state if setCurrentUser is provided
      if (setCurrentUser) setCurrentUser(res.data.user);

      // Show success and redirect based on role
      Swal.fire({
        title: "Success",
        text: res.data.message + " Redirecting to your dashboard...",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else if (res.data.user.role === "student") {
          navigate("/student-dashboard");
        } else {
          navigate("/"); // fallback for other roles
        }
      });
    } catch (err) {
      Swal.fire(
        "Login Failed",
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
        "error"
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
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      navigate("/register");
    });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", width: "100vw", backgroundColor: "#f3f4f6" }}
    >
      <div className="bg-white p-4 rounded-4 shadow" style={{ minWidth: 340, maxWidth: 400, width: "100%" }}>
        <h2 className="mb-4 text-center fw-bold" style={{ color: "#2563eb" }}>
          <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
            <input className="form-control" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group mb-2">
            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
            <input className="form-control" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="d-flex justify-content-end mb-3">
            <Link to="/forgot-password" className="small text-decoration-none" style={{ color: "#2563eb" }}>
              Forgot Password?
            </Link>
          </div>
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