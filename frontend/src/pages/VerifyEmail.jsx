// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import Swal from "sweetalert2";

// function VerifyEmail() {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const [verifying, setVerifying] = useState(false);

//   const handleVerify = async () => {
//     setVerifying(true);
//     try {
//       const res = await axios.get(`https://campus-ballot-backend.onrender.com/api/auth/verify/${token}`);
//       Swal.fire("Success", res.data.message, "success");
//       setTimeout(() => {
//         navigate("/login");
//       }, 2500);
//     } catch (err) {
//       Swal.fire("Error", err.response?.data?.message || "Verification failed", "error");
//     } finally {
//       setVerifying(false);
//     }
//   };

//   return (
//     <div
//     className="d-flex align-items-center justify-content-center"
//     style={{ minHeight: "100vh", width:"100vw", background: "#f3f4f6" }}
//   >
//     <div className="container p-4 bg-white rounded-4 shadow" style={{ maxWidth: 400 }}>
//       <h2 className="text-center mb-3">Email Verification</h2>
//       <p className="text-center">Click the button below to verify your email.</p>
//       <div className="d-flex justify-content-center">
//         <button
//           className="btn btn-primary fw-bold"
//           onClick={handleVerify}
//           disabled={verifying}
//         >
//           {verifying ? "Verifying..." : "Verify Email"}
//         </button>
//       </div>
//     </div>
//   </div>
//   );
// }

// export default VerifyEmail;


import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await axios.get(`https://campus-ballot-backend.onrender.com/api/auth/verify/${token}`);
      Swal.fire("Success", res.data.message, "success");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Verification failed";
      
      // Show resend button if token is expired or invalid
      if (errorMessage.toLowerCase().includes("expired") || 
          errorMessage.toLowerCase().includes("invalid") ||
          err.response?.status === 400) {
        setShowResend(true);
      }
      
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    const { value: email } = await Swal.fire({
      title: 'Enter your email',
      input: 'email',
      inputLabel: 'Email address',
      inputPlaceholder: 'Enter your email address',
      showCancelButton: true,
      confirmButtonText: 'Send Reset Link',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter an email address!';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address!';
        }
      }
    });

    if (email) {
      setResending(true);
      try {
        const res = await axios.post('https://campus-ballot-backend.onrender.com/api/auth/resend-verification', {
          email: email
        });
        
        // SweetAlert notification that reset link has been sent
        await Swal.fire({
          title: 'Reset Link Sent!',
          text: res.data.message || `A new verification link has been sent to ${email}. Please check your inbox and spam folder.`,
          icon: 'success',
          confirmButtonText: 'Got it!',
          timer: 5000,
          timerProgressBar: true
        });
        
        setShowResend(false);
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || "Failed to send verification email", "error");
      } finally {
        setResending(false);
      }
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
        <div className="d-flex flex-column gap-2 align-items-center">
          <button
            className="btn btn-primary fw-bold"
            onClick={handleVerify}
            disabled={verifying || resending}
          >
            {verifying ? "Verifying..." : "Verify Email"}
          </button>
          
          {showResend && (
            <div className="text-center mt-3">
              <p className="text-muted small mb-2">
                Link expired or invalid?
              </p>
              <button
                className="btn btn-outline-secondary btn-sm fw-bold"
                onClick={handleResendVerification}
                disabled={verifying || resending}
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;