import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faKey } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams, Link } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
        `http://localhost:5000/api/auth/reset-password/${token}`,
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
        <h2 className="mb-4 text-center fw-bold" style={{ color: "#2563eb" }}>
          <FontAwesomeIcon icon={faKey} className="me-2" />
          Reset Password
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
            <input
              className="form-control"
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
            <input
              className="form-control"
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
            />
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