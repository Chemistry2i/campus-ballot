import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import kyuLogo from "../assets/kyambogo-university-kyu-logo-png_seeklogo-550308.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();<h3 className="mb-4 text-center fw-bold" style={{ color: "#2563eb" }}>
          <FontAwesomeIcon icon={faKey} className="me-2" />
          Forgot Password
        </h3>

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://api.campusballot.tech/api/auth/forgot-password", { email });
      Swal.fire({
        title: "Success",
        text: res.data.message + " Redirecting to login page...",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        navigate("/login");
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };<h3 className="mb-4 text-center fw-bold" style={{ color: "#2563eb" }}>
          <FontAwesomeIcon icon={faKey} className="me-2" />
          Forgot Password
        </h3>

  // Handler for Login link
  const handleLoginRedirect = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Redirecting",
      text: "Navigating to login page...",
      icon: "info",
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      navigate("/login");
    });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", width: "100vw" }}
    >
      <div className="bg-white p-4 rounded-1 shadow" style={{ minWidth: 340, maxWidth: 400, width: "100%" }}>
        {/* <h3 className="mb-4 text-center fw-bold" style={{ color: "#2563eb" }}>
          <FontAwesomeIcon icon={faKey} className="me-2" />
          Forgot Password
        </h3> */}
        <div className="text-center mb-4">
          <img src={kyuLogo} alt="Kyambogo University Logo" style={{ width: 100, marginBottom: 0 }} />
          <h5 className="fw-bold" style={{ color: "#2563eb" }}>
            <FontAwesomeIcon icon={faKey} className="me-2" />
            Forgot Password
          </h5>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
            <input
              className="form-control"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100 fw-bold" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="text-center mt-3">
          <span>Remembered your password? </span>
          <Link
            to="/login"
            className="fw-bold"
            style={{ color: "#2563eb" }}
            onClick={handleLoginRedirect}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
