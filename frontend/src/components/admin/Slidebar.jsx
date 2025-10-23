import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios';
import { useRef, useState } from 'react';
import getImageUrl from '../../utils/getImageUrl';
import {
  faTachometerAlt,
  faUsers,
  faVoteYea,
  faUserTie,
  faChartBar,
  faSignOutAlt,
  faBell,
  faCog,
  faChartPie,
  faQuestionCircle,
  faBookOpen,
  faHistory,
  faPlusCircle,
  faUserCircle,
  faBullhorn,
} from "@fortawesome/free-solid-svg-icons";

function Sidebar({ user, navigate, onOpenCreateElection, onLogout }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePicture || '/default-avatar.png');
  const profileImgSrc = getImageUrl(profilePic);
  // Debug: log resolved image URL
  console.debug('[Slidebar] resolved profile image URL:', profileImgSrc);

  const onChooseFile = () => fileRef.current && fileRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('profilePicture', file);
      const res = await axios.put(`/api/users/${user._id}/photo`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.profilePicture) {
        setProfilePic(res.data.profilePicture);
      }
    } catch (err) {
      console.error('Upload error', err);
      // Optionally show user-facing error here
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="col-md-2 bg-white shadow-sm p-0 min-vh-100 d-flex flex-column justify-content-between">
      <div>
        <div className="p-4 border-bottom text-center">
          {/* User Avatar */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={profileImgSrc}
              alt="Admin"
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%' }}
              className="mb-2"
            />
            <button
              className="btn btn-sm btn-light position-absolute top-0 end-0"
              style={{ transform: 'translate(30%, -30%)' }}
              onClick={onChooseFile}
              title="Change profile picture"
              aria-label="Change profile picture"
            >
              {uploading ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
          <h4 className="fw-bold text-primary mt-2">Admin Panel</h4>
          <p className="mb-0 text-muted">{user?.name}</p>
          <span className="badge bg-success">{user?.role}</span>
          {/* Quick Action */}
          <div className="mt-3">
            <button
        className="btn btn-sm btn-primary w-100"
        onClick={onOpenCreateElection}
        aria-label="Create Election"
      >
        <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
        New Election
      </button>
          </div>
        </div>
        <ul className="nav flex-column p-2">
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin">
              <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/users">
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              Users
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/elections">
              <FontAwesomeIcon icon={faBullhorn} className="me-2" />
              Elections
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/candidates">
              <FontAwesomeIcon icon={faUserTie} className="me-2" />
              Candidates
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/results">
              <FontAwesomeIcon icon={faChartBar} className="me-2" />
              Results
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/logs">
              <FontAwesomeIcon icon={faHistory} className="me-2" />
              Logs
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/notifications">
              <FontAwesomeIcon icon={faBell} className="me-2" />
              Notifications
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/reports">
              <FontAwesomeIcon icon={faChartPie} className="me-2" />
              Reports
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/settings">
              <FontAwesomeIcon icon={faCog} className="me-2" />
              Settings
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/help">
              <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
              Help
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Sidebar Footer */}
      <div className="p-3 border-top text-center small text-muted">
        <FontAwesomeIcon icon={faBookOpen} className="me-1" />
        v1.0.0 &copy; 2025 VoteSys
        <button
          className="nav-link text-danger btn btn-link w-100 mt-2"
          onClick={onLogout ? onLogout : () => navigate("/login")}
          style={{ textAlign: "left" }}
          aria-label="Logout"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;