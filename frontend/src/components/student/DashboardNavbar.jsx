import React from "react";
import { FaUserGraduate, FaUserCircle, FaBell, FaUserEdit, FaSignOutAlt } from "react-icons/fa";

const DashboardNavbar = ({ user, notifications, onProfile, onLogout }) => (
  <nav
    className="navbar navbar-expand-lg navbar-dark shadow-sm mb-0"
    style={{ background: "linear-gradient(90deg, red 0%, #1e293b 100%)", height: 56, padding: '0 0.75rem' }}
  >
    <div className="container-fluid">
      <span className="navbar-brand d-flex align-items-center gap-2 text-white" style={{color:'white', lineHeight: '56px' }}>
        <FaUserGraduate size={22} />
        <span className="fw-bold fs-5 d-none d-md-inline text-white" style={{color:'white'}}>Student Portal</span>
        <span className="fw-bold fs-6 d-md-none text-white" style={{color:'white'}}>Portal</span>
      </span>
      <div className="d-flex align-items-center gap-2">
        <div className="dropdown">
          <button className="btn btn-outline-light position-relative" data-bs-toggle="dropdown" style={{ padding: '6px 8px', fontSize: 14 }}>
            <FaBell size={18} />
            {notifications?.filter(n => !n.read).length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <ul className="dropdown-menu dropdown-menu-end mt-1">
            <li className="dropdown-header">Notifications</li>
            {/* add notification items here if needed */}
          </ul>
        </div>
        <div className="dropdown">
          <button className="btn btn-outline-light d-flex align-items-center gap-2" data-bs-toggle="dropdown" style={{ padding: '6px 10px', fontSize: 14 }}>
            <FaUserCircle size={18} />
            <span className="d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item py-2" onClick={onProfile}>
                <FaUserEdit className="me-2" /> Edit Profile
              </button>
            </li>
            <li><hr className="dropdown-divider my-1" /></li>
            <li>
              <button className="dropdown-item text-danger py-2" onClick={onLogout}>
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
