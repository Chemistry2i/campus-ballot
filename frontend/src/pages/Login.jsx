
import { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import useSocket from '../hooks/useSocket';
import kyuLogo from "../assets/kyambogo-university-kyu-logo-png_seeklogo-550308.png";
import RoleSelectionModal from '../components/common/RoleSelectionModal';

function Login({ setCurrentUser }) {
  const { reconnectWithToken } = useSocket();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Remove dark mode classes on mount
    const loginContainer = document.querySelector(`.${styles["login-inner-container"]}`);
    if (loginContainer) {
      loginContainer.classList.remove("bg-dark", "text-white");
    }

    // Remove dark mode classes from body when this component mounts
    document.body.classList.remove('admin-dark-mode');
    document.body.classList.remove('admin-light-mode');
    document.body.style.backgroundColor = '#f3f4f6';
    document.body.style.color = '#111827';
    
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle role selection from modal
  const handleRoleSelection = (selectedRole) => {
    setShowRoleModal(false);
    if (selectedRole === 'candidate') {
      navigate('/candidate');
    } else {
      navigate('/student-dashboard');
    }
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

      // Reconnect socket with new token
      try {
        reconnectWithToken(res.data.token);
      } catch (e) {
        console.warn('Socket reconnect failed:', e.message);
      }

      const user = res.data.user;
      
      // Check if user is a student with candidate role (show role selection modal)
      const isStudentCandidate = user.role === 'student' && 
                                  user.additionalRoles?.includes('candidate');

      if (isStudentCandidate) {
        // Show role selection modal instead of immediate redirect
        setLoggedInUser(user);
        Swal.fire({
          title: "Success",
          text: "Login successful!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => {
          setShowRoleModal(true);
        });
      } else {
        // Normal flow for other users
        Swal.fire({
          title: "Success",
          text: res.data.message + " Redirecting to your dashboard...",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => {
          if (user.role === "admin") {
            navigate("/admin");
          } else if (user.role === "super_admin") {
            navigate("/super-admin/system-health");
          } else if (user.role === "student") {
            navigate("/student-dashboard");
          } else if (user.role === "candidate") {
            navigate("/candidate");
          } else {
            navigate("/"); // fallback for other roles
          }
        });
      }
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
      className={`login-outer-container ${styles["login-outer-container"]}`}
    >
      <div className={`login-inner-container bg-white p-4 rounded-1 shadow ${styles["login-inner-container"]}`}
        style={{ minWidth: 300, maxWidth: 400, width: "100%" }}>
        {/* <h2 className="mb-4 text-center fw-bold" style={{ color: "#2563eb" }}>
          <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
          Login
        </h2> */}

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
              className="input-group-text"
              onClick={() => setShowPassword(!showPassword)} // Toggle state
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

      {/* Role Selection Modal for Student-Candidates */}
      {showRoleModal && loggedInUser && (
        <RoleSelectionModal 
          user={loggedInUser}
          onSelectRole={handleRoleSelection}
        />
      )}
    </div>
  );
}

export default Login;