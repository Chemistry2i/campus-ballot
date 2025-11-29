import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
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

function Sidebar({ user, navigate, onOpenCreateElection, onLogout, collapsed, setCollapsed, isMobile }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePicture || '/default-avatar.png');
  const profileImgSrc = getImageUrl(profilePic);
  // Modal + preview upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // Counts for badges
  const [notificationCount, setNotificationCount] = useState(0);
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const [notifRes, logRes] = await Promise.all([
          axios.get('/api/notifications/count', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/logs/count', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setNotificationCount(notifRes.data.count || 0);
        setLogCount(logRes.data.count || 0);
      } catch (err) {
        console.error('Error fetching counts', err);
        // Optionally set to 0 or show error
      }
    };
    fetchCounts();
  }, []);

  const onChooseFile = () => {
    setShowUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewUrl(null);
    }
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('profilePicture', selectedFile);
      const res = await axios.put(`/api/users/${user._id}/photo`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.profilePicture) {
        setProfilePic(res.data.profilePicture);
        // notify parent if provided
        if (typeof onProfileUpdated === 'function') {
          try { onProfileUpdated({ ...user, profilePicture: res.data.profilePicture }); } catch (e) {}
        }
        // update localStorage user if present
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.profilePicture = res.data.profilePicture;
            localStorage.setItem('user', JSON.stringify(parsed));
          }
        } catch (e) {}
      }
      setShowUploadModal(false);
      setSelectedFile(null);
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    } catch (err) {
      console.error('Upload error', err);
      alert(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
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
              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }}
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
            {/* hidden input for fallback */}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          </div>

          {/* Upload modal */}
          {showUploadModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-sm modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Upload profile picture</h5>
                    <button type="button" className="btn-close" onClick={handleCancelUpload}></button>
                  </div>
                  <div className="modal-body text-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <div className="mb-3 text-muted">No file selected</div>
                    )}
                    <div className="mt-3">
                      <input className="form-control" type="file" accept="image/*" onChange={handleFileSelect} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" type="button" onClick={handleCancelUpload}>Cancel</button>
                    <button className="btn btn-primary" type="button" onClick={handleSaveUpload} disabled={uploading || !selectedFile}>{uploading ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!collapsed && (
            <>
              <h4 className="fw-bold text-primary mt-2">Admin Panel</h4>
              <p className="mb-0 text-muted">
                Welcome, {user?.name}
              </p>
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
            </>
          )}
        </div>
        <ul className="nav flex-column p-2">
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin" title={collapsed ? 'Dashboard' : undefined}>
              <FontAwesomeIcon icon={faTachometerAlt} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/users" title={collapsed ? 'Users' : undefined}>
              <FontAwesomeIcon icon={faUsers} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Users</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/elections" title={collapsed ? 'Elections' : undefined}>
              <FontAwesomeIcon icon={faBullhorn} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Elections</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/candidates" title={collapsed ? 'Candidates' : undefined}>
              <FontAwesomeIcon icon={faUserTie} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Candidates</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/results" title={collapsed ? 'Results' : undefined}>
              <FontAwesomeIcon icon={faChartBar} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Results</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/logs" title={collapsed ? 'Logs' : undefined}>
              <FontAwesomeIcon icon={faHistory} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Logs</span>
              {/* Logs badge */}
              {logCount > 0 && !collapsed && (
                <span className="badge bg-danger ms-auto" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {logCount}
                </span>
              )}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/notifications" title={collapsed ? 'Notifications' : undefined}>
              <FontAwesomeIcon icon={faBell} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Notifications</span>
              {/* Notifications badge */}
              {notificationCount > 0 && !collapsed && (
                <span className="badge bg-danger ms-auto" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {notificationCount}
                </span>
              )}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/reports" title={collapsed ? 'Reports' : undefined}>
              <FontAwesomeIcon icon={faChartPie} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Reports</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/settings" title={collapsed ? 'Settings' : undefined}>
              <FontAwesomeIcon icon={faCog} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Settings</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link d-flex align-items-center" to="/admin/help" title={collapsed ? 'Help' : undefined}>
              <FontAwesomeIcon icon={faQuestionCircle} className="me-2" style={{ fontSize: collapsed ? '1.5rem' : '1rem' }} />
              <span>Help</span>
            </NavLink>
          </li>
        </ul>
        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="sidebar-footer p-3 border-top text-center small text-muted mt-auto">
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
        )}
        <style>{`
          .admin-sidebar { background: #fff; border-right: 1px solid #eee; }
          .admin-sidebar.collapsed .sidebar-header .fw-bold,
          .admin-sidebar.collapsed .sidebar-header .mb-0,
          .admin-sidebar.collapsed .sidebar-header .badge,
          .admin-sidebar.collapsed .sidebar-header .mt-3,
          .admin-sidebar.collapsed .sidebar-footer {
            display: none !important;
          }
          .admin-sidebar.collapsed .nav-link span {
            display: none;
          }
          .admin-sidebar.collapsed .nav-link {
            padding: 0.85rem 0.5rem;
            justify-content: center;
          }
          .admin-sidebar-overlay {
            display: none;
          }
          .admin-sidebar-overlay.show {
            display: block;
          }
          @media (max-width: 992px) {
            .admin-sidebar {
              left: ${collapsed ? '-280px' : '0'} !important;
              min-width: ${collapsed ? '64px' : '280px'} !important;
              width: ${collapsed ? '64px' : '280px'} !important;
              transition: left 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s, width 0.3s;
            }
            .admin-sidebar-overlay {
              display: ${collapsed ? 'none' : 'block'};
            }
          }
        `}</style>
      </aside>
      {/* Floating button to open sidebar when collapsed on mobile */}
      {isMobile && collapsed && (
        <button
          className="btn btn-primary"
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 102,
            borderRadius: '50%',
            width: 48,
            height: 48,
            boxShadow: '0 2px 8px rgba(37,99,235,0.15)'
          }}
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      )}
    </>
  );
}

export default Sidebar;
