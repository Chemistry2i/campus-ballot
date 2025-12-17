import { useState, useEffect } from "react";
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
  faEyeSlash,
  faEye
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Register.module.css";
import { useNavigate, Link } from "react-router-dom";
import kyuLogo from "../assets/kyambogo-university-kyu-logo-png_seeklogo-550308.png";

// Sample data for faculties and courses
const facultyCourses = {
  "Computing and Information Science": [
    "Information Systems",
    "Information Technology and Computing",
    "Library and Information Science"
  ],
  Engineering: [ 
    "Electrical Engineering",
    "Mechanical and Manufacturing Engineering",
    "Oil and Gas Production",
    "Chemical and Process Engineering",
    "Building and Civil Engineering",
    "Telecommunication Engineering",
    "Environmental Engineering and Management",
    "Automotive and Power Engineering",
    "Industrial Engineering and Management",
    "Mechatronics and Biomedical Engineering",
    "Water Engineering",
    "Refrigeration and Air Conditioning",
    "Biomedical Engineering",
    "Computer Engineering",


  ],
  Science: [
    "Leather Tanning Technology",
    "Science Technology - Physics",
    "Science Technology - Chemistry",
    "Science Technology - Biology",
    "Food Science and Processing Technology",
    "Textile and Clothing Technology",
    "Statistics",
    "Material and Ceramic Science Technology",
    "Sports and Leisure Management",
    "Environmental Science Technology and Management",
    "Education (Biological Sciences)",
    "Education (Economics)",
    "Education (Physical Sciences)",
    "Sports and Exercise Instruction",
    "Food Processing Technology"
  ],
  "Management & Entrepreneurship": [
    "Business Studies with Education",
    "Business Administration",
    " Science in Accounting and Finance",
    "Administrative Science",
    "Procurement and Logistics Management",
    "Management Science",
    "Banking and Microfinance"
  ],
  "Arts and Humanities": [
    "Arts in Humanitites ",
    "Arts with Education",
    "Performing Arts ",
    "Cultural Heritage Studies",
    "Archeology and Heritage Management",
    "Ethics and Human Rights",
    ""
  ],
  "Social Sciences": [
    "Guidance and Counselling",
    "Arts in Economics ",
    "Demography & Reproductive Health",
    "Development Studies",
    "Public Administration and Resource Governance",
    "Arts in Social Sciences",
    "Social Work and Social Administration",
    "Art in Security and Diplomatic Studies",
    "Economics and Statistics"
  ],
  "Built Environment": [
    "Architecture",
    "Surveying and Land Information Systems",
    "Science in Building Economics",
    "Science in Land Economics"
  ],
  "Agriculture":[
    "Vocational Studies in Agriculture with Education"
  ],
  "Art and Industrial Design": [
    "Art and Industrial Design",
    "Interior and Landscape Design ",
    "Textile and Apparel Design",
    "Computer and Graphic Design",
    "Art and Design with Education",
    "Fine Art",
    "Interior Design",
    "Textiles Design and Surface Design"
  ],
  "Education":[
    "Pre-Primary Education"
  ],
  "Special Needs & Rehabilitation":[
    "Adult and Community Education",
    "Community Development and Social Justice",
    "Community Based Rehabilitation",
    "Sign Language Interpreting",
    "Mobility and Rehabilitation"
  ],
  "Vocational Studies":[
    "Vocational Studies in Home Economics with Education",
    "Science in Human Nutrition and Dietetics",
    "Hotel and Institutional Catering",
    "Fashion and Cosmetology",
    "Fashion and Apparel Design"
  ]
  //We shall add more faculties and courses as needed
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
  const [loading, setLoading] = useState(false);

  // Remove dark mode classes from body when this component mounts
  useEffect(() => {
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
    const { name, value } = e.target;
    if (name === "faculty") {
      setForm((f) => ({
        ...f,
        faculty: value,
        course: "",
      }));
    } else if (name === 'studentId') {
      // sanitize to digits only and always sync the institutional email for students
      setForm((f) => {
        const digitsOnly = (value || '').replace(/\D/g, '');
        const next = { ...f, studentId: digitsOnly };
        try {
          if (f.role === 'student') {
            next.email = `${digitsOnly}@std.kyu.ac.ug`;
          }
        } catch (err) {
          // ignore
        }
        return next;
      });
    } else {
      setForm((f) => ({
        ...f,
        [name]: value,
      }));
    }
  };

  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  // If registering as a student, enforce institutional email format
  if (form.role === 'student') {
    const studentId = (form.studentId || '').trim();
    if (!studentId) {
      Swal.fire('Missing student ID', 'Please provide your student number before registering.', 'warning');
      return;
    }

    // If email is empty, auto-fill with studentId@std.kyu.ac.ug
    if (!form.email || form.email.trim() === '') {
      form.email = `${studentId}@std.kyu.ac.ug`;
    }

    const parts = (form.email || '').split('@');
    if (parts.length !== 2) {
      Swal.fire('Invalid email', 'Please provide a valid institutional email like 2400812450@std.kyu.ac.ug', 'error');
      return;
    }
    const [local, domain] = parts;
    if (domain.toLowerCase() !== 'std.kyu.ac.ug') {
      Swal.fire('Invalid domain', 'Student email must use the @std.kyu.ac.ug domain.', 'error');
      return;
    }
    if (local !== studentId) {
      Swal.fire('Mismatch', 'The student number in the email must match the Student ID you entered.', 'error');
      return;
    }
  }

  setLoading(true);
  try {
    const res = await axios.post(
      "https://campus-ballot-backend.onrender.com/api/auth/register",
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

  // useEffect to remove dark mode classes on mount
  useEffect(() => {
    document.body.classList.remove("dark-mode");
    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, []);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ width: "100vw", minHeight: "100vh", backgroundColor: "#f3f4f6", fontFamily: " ''Arial, sans-serif" }}
    >
      <div
        className={`register-container d-flex shadow-lg ${styles["register-container"]}`}
        style={{
          borderRadius: 7,
          background: "#fff",
          overflow: "hidden",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Left Panel */}
        <div
          className={`register-left d-flex flex-column align-items-center justify-content-center text-white ${styles["register-left"]}`}
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #2193b0 100%)",
            // backgroundColor: "#003366",
            padding: "40px 30px",
            minWidth: 300,
            maxWidth: 350,
          }}
        >
          <img src={kyuLogo} alt="Kyambogo University" style={{ height: 120, width: 120, marginBottom: 0 }} />
          <h6 className="fw-bold mb-3">Welcome to Campus Ballot</h6>
          <p className="mb-4 text-center" style={{ opacity: 0.9 }}>
            Register to participate in the
            <br />
            University Voting System!
          </p>
          <Link
            to="/"
            className="btn btn-light fw-bold px-4 mb-3"
            style={{ color: "#2563eb", marginBottom: 24 }}
          >
            Go Back
          </Link>
        </div>
        {/* Right Panel (Form) */}
  <div className={`register-right flex-grow-1 p-5 ${styles["register-right"]}`}> 
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
      <FontAwesomeIcon icon={faLock} />
    </span>
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
                      style={{fontSize: '.8em'}}
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
                      placeholder="Email (e.g. 2400800000@std.kyu.ac.ug)"
                      value={form.email}
                      onChange={handleChange}
                      required
                      readOnly={form.role === 'student'}
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
                    // style={{ fontSize: ".8em" }}
                    id="mySelect"
                  >
                    <option value="" id="myOption">Select Faculty</option>
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
            <div className="mt-4">
              <button
                className="btn btn-primary px-4 py-2 fw-bold w-100"
                type="submit"
                disabled={loading}
                style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
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
