import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/verify/${token}`);
      Swal.fire("Success", res.data.message, "success");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Verification failed", "error");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
    className="d-flex align-items-center justify-content-center"
    style={{ minHeight: "100vh", width:"100vw", background: "#f3f4f6" }}
  >
    <div className="container p-4 bg-white rounded-4 shadow" style={{ maxWidth: 400 }}>
      <h2 className="text-center mb-3">Email Verification</h2>
      <p className="text-center">Click the button below to verify your email.</p>
      <div className="d-flex justify-content-center">
        <button
          className="btn btn-primary fw-bold"
          onClick={handleVerify}
          disabled={verifying}
        >
          {verifying ? "Verifying..." : "Verify Email"}
        </button>
      </div>
    </div>
  </div>
  );
}

export default VerifyEmail;