import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faPhone,
  faIdBadge,
  faBuilding,
  faBook,
  faVenusMars,
  faVoteYea,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, Link } from "react-router-dom";

// Sample data for faculties and courses
const facultyCourses = {
  Engineering: [
    "Computer Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
  ],
  Science: [
    "Information Systems",
    "Information Technology",
    "Biology",
    "Chemistry",
    "Physics",
  ],
  Business: [
    "Accounting",
    "Marketing",
    "Finance"
  ],
  // Add more faculties and courses as needed
};

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    studentId: "",
    faculty: "",
    course: "",
    yearOfStudy: "",
    gender: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false); // <-- Add this line

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "faculty") {
      setForm((f) => ({
        ...f,
        faculty: value,
        course: "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]: value,
      }));
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      form
    );
    Swal.fire({
      title: "Success",
      text: res.data.message + " Redirecting to login page...",
      icon: "success",
      timer: 2500, // 2.5 seconds
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      navigate("/login");
    });
  } catch (err) {
    Swal.fire(
      "Registration Failed",
      err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.",
      "error"
    );
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
      timer: 2500,
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      navigate("/login");
    });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ width: "100vw", minHeight: "100vh", backgroundColor: "#f3f4f6", fontFamily: " ''Arial, sans-serif" }}
    >
      <div
        className="register-container d-flex shadow-lg"
        style={{
          borderRadius: 10,
          background: "#fff",
          overflow: "hidden",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Left Panel */}
        <div
          className="register-left d-flex flex-column align-items-center justify-content-center text-white"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #2193b0 100%)",
            padding: "40px 30px",
            minWidth: 300,
            maxWidth: 350,
          }}
        >
          <FontAwesomeIcon icon={faVoteYea} size="3x" className="mb-4" />
          <h2 className="fw-bold mb-3">Welcome</h2>
          <p className="mb-4 text-center" style={{ opacity: 0.9 }}>
            Register to participate in the
            <br />
            University Voting System!
          </p>
          <button
            className="btn btn-light fw-bold px-4 "
            style={{ color: "#2563eb" }}
          >
            Go Back
          </button>
        </div>
        {/* Right Panel (Form) */}
        <div className="register-right flex-grow-1 p-5">
          <h3
            className="mb-4 fw-bold text-center"
            style={{ letterSpacing: 1, color: "#2563eb" }}
          >
            Registration Details
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <input
                    className="form-control"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <input
                    className="form-control"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <input
                    className="form-control"
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FontAwesomeIcon icon={faIdBadge} />
                  </span>
                  <input
                    className="form-control"
                    name="studentId"
                    placeholder="Student ID"
                    value={form.studentId}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group position-relative">
                  <span className="input-group-text bg-white">
                    <FontAwesomeIcon icon={faBuilding} />
                  </span>
                  <select
                    className="form-control"
                    name="faculty"
                    value={form.faculty}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Faculty</option>
                    {Object.keys(facultyCourses).map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y me-3"
                    style={{ pointerEvents: "none", zIndex: 2 }}
                  >
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="text-secondary"
                      style={{ fontSize: "0.8em" }}
                    />
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group position-relative">
                  <span className="input-group-text bg-white">
                    <FontAwesomeIcon icon={faBook} />
                  </span>
                  <select
                    className="form-control"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    required
                    disabled={!form.faculty}
                  >
                    <option value="">Select Course</option>
                    {form.faculty &&
                      facultyCourses[form.faculty].map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                  </select>
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y me-3"
                    style={{ pointerEvents: "none", zIndex: 2 }}
                  >
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="text-secondary"
                      style={{ fontSize: "0.8em" }}
                    />
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  {/* <span className="input-group-text bg-white"><FontAwesomeIcon icon={faBook} /></span> */}
                  <div className="input-group position-relative">
                    <span className="input-group-text bg-white">
                      <FontAwesomeIcon icon={faBook} />
                    </span>
                    <select
                      className="form-control"
                      name="yearOfStudy"
                      value={form.yearOfStudy}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Year of Study</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    <span
                      className="position-absolute end-0 top-50 translate-middle-y me-3"
                      style={{ pointerEvents: "none", zIndex: 2 }}
                    >
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-secondary"
                        style={{ fontSize: "0.8em" }}
                      />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  {/* <span className="input-group-text bg-white"><FontAwesomeIcon icon={faVenusMars} /></span> */}
                  <div className="input-group position-relative">
                    <span className="input-group-text bg-white">
                      <FontAwesomeIcon icon={faVenusMars} />
                    </span>
                    <select
                      className="form-control"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                    <span
                      className="position-absolute end-0 top-50 translate-middle-y me-3"
                      style={{ pointerEvents: "none", zIndex: 2 }}
                    >
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-secondary"
                        style={{ fontSize: "0.8em" }}
                      />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FontAwesomeIcon icon={faPhone} />
                  </span>
                  <input
                    className="form-control"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-4">
              <button
                className="btn btn-primary px-4 py-2 fw-bold w-100"
                type="submit"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
            <div className="text-center mt-3">
                <span>Already have an account? </span>
                <Link
                    to="/login"
                    className="fw-bold"
                    style={{ color: "#2563eb" }}
                    onClick={handleLoginRedirect}
                >
                    Login
                </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
