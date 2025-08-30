import React from "react";
import { FaUserGraduate, FaUserCircle, FaBell, FaUserEdit, FaSignOutAlt } from "react-icons/fa";

const DashboardNavbar = ({ user, notifications, onProfile, onLogout }) => (
  <nav
    className="navbar navbar-expand-lg navbar-dark shadow-sm mb-4"
    style={{ background: "linear-gradient(90deg, #2563eb 0%, #1e293b 100%)" }}
  >
    <div className="container-fluid">
      <span className="navbar-brand d-flex align-items-center gap-2">
        <FaUserGraduate size={28} />
        <span className="fw-bold fs-4 d-none d-md-inline">Student Portal</span>
        <span className="fw-bold fs-5 d-md-none">Portal</span>
      </span>
      <div className="d-flex align-items-center gap-2">
        <div className="dropdown">
          <button className="btn btn-outline-light position-relative" data-bs-toggle="dropdown">
            <FaBell />
            {notifications?.filter(n => !n.read).length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>
        <div className="dropdown">
          <button className="btn btn-outline-light d-flex align-items-center gap-2" data-bs-toggle="dropdown">
            <FaUserCircle />
            <span className="d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={onProfile}>
                <FaUserEdit className="me-2" /> Edit Profile
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger" onClick={onLogout}>
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
);

export default DashboardNavbar;
