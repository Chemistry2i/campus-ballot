import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "../utils/axiosInstance";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faKey } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams, Link } from "react-router-dom";
import kyuLogo from "../assets/kyambogo-university-kyu-logo-png_seeklogo-550308.png";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams(); // expects route like /reset-password/:token

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      Swal.fire("Error", "Passwords do not match.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5000.app.github.dev/api/auth/reset-password/${token}`,
        { password }
        );
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
  };

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
      <div className="bg-white p-4 rounded-4 shadow" style={{ minWidth: 340, maxWidth: 400, width: "100%" }}>
        <div className="text-center mb-4">
          <img src={kyuLogo} alt="Kyambogo University Logo" style={{ width: 100, marginBottom: 0 }} />
          <h5 className="fw-bold" style={{ color: "#2563eb" }}>
            <FontAwesomeIcon icon={faKey} className="me-2" />
            Reset Password
          </h5>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
            <input
              className="form-control"
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <span
              className="input-group-text"
              onClick={() => setShowPassword((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
            <input
              className="form-control"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
            />
            <span
              className="input-group-text"
              onClick={() => setShowConfirm((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
            </span>
          </div>
          <button className="btn btn-primary w-100 fw-bold" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="text-center mt-3">
          <span>Back to </span>
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

export default ResetPassword;