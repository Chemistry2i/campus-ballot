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
//       const res = await axios.get(`https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5000.app.github.dev/api/auth/verify/${token}`);
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheck, faSyncAlt, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await axios.get(`https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5000.app.github.dev/api/auth/verify/${token}`);
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
        const res = await axios.post('https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5000.app.github.dev/api/auth/resend-verification', {
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
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: "450px",
          width: "100%",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          animation: "slideUp 0.5s ease-out"
        }}
      >
        {/* Header Section */}
        <div
          style={{
            background: "#667eea",
            padding: "40px 30px",
            textAlign: "center",
            color: "white"
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "700" }}>
            Verify Your Email
          </h2>
          <p style={{ margin: "0", fontSize: "14px", opacity: "0.9" }}>
            Confirm your email address to continue
          </p>
        </div>

        {/* Content Section */}
        <div style={{ padding: "40px 30px" }}>
          <p
            style={{
              textAlign: "center",
              color: "#555",
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "30px"
            }}
          >
            Click the button below to verify your email address and activate your account.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={handleVerify}
              disabled={verifying || resending}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: verifying || resending ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                opacity: verifying || resending ? "0.6" : "1",
                transform: verifying || resending ? "scale(1)" : "scale(1)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
              }}
              onMouseOver={(e) => {
                if (!verifying && !resending) {
                  e.target.style.background = "#5568d3";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#667eea";
                e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
              }}
            >
              {verifying ? (
                <>
                  <FontAwesomeIcon 
                    icon={faSyncAlt}
                    style={{
                      marginRight: "8px",
                      animation: "spin 0.8s linear infinite"
                    }}
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: "8px" }} />
                  Verify Email Address
                </>
              )}
            </button>

            {showResend && (
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e0e0e0",
                  animation: "fadeIn 0.4s ease-out"
                }}
              >
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#999",
                    marginBottom: "15px"
                  }}
                >
                  Link expired or invalid?
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={verifying || resending}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    background: "transparent",
                    color: "#667eea",
                    border: "2px solid #667eea",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: verifying || resending ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    opacity: verifying || resending ? "0.6" : "1"
                  }}
                  onMouseOver={(e) => {
                    if (!verifying && !resending) {
                      e.target.style.background = "#667eea";
                      e.target.style.color = "white";
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#667eea";
                  }}
                >
                  {resending ? (
                    <>
                      <FontAwesomeIcon 
                        icon={faSyncAlt}
                        style={{
                          marginRight: "6px",
                          animation: "spin 0.8s linear infinite"
                        }}
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: "6px" }} />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#f0f4ff",
              border: "1px solid #d0deff",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#555",
              lineHeight: "1.5",
              textAlign: "center"
            }}
          >
            <strong style={{ color: "#667eea" }}>
              <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: "6px" }} />
              Check your inbox
            </strong>
            <br />
            If you don't see the verification link, please check your spam folder.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 600px) {
          div[style*="padding: 40px 30px"] {
            padding: 30px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default VerifyEmail;